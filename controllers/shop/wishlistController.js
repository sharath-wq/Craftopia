const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const User = require("../../models/userModel");
const Product = require("../../models/productModel");

/**
 * Wishlist Page Route
 * Method GET
 */
exports.wishlistpage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).populate("wishlist");
        const populatedWishlist = await Product.populate(user.wishlist, { path: "images" });
        const messages = req.flash();
        res.render("shop/pages/user/wishlist", { title: "Wishlist", page: "wishlist", populatedWishlist, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add To Wishlist Route
 * Method POST
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.id;
        validateMongoDbId(productId);

        const user = await User.findByIdAndUpdate(userId, {
            $addToSet: { wishlist: productId },
        });

        req.flash("success", "Item added to wishlist");
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Remove From Wishlist Route
 * Method POST
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.id;
        validateMongoDbId(productId);

        const user = await User.findByIdAndUpdate(userId, {
            $pull: { wishlist: productId },
        });

        req.flash("warning", "Item removed");
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});
