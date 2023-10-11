const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const { status } = require("../../utils/status");
const OrderItem = require("../../models/orderItemModel");
const Wallet = require("../../models/walletModel");
const WalletTransactoins = require("../../models/walletTransactionModel");
const { productTax } = require("../../utils/constants");
const Review = require("../../models/reviewModel");

/**
 * Get orders for a user
 */
exports.getOrders = asyncHandler(async (userId) => {
    const orders = await Order.find({ user: userId })
        .populate({
            path: "orderItems",
            select: "product status _id",
            populate: {
                path: "product",
                select: "title images",
                populate: {
                    path: "images",
                },
            },
        })
        .select("orderId orderedDate shippingAddress city")
        .sort({ _id: -1 });

    return orders;
});

/**
 * Get a single order by ID
 */
exports.getSingleOrder = asyncHandler(async (orderId) => {
    const order = await OrderItem.findById(orderId).populate({
        path: "product",
        model: "Product",
        populate: {
            path: "images",
            model: "Images",
        },
    });

    const orders = await Order.findOne({ orderItems: orderId }).select("shippingAddress city orderedDate");

    return { order, orders };
});

/**
 * Cancel an order by ID
 */
exports.cancelOrderById = asyncHandler(async (orderId) => {
    const order = await Order.findById(orderId).populate("orderItems");

    if (order.orderItems.every((item) => item.status === status.cancelled)) {
        return { message: "Order is already cancelled." };
    }

    if (
        order.payment_method === "online_payment" &&
        order.orderItems.every((item) => {
            return item.isPaid === "pending" ? false : true;
        })
    ) {
        // Update product quantities and sold counts for each order item
        for (const item of order.orderItems) {
            const orderItem = await OrderItem.findByIdAndUpdate(item._id, {
                status: status.cancelled,
            });

            const cancelledProduct = await Product.findById(orderItem.product);
            cancelledProduct.quantity += orderItem.quantity;
            cancelledProduct.sold -= orderItem.quantity;
            await cancelledProduct.save();
        }

        // Update the order status
        order.status = status.cancelled;
        const updatedOrder = await order.save();

        return updatedOrder;
    } else if (order.payment_method === "cash_on_delivery") {
        // Update product quantities and sold counts for each order item
        for (const item of order.orderItems) {
            await OrderItem.findByIdAndUpdate(item._id, {
                status: status.cancelled,
            });

            const cancelledProduct = await Product.findById(item.product);
            cancelledProduct.quantity += item.quantity;
            cancelledProduct.sold -= item.quantity;
            await cancelledProduct.save();
        }

        // Update the order status
        order.status = status.cancelled;
        await order.save();

        return "redirectBack";
    }
});

exports.cancelSingleOrder = asyncHandler(async (orderItemId, userId) => {
    const updatedOrder = await OrderItem.findByIdAndUpdate(orderItemId, {
        status: status.cancelled,
    });

    if (updatedOrder.isPaid !== "pending") {
        const cancelledProduct = await Product.findById(updatedOrder.product);
        cancelledProduct.quantity += updatedOrder.quantity;
        cancelledProduct.sold -= updatedOrder.quantity;
        await cancelledProduct.save();
    }

    const orders = await Order.findOne({ orderItems: orderItemId });
    if (
        (orders.payment_method === "online_payment" || orders.payment_method === "wallet_payment") &&
        updatedOrder.isPaid === "paid"
    ) {
        const wallet = await Wallet.findOne({ user: userId });
        const tax = (parseInt(updatedOrder.price) * updatedOrder.quantity * productTax) / 100;
        const returnAmount = parseInt(updatedOrder.price) * updatedOrder.quantity + tax;
        if (!wallet) {
            const newWallet = await Wallet.create({
                balance: returnAmount,
                user: orders.user,
            });
            const walletTransaction = await WalletTransactoins.create({
                wallet: newWallet._id,
                amount: returnAmount,
                type: "credit",
            });
        } else {
            const existingWallet = await Wallet.findOne({ user: orders.user });
            existingWallet.balance += returnAmount;
            await existingWallet.save();

            const walletTransaction = await WalletTransactoins.create({
                wallet: existingWallet._id,
                amount: returnAmount,
                type: "credit",
            });
        }
    }
    return "redirectBack";
});

exports.returnOrder = asyncHandler(async (returnOrderId) => {
    const returnOrder = await OrderItem.findByIdAndUpdate(returnOrderId, {
        status: status.returnPending,
    });

    return "redirectBack";
});

exports.getReview = asyncHandler(async (userId, productId) => {
    const review = await Review.findOne({ user: userId, product: productId });
    if (review) {
        return review;
    } else {
        return {};
    }
});
