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
        const cartItems = await Cart.findOne({ user: userId }).populate("products.product");

        if (cartItems) {
            const orders = [];

            for (const cartItem of cartItems.products) {
                const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
                const tax = (productTotal * 12) / 100;
                let shippingFee = 60;
                if (productTotal > 2000) {
                    shippingFee = 0;
                }

                const total = productTotal + tax + shippingFee;

                const order = await Order.create({
                    customer: userId,
                    products: [{ product: cartItem.product._id, quantity: cartItem.quantity }],
                    totalAmount: total,
                    address: req.body.addressId,
                    paymentMethod: req.body.payment_method,
                });

                orders.push(order);
            }

            await Cart.findOneAndDelete({ user: userId });
            const address = await Address.findById(req.body.addressId);
            res.render("shop/pages/user/order-placed.ejs", {
                title: "Order Placed",
                page: "Order Placed",
                orders: orders,
                address: address,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});
