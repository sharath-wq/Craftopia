const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModeal");
const Order = require("../../models/orderModel");

/**
 * Checkout Page Route
 * Method POST
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        const userid = req.user._id;
        const user = await User.findById(userid).populate("address");
        const cartItmes = await Cart.findOne({ user: userid }).populate("products.product");

        if (cartItmes) {
            let subtotal = 0;
            for (const product of cartItmes.products) {
                const productTotal = parseFloat(product.product.salePrice) * product.quantity;
                subtotal += productTotal;
            }
            const tax = (subtotal * 12) / 100;
            let shippingFee = 60;
            if (subtotal > 2000) {
                shippingFee = 0;
            }

            const total = subtotal + tax + shippingFee;

            res.render("shop/pages/user/checkout", {
                title: "Checkout",
                page: "checkout",
                address: user.address,
                product: cartItmes.products,
                total,
                subtotal,
                tax,
                shippingFee,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.placeOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const cartItmes = await Cart.findOne({ user: userId }).populate("products.product");
        if (cartItmes) {
            let subtotal = 0;
            for (const product of cartItmes.products) {
                const productTotal = parseFloat(product.product.salePrice) * product.quantity;
                subtotal += productTotal;
            }
            const tax = (subtotal * 12) / 100;
            let shippingFee = 60;
            if (subtotal > 2000) {
                shippingFee = 0;
            }

            const total = subtotal + tax + shippingFee;
            const order = await Order.create({
                customer: userId,
                products: cartItmes.products,
                totalAmount: total,
                address: req.body.addressId,
                paymentMethod: req.body.payment_method,
            });
            const address = await Order.findById(order._id).populate("address");
            await Cart.findOneAndDelete({ user: userId });
            res.render("shop/pages/user/order-placed.ejs", {
                title: "Order Placed",
                page: "Order Placed",
                order,
                address: address.address,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});
