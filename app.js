// Import required modules and libraries
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const connectDatabase = require("./config/db");
const session = require("express-session");
const connectFlash = require("connect-flash");
const connectMongo = require("connect-mongo");
const passport = require("passport");
const mongoose = require("mongoose"); // No need for destructuring
const methodOverride = require("method-override");
const nocache = require("nocache");

// Import authentication and authorization middleware
const { ensureAdmin, ensureSuperAdmin, isBlockedAdmin } = require("./middlewares/authMiddleware");
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();

// Connect to the database
connectDatabase();

// Set the port
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(nocache());

const MongoStore = connectMongo(session);
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
        },
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// Serve static files
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "/public/admin"));
app.use("/shop", express.static(__dirname + "/public/shop"));
app.use(morgan("dev"));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");

// Set user data in res.locals for EJS templates
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Flash messages middleware
app.use(connectFlash());

// Set the view engine and layout
app.use(expressLayouts);
app.set("view engine", "ejs");

// Shop Routes
const shopRoute = require("./routes/shop/shopRouter");
const shopAuthRoute = require("./routes/shop/authRoutes");
const userRoute = require("./routes/shop/userRoutes");
const userorderRoute = require("./routes/shop/orderRoutes");

app.use("/", shopRoute);
app.use("/auth", shopAuthRoute);
app.use("/user", ensureLoggedIn({ redirectTo: "/auth/login" }), userRoute);
app.use("/orders", ensureLoggedIn({ redirectTo: "/auth/login" }), userorderRoute);

// Admin Routes
const adminRoute = require("./routes/admin/adminRoutes");
const productRoute = require("./routes/admin/productsRoute");
const categoryRoute = require("./routes/admin/categoryRoute");
const bannerRoute = require("./routes/admin/bannerRoutes");
const customerRoute = require("./routes/admin/customerRoutes");
const couponRoute = require("./routes/admin/couponRoutes");
const adminAuthRoute = require("./routes/admin/authRoute");
const orderRoute = require("./routes/admin/ordersRoute");
const superAdminRoute = require("./routes/admin/superAdminRoute");

app.use("/admin/auth", adminAuthRoute);
app.use("/admin/products", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, productRoute);
app.use("/admin/category", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, categoryRoute);
app.use("/admin/banners", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, bannerRoute);
app.use(
    "/admin/customers",
    ensureLoggedIn({ redirectTo: "/admin/auth/login" }),
    ensureAdmin,
    isBlockedAdmin,
    customerRoute
);
app.use("/admin/coupons", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, couponRoute);
app.use("/admin/orders", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, orderRoute);
app.use(
    "/admin/admins",
    ensureLoggedIn({ redirectTo: "/admin/auth/login" }),
    ensureSuperAdmin,
    isBlockedAdmin,
    superAdminRoute
);
app.use("/admin", ensureLoggedIn({ redirectTo: "/admin/auth/login" }), ensureAdmin, isBlockedAdmin, adminRoute);

// Catch-all route for 404 errors
app.use((req, res) => {
    res.render("shop/pages/404", { title: "404", page: "404" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server Started 🚀 http://localhost:${PORT}`);
});
