const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Shop page Route
 * Method GET
 */
exports.shoppage = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isListed: true }).populate("images").exec();
        res.render("shop/pages/products/shop", { title: "Shop", page: "shop", products });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Single Prodcut page Route
 * Method GET
 */
exports.singleProductpage = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const products = await Product.find().limit(3).populate("images").exec();
        const product = await Product.findById(id).populate("images").exec();
        res.render("shop/pages/products/product", { title: "Product", page: "product", products, product });
    } catch (error) {
        throw new Error(error);
    }
});
