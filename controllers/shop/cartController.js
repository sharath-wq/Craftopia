const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModeal");
const Product = require("../../models/productModel");

/**
 * Cart page Route
 * Method GET
 */
exports.cartpage = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const messages = req.flash();
    try {
        const cartItems = await Cart.findOne({ user: userId })
            .populate({
                path: "products.product",
                populate: {
                    path: "images",
                    model: "Images",
                },
            })
            .exec();

        if (cartItems) {
            // Calculate subtotal and total
            let subtotal = 0;
            for (const product of cartItems.products) {
                const productTotal = parseFloat(product.product.salePrice) * product.quantity;
                subtotal += productTotal;
            }

            const tax = (subtotal * 12) / 100;
            let shippingFee = 60;
            if (subtotal > 2000) {
                shippingFee = 0;
            }

            const total = subtotal + tax + shippingFee;

            // Render the EJS template with the calculated values
            res.render("shop/pages/user/cart", {
                title: "Cart",
                page: "cart",
                cartItems,
                messages,
                subtotal,
                total,
                tax,
                shippingFee,
            });
        } else {
            res.render("shop/pages/user/cart", { title: "Cart", page: "cart", messages, cartItems });
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
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                products: [{ product: productId, quantity: 1 }],
            });
        } else {
            const existingProduct = cart.products.find((item) => item.product.equals(productId));

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
        }

        req.flash("success", "Item added to cart");
        res.redirect("back");
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
 * Increment Quantity  Route
 * Method PUT
 */
exports.incQuantity = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;
        validateMongoDbId(productId);

        const updatedProduct = await Cart.findOneAndUpdate(
            { user: userId, "products._id": productId },
            { $inc: { "products.$.quantity": 1 } }
        );

        if (updatedProduct) {
            res.redirect("/cart");
        }
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

        const updatedCart = await Cart.findOne({ user: userId });

        const productToDecrement = updatedCart.products.find((item) => item._id == productId);

        if (productToDecrement) {
            productToDecrement.quantity -= 1;

            if (productToDecrement.quantity <= 0) {
                updatedCart.products = updatedCart.products.filter((item) => item._id != productId);
            }

            await updatedCart.save();

            res.redirect("/cart");
        } else {
            res.status(404).json({ message: "Product not found in the cart." });
        }
    } catch (error) {
        throw new Error(error);
    }
});
