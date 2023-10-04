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
exports.toggleWishlist = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const productId = req.params.id;
        validateMongoDbId(productId);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found", status: "error" });
        }

        const isInWishlist = user.wishlist.includes(productId);

        if (isInWishlist) {
            user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
            await user.save();
            res.json({ message: "Product removed from wishlist", status: "danger", isInWishlist: false });
        } else {
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: "Product added to wishlist", status: "success", isInWishlist: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", status: "error" });
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
