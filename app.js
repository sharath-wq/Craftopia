const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const connectDatabase = require("./config/db");
const createHttpError = require("http-errors");
const session = require("express-session");
const connectFlash = require("connect-flash");
const connectMongo = require("connect-mongo");
const passport = require("passport");
const { default: mongoose } = require("mongoose");
const methodOverride = require("method-override");
const nocache = require("nocache");

require("dotenv").config();

connectDatabase();

const app = express();
require("dotenv");

// Port
const PORT = process.env.PORT || 4000;

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
            // secure: true
            httpOnly: true,
        },
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);

// Static Files
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "public/admin"));
app.use("/shop", express.static(__dirname + "public/shop"));
app.use(morgan("dev"));

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(connectFlash());

// Template View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Routes
const shopRoute = require("./routes/shop/shopRouter");
const adminRoute = require("./routes/admin/adminRoutes");

app.use("/", shopRoute);
app.use("/admin", adminRoute);

app.use((req, res) => {
    res.render("shop/pages/404", { title: "404", page: "404" });
});

app.listen(PORT, () => console.log(`Server running @ http://localhost:${PORT}`));
