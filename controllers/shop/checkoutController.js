const asyncHandler = require("express-async-handler");
const checkoutHelper = require("../../helpers/checkoutHelper");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModeal");
const Order = require("../../models/orderModel");
const Razorpay = require("razorpay");
const Product = require("../../models/productModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Checkout Page Route
 * Method POST
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        const userid = req.user._id;
        const user = await User.findById(userid).populate("address");
        const cartItems = await checkoutHelper.getCartItems(userid);
        const cartData = await Cart.findOne({ user: userid });

        if (cartItems) {
            const { subtotal, tax, total } = checkoutHelper.calculateTotalPrice(cartItems);

            res.render("shop/pages/user/checkout", {
                title: "Checkout",
                page: "checkout",
                address: user.address,
                product: cartItems.products,
                total,
                subtotal,
                tax,
                cartData,
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
        const { addressId, payment_method } = req.body;

        const newOrder = await checkoutHelper.placeOrder(userId, addressId, payment_method);

        if (payment_method === "cash_on_delivery") {
            res.status(200).json({
                message: "Order placed successfully",
                orderId: newOrder._id,
            });
        } else if (payment_method === "online_payment") {
            const user = await User.findById(req.user._id);
            var instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            const rzp_order = instance.orders.create(
                {
                    amount: newOrder.totalPrice * 100,
                    currency: "INR",
                    receipt: newOrder.orderId,
                },
                (err, order) => {
                    if (err) {
                        res.status(500).json(err);
                    }
                    res.status(200).json({
                        message: "Order placed successfully",
                        rzp_order,
                        order,
                        user,
                        orderId: newOrder._id,
                    });
                }
            );
        } else {
            res.status(400).json({ message: "Invalid payment method" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Get Cart Data
 */
exports.getCartData = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const cartData = await Cart.findOne({ user: userId });
        res.json(cartData);
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Order Placed
 * Method GET
 */
exports.orderPlaced = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        // Populate the order details, including product details
        const order = await Order.findById(orderId).populate({
            path: "orderItems",
            populate: {
                path: "product",
            },
        });

        const cartItems = await checkoutHelper.getCartItems(req.user._id);

        if (cartItems) {
            for (const cartItem of cartItems.products) {
                const updateProduct = await Product.findById(cartItem.product._id);
                updateProduct.quantity -= cartItem.quantity;
                updateProduct.sold += cartItem.quantity;
                await updateProduct.save();

                await Cart.findOneAndDelete({ user: req.user._id });
            }
        }

        // Render the order placed page with orderDetails
        res.render("shop/pages/user/order-placed.ejs", {
            title: "Order Placed",
            page: "Order Placed",
            order: order,
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Vefify Payment
 * Method POST
 */
exports.verifyPayment = asyncHandler(async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

        const result = await checkoutHelper.verifyPayment(
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderId
        );

        res.json(result);
    } catch (error) {
        throw new Error(error);
    }
});
