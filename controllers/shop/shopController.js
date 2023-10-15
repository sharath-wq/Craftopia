const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const Product = require("../../models/productModel");
const shuffleArray = require("../../utils/shuffleProducts");
const Banner = require("../../models/bannerModel");

/**
 * Landing Page Route
 * Method GET
 */
exports.shopHomepage = asyncHandler(async (req, res) => {
    try {
        const banners = await Banner.find({ end_date: { $gt: Date.now() } })
            .limit(2)
            .sort({ _id: -1 });
        const messages = req.flash();
        const products = await Product.find({ isListed: true, isDeleted: false }).populate("images").limit(10).exec();
        shuffleArray(products);
        const PopularProducts = await Product.find().sort({ sold: -1 }).populate("images").limit(10).exec();
        res.render("shop/pages/index", { title: "Craftopia", page: "home", products, messages, PopularProducts, banners });
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
