const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");

require("dotenv").config();
const connectDatabase = require("./config/db");

const shopRoute = require("./routes/shop/shopRouter");
const adminRoute = require("./routes/admin/adminRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Database Connection
connectDatabase();

// Port
const PORT = process.env.PORT;

// Static Files
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "public/admin"));
app.use("/shop", express.static(__dirname + "public/shop"));
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Template View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Routes
app.use("/", shopRoute);
app.use("/admin", adminRoute);

app.get("/*", (req, res) => {
    res.render("shop/pages/404", { title: "404 Page", page: "404" });
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running @ http://localhost:${PORT}`));
