const asyncHandler = require("express-async-handler");

/**
 * Manage Banner Page Route
 * Method GET
 */
exports.bannerspage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/banner/banners", { title: "Banners" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addBannerpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/banner/add-banner", { title: "Add Banners" });
    } catch (error) {
        throw new Error(error);
    }
});
