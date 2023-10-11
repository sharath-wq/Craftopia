const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const connectDatabase = require("./config/db");
const session = require("express-session");
const connectFlash = require("connect-flash");
const connectMongo = require("connect-mongo");
const passport = require("passport");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const nocache = require("nocache");
const { initializeFirebase } = require("./utils/firebase");
const { scheduleOrderItemUpdateJob } = require("./utils/sheducler");

const Category = require("./models/categoryModel");
const Cart = require("./models/cartModeal");

// Import authentication and authorization middleware
const {
    ensureAdmin,
    ensureSuperAdmin,
    isBlockedAdmin,
    ensureUser,
    isBlockedUser,
} = require("./middlewares/authMiddleware");
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();

// Connect to the database
connectDatabase();
initializeFirebase();
scheduleOrderItemUpdateJob();

// Firebase Initalization

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

app.use(async (req, res, next) => {
    const categories = await Category.find({ isListed: true });
    if (req?.user?.role === roles.user) {
        const cart = await Cart.find({ user: req.user.id });
        if (cart && cart.length > 0) {
            res.locals.cartCount = cart[0].products.length;
        } else {
            res.locals.cartCount = 0;
        }
    }
    res.locals.categories = categories;
    res.locals.user = req.user;
    next();
});

// Flash messages middleware
app.use(connectFlash());

// Set the view engine and layout
app.use(expressLayouts);
app.set("view engine", "ejs");

// Admin Routes
const adminRoute = require("./routes/admin/admin.route");
const productRoute = require("./routes/admin/products.route");
const categoryRoute = require("./routes/admin/category.route");
const bannerRoute = require("./routes/admin/banner.route");
const customerRoute = require("./routes/admin/customer.route");
const couponRoute = require("./routes/admin/coupon.rotue");
const adminAuthRoute = require("./routes/admin/auth.route");
const orderRoute = require("./routes/admin/orders.route");
const superAdminRoute = require("./routes/admin/superAdmin.route");

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

// Shop Routes
const shopRoute = require("./routes/shop/shop.route");
const shopAuthRoute = require("./routes/shop/auth.route");
const userRoute = require("./routes/shop/user.route");
const userorderRoute = require("./routes/shop/order.route");
const cartRoute = require("./routes/shop/cart.route");
const wishlistRoute = require("./routes/shop/wishlist.route");
const checkoutRoute = require("./routes/shop/checkout.route");

const { roles } = require("./utils/constants");

app.use("/", ensureUser, shopRoute);
app.use("/auth", shopAuthRoute);
app.use("/user", ensureLoggedIn({ redirectTo: "/auth/login" }), isBlockedUser, userRoute);
app.use("/orders", ensureLoggedIn({ redirectTo: "/auth/login" }), isBlockedUser, userorderRoute);
app.use("/cart", ensureLoggedIn({ redirectTo: "/auth/login" }), isBlockedUser, cartRoute);
app.use("/wishlist", ensureLoggedIn({ redirectTo: "/auth/login" }), isBlockedUser, wishlistRoute);
app.use("/checkout", ensureLoggedIn({ redirectTo: "/auth/login" }), isBlockedUser, checkoutRoute);

// Catch-all route for 404 errors
app.use((req, res) => {
    res.render("shop/pages/404", { title: "404", page: "404" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server Started 🚀 http://localhost:${PORT}`);
});
