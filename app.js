const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const app = express();
require("dotenv");

// Port
const PORT = process.env.PORT || 4000;

// Static Files
app.use(express.static("public"));
app.use("/admin", express.static(__dirname + "public/admin"));
app.use("/shop", express.static(__dirname + "public/shop"));
app.use(morgan("dev"));

// Template View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");

// Routes
const shopRoute = require("./routes/shop/shopRouter");
const adminRoute = require("./routes/admin/adminRoutes");

app.use("/", shopRoute);
app.use("/admin", adminRoute);

app.get("*", (req, res) => {
    res.render("404", { title: "404", page: "404" });
});

app.listen(PORT, () => console.log(`Server running @ http://localhost:${PORT}`));
