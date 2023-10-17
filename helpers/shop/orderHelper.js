const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const { status } = require("../../utils/status");
const OrderItem = require("../../models/orderItemModel");
const Wallet = require("../../models/walletModel");
const WalletTransactoins = require("../../models/walletTransactionModel");
const Review = require("../../models/reviewModel");
const Coupon = require("../../models/couponModel");

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

            const cancelledProduct = await Product.findByIdAndUpdate(orderItem.product, {
                $inc: {
                    quantity: orderItem.quantity,
                    sold: -orderItem.quantity,
                },
            });
        }

        // Update the order status
        order.status = status.cancelled;
        const updatedOrder = await order.save();

        return updatedOrder;
    } else if (order.payment_method === "cash_on_delivery") {
        // Update product quantities and sold counts for each order item
        for (const item of order.orderItems) {
            const orderItem = await OrderItem.findByIdAndUpdate(item._id, {
                status: status.cancelled,
            });

            const cancelledProduct = await Product.findByIdAndUpdate(orderItem.product, {
                $inc: {
                    quantity: orderItem.quantity,
                    sold: -orderItem.quantity,
                },
            });
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
        const cancelledProduct = await Product.findById(updatedOrder.product, {
            $inc: { quantity: updatedOrder.quantity, sold: -updatedOrder.quantity },
        });
    }

    const orders = await Order.findOne({ orderItems: orderItemId });
    if (
        (orders.payment_method === "online_payment" || orders.payment_method === "wallet_payment") &&
        updatedOrder.isPaid === "paid"
    ) {
        const wallet = await Wallet.findOne({ user: userId });
        const orderTotal = parseInt(updatedOrder.price) * updatedOrder.quantity;
        if (!wallet) {
            let amountToBeRefunded = 0;
            if (orders.coupon) {
                const appliedCoupon = await Coupon.findOne({ code: orders.coupon });
                if (appliedCoupon.type === "fixedAmount") {
                    const persentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                    const returnAmount = orderTotal - (appliedCoupon.value * persentage) / 100;
                    amountToBeRefunded = returnAmount;
                } else if (appliedCoupon.type === "percentage") {
                    const couponDiscount = ((orderTotal * appliedCoupon.value) / 100).toFixed(2);
                    const returnAmount = orderTotal - couponDiscount;
                    amountToBeRefunded = returnAmount;
                    console.log({ isWorking: "true", couponDiscount, returnAmount });
                }
            }
            const newWallet = await Wallet.create({
                balance: amountToBeRefunded,
                user: orders.user,
            });
            const walletTransaction = await WalletTransactoins.create({
                wallet: newWallet._id,
                amount: amountToBeRefunded,
                type: "credit",
            });
        } else {
            let amountToBeRefunded = 0;
            if (orders.coupon) {
                const appliedCoupon = await Coupon.findOne({ code: orders.coupon });
                if (appliedCoupon.type === "fixedAmount") {
                    const persentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                    const returnAmount = orderTotal - (appliedCoupon.value * persentage) / 100;
                    amountToBeRefunded = returnAmount;
                } else if (appliedCoupon.type === "percentage") {
                    const couponDiscount = ((orderTotal * appliedCoupon.value) / 100).toFixed(2);
                    const returnAmount = orderTotal - couponDiscount;
                    amountToBeRefunded = returnAmount;
                    console.log({ isWorking: "true", couponDiscount, returnAmount });
                }
            }
            const existingWallet = await Wallet.findOneAndUpdate({ user: userId });
            existingWallet.balance += amountToBeRefunded;
            existingWallet.save();

            const walletTransaction = await WalletTransactoins.create({
                wallet: existingWallet._id,
                amount: amountToBeRefunded,
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
