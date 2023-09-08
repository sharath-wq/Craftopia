const asyncHandler = require("express-async-handler");

/**
 * Shop page Route
 * Method GET
 */
exports.shoppage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/products/shop", { title: "Shop", page: "shop" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Single Prodcut page Route
 * Method GET
 */
exports.singleProductpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/products/product", { title: "Product", page: "product" });
    } catch (error) {
        throw new Error(error);
    }
});
