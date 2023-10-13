const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModeal");
const Product = require("../../models/productModel");
const { incrementQuantity, decrementQuantity, calculateCartTotals } = require("../../helpers/shop/cartHelper");

/**
 * Cart page Route
 * Method GET
 */
exports.cartpage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const messages = req.flash();
    const coupon = req.session.coupon;
    try {
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: "products.product",
                populate: {
                    path: "images",
                    model: "Images",
                },
            })
            .exec();

        if (cart) {
            const { subtotal, total, tax, discount } = calculateCartTotals(cart.products, coupon);
            let couponMessage = {};
            if (!coupon) {
                couponMessage = { status: "text-info", message: "Try FLAT100 | PERCENT20" };
            }
            res.render("shop/pages/user/cart", {
                title: "Cart",
                page: "cart",
                cartItems: cart,
                messages,
                subtotal,
                total,
                tax,
                coupon,
                discount,
                couponMessage,
            });
        } else {
            res.render("shop/pages/user/cart", { title: "Cart", page: "cart", messages, cartItems: null });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add to cart Route
 * Method GET
 */
exports.addToCart = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    validateMongoDbId(productId);

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.quantity < 1) {
            return res.status(400).json({ message: "Product is out of stock" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                products: [{ product: productId, quantity: 1 }],
            });
        } else {
            const existingProduct = cart.products.find((item) => item.product.equals(productId));

            if (existingProduct) {
                if (product.quantity <= existingProduct.quantity) {
                    return res.json({
                        message: "Out of Stock",
                        status: "danger",
                        count: cart.products.length,
                    });
                }
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }
            await cart.save();
        }

        res.json({ message: "Product Added to Cart", count: cart.products.length, status: "success" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Remove From Cart Route
 * Method GET
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    validateMongoDbId(productId);
    try {
        const cart = await Cart.findOne({ user: userId });
        if (cart) {
            cart.products = cart.products.filter((product) => product.product.toString() !== productId);
            await cart.save();
        }
        req.flash("warning", `Item Removed`);
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Increment Quantity Route
 * Method PUT
 */
exports.incQuantity = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(productId);

        await incrementQuantity(userId, productId, res);
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Decrement Quantity Route
 * Method PUT
 */
exports.decQuantity = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(productId);

        await decrementQuantity(userId, productId, res);
    } catch (error) {
        throw new Error(error);
    }
});
