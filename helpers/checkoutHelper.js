// orderHelper.js

const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModeal");
const Order = require("../models/orderModel");
const OrderItems = require("../models/orderItemModel");
const Product = require("../models/productModel");
const { generateUniqueOrderID } = require("../utils/generateUniqueId");
const Crypto = require("crypto");

/**
 * Get user's cart items
 */
exports.getCartItems = asyncHandler(async (userId) => {
    return await Cart.findOne({ user: userId }).populate("products.product");
});

/**
 * Calculate the total price of cart items
 */
exports.calculateTotalPrice = (cartItems) => {
    let subtotal = 0;
    for (const product of cartItems.products) {
        const productTotal = parseFloat(product.product.salePrice) * product.quantity;
        subtotal += productTotal;
    }
    const tax = (subtotal * 12) / 100;
    let shippingFee = 0;
    if (subtotal > 2000) {
        shippingFee = 0;
    }
    const total = subtotal + tax + shippingFee;
    return { subtotal, tax, total };
};

/**
 * Place an order
 */
exports.placeOrder = asyncHandler(async (userId, addressId, paymentMethod) => {
    const cartItems = await exports.getCartItems(userId);

    if (!cartItems) {
        throw new Error("Cart not found");
    }

    const orders = [];
    let total = 0;

    for (const cartItem of cartItems.products) {
        const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
        const tax = (productTotal * 8) / 100;

        total += productTotal + tax;

        const item = await OrderItems.create({
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            product: cartItem.product._id,
        });
        orders.push(item);
        const updateProduct = await Product.findById(cartItem.product._id);
        updateProduct.quantity -= cartItem.quantity;
        updateProduct.sold += cartItem.quantity;
        await updateProduct.save();
    }

    const address = await Address.findById(addressId);

    const existingOrderIds = await Order.find().select("orderId");
    // Create the order
    const newOrder = await Order.create({
        orderId: "OD" + generateUniqueOrderID(existingOrderIds),
        user: userId,
        orderItems: orders,
        shippingAddress: address.title,
        city: address.city,
        street: address.street,
        state: address.state,
        zip: address.pincode,
        phone: address.mobile,
        totalPrice: total,
        payment_method: paymentMethod,
    });

    return newOrder;
});

/**
 * Verify payment using Razorpay
 */
exports.verifyPayment = asyncHandler(async (razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = Crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign.toString()).digest("hex");

    if (razorpay_signature === expectedSign) {
        return { message: "success", orderId: orderId };
    } else {
        throw new Error("Payment verification failed");
    }
});
