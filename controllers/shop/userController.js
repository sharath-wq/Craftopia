const asyncHandler = require("express-async-handler");

/**
 * Wishlist Page Route
 * Method GET
 */
exports.wishlistpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/wishlist", { title: "Wishlist", page: "wishlist" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Profile Page Route
 * Method GET
 */
exports.profilepage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/profile", { title: "Profile", page: "profile" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Address Page Route
 * Method GET
 */
exports.addresspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/address", { title: "Address", page: "address" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Address Page Route
 * Method GET
 */
exports.addAddresspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/add-address", { title: "Add Address", page: "add-address" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/checkout", { title: "Checkout", page: "checkout" });
    } catch (error) {
        throw new Error(error);
    }
});
