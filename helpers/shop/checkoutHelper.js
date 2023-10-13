// orderHelper.js

const asyncHandler = require("express-async-handler");
const Address = require("../../models/addressModel");
const Cart = require("../../models/cartModeal");
const Order = require("../../models/orderModel");
const OrderItems = require("../../models/orderItemModel");
const Product = require("../../models/productModel");
const { generateUniqueOrderID } = require("../../utils/generateUniqueId");
const Crypto = require("crypto");
const { productTax } = require("../../utils/constants");
const Wallet = require("../../models/walletModel");

/**
 * Get user's cart items
 */
exports.getCartItems = asyncHandler(async (userId) => {
    return await Cart.findOne({ user: userId }).populate("products.product");
});

/**
 * Calculate the total price of cart items
 */
exports.calculateTotalPrice = asyncHandler(async (cartItems, userid, payWithWallet, coupon) => {
    const wallet = await Wallet.findOne({ user: userid });
    let subtotal = 0;
    for (const product of cartItems.products) {
        const productTotal = parseFloat(product.product.salePrice) * product.quantity;
        subtotal += productTotal;
    }
    const tax = (subtotal * productTax) / 100;
    let total;
    let usedFromWallet = 0;
    if (wallet && payWithWallet) {
        total = subtotal + tax;

        if (coupon) {
            if (coupon.type === "percentage") {
                discount = ((total * coupon.value) / 100).toFixed(2);
                if (discount > coupon.maxAmount) {
                    discount = coupon.maxAmount;
                    total -= discount;
                } else {
                    total -= discount;
                }
            } else if (coupon.type === "fixedAmount") {
                discount = coupon.value;
                total -= discount;
            }
        }

        if (total <= wallet.balance) {
            usedFromWallet = total;
            wallet.balance -= total;
            total = 0;
        } else {
            usedFromWallet = wallet.balance;
            total = subtotal + tax - wallet.balance;
            wallet.balance = 0;
        }
        return { subtotal, tax, total, usedFromWallet, walletBalance: wallet.balance, discount: discount ? discount : 0 };
    } else {
        total = subtotal + tax;
        let discount = 0;
        if (coupon) {
            if (coupon.type === "percentage") {
                discount = ((total * coupon.value) / 100).toFixed(2);
                if (discount > coupon.maxAmount) {
                    discount = coupon.maxAmount;
                    total -= discount;
                } else {
                    total -= discount;
                }
            } else if (coupon.type === "fixedAmount") {
                discount = coupon.value;
                total -= discount;
            }
        }
        return {
            subtotal,
            tax,
            total,
            usedFromWallet,
            walletBalance: wallet ? wallet.balance : 0,
            discount: discount ? discount : 0,
        };
    }
});

/**
 * Place an order
 */
exports.placeOrder = asyncHandler(async (userId, addressId, paymentMethod, isWallet, coupon) => {
    const cartItems = await exports.getCartItems(userId);

    if (!cartItems && cartItems.length) {
        throw new Error("Cart not found or empty");
    }

    const orders = [];
    let total = 0;

    for (const cartItem of cartItems.products) {
        const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
        const tax = (productTotal * productTax) / 100;

        total += productTotal + tax;

        const item = await OrderItems.create({
            quantity: cartItem.quantity,
            price: cartItem.product.salePrice,
            product: cartItem.product._id,
        });
        orders.push(item);
    }

    let discount;

    if (coupon) {
        if (coupon.type === "percentage") {
            discount = ((total * coupon.value) / 100).toFixed(2);
            if (discount > coupon.maxAmount) {
                discount = coupon.maxAmount;
                total -= discount;
            } else {
                total -= discount;
            }
        } else if (coupon.type === "fixedAmount") {
            discount = coupon.value;
            total -= discount;
        }
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
        totalPrice: total.toFixed(2),
        discount: discount,
        coupon: coupon.code,
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
