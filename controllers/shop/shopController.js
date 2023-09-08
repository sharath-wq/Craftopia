const asyncHandler = require("express-async-handler");

/**
 * Landing Page Route
 * Method GET
 */
exports.shopHomepage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/index", { title: "Craftopia", page: "home" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Contact Page Route
 * Method GET
 */
exports.contactpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/contact", { title: "Contacts", page: "contact" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * About Page Route
 * Method GET
 */
exports.aboutpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/about", { title: "About", page: "about" });
    } catch (error) {
        throw new Error(error);
    }
});
