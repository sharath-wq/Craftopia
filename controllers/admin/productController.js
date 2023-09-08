const asyncHandler = require("express-async-handler");

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/product/products", { title: "Products" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addProductpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/product/add-product", { title: "Add Products" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Product Page Route
 * Method GET
 */
exports.editProductpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/product/edit-product", { title: "Edit Products" });
    } catch (error) {
        throw new Error(error);
    }
});
