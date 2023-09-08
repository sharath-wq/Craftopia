const asyncHandler = require("express-async-handler");

/**
 * Manage Category Page Route
 * Method GET
 */
exports.categoriespage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/category/categories", { title: "Categories" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addCategorypage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/category/add-category", { title: "Add Category" });
    } catch (error) {
        throw new Error(error);
    }
});
