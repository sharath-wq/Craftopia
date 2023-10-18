const Product = require("../../models/productModel");
const OrderItem = require("../../models/orderItemModel");
const Order = require("../../models/orderModel");
const Wallet = require("../../models/walletModel");
const WalletTransactoins = require("../../models/walletTransactionModel");
const Coupon = require("../../models/couponModel");
const status = require("../../utils/status");

async function handleOrderPayment(order, orders, wallet) {
    const orderTotal = parseInt(order.price * order.quantity);

    if (orders.coupon) {
        const appliedCoupon = orders.coupon;
        console.log(appliedCoupon);
        let amountToBeRefunded = 0;
        if (appliedCoupon.type === "fixedAmount") {
            const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
            const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
            amountToBeRefunded = returnAmount;
        } else if (appliedCoupon.type === "percentage") {
            const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
            amountToBeRefunded = returnAmount;
        }

        if (!wallet) {
            const newWallet = await Wallet.create({
                balance: amountToBeRefunded,
                user: orders.user,
            });

            await createWalletTransaction(newWallet, amountToBeRefunded);
        } else {
            wallet.balance += amountToBeRefunded;
            await wallet.save();
            await createWalletTransaction(wallet, amountToBeRefunded);
        }
    } else {
        if (!wallet) {
            const newWallet = await Wallet.create({
                balance: parseInt(order.price) * order.quantity,
                user: orders.user,
            });

            await createWalletTransaction(newWallet, parseInt(order.price) * order.quantity);
        } else {
            wallet.balance += parseInt(order.price) * order.quantity;
            await wallet.save();

            await createWalletTransaction(wallet, parseInt(order.price) * order.quantity);
        }
    }
}

async function handleReturnAmount(order, orders, orderTotal) {
    const wallet = await Wallet.findOne({ user: orders.user });
    if (orders.coupon) {
        const appliedCoupon = orders.coupon;
        let amountToBeRefunded = 0;
        if (appliedCoupon.type === "fixedAmount") {
            const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
            const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
            amountToBeRefunded = returnAmount;
        } else if (appliedCoupon.type === "percentage") {
            const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
            amountToBeRefunded = returnAmount;
        }

        if (!wallet) {
            const newWallet = await Wallet.create({
                balance: amountToBeRefunded,
                user: orders.user,
            });

            await createWalletTransaction(newWallet, amountToBeRefunded);
        } else {
            wallet.balance += amountToBeRefunded;
            await wallet.save();
            await createWalletTransaction(wallet, amountToBeRefunded);
        }
    } else {
        wallet.balance += amountToBeRefunded;
        await wallet.save();

        await createWalletTransaction(wallet, amountToBeRefunded);
    }
}

module.exports = {
    updateOrderStatus: async (orderId, newStatus) => {
        return OrderItem.findByIdAndUpdate(orderId, { status: newStatus });
    },

    handleCancelledOrder: async (order) => {
        if (order.isPaid !== "pending") {
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();
        }

        const orders = await Order.findOne({ orderItems: order._id });
        const wallet = await Wallet.findOne({ user: orders.user });

        if (order.isPaid) {
            await handleOrderPayment(order, orders, wallet);
        }
    },

    handleReturnedOrder: async (order) => {
        order.status = status.status.returned;
        const product = await Product.findById(order.product);
        product.sold -= order.quantity;
        product.quantity += order.quantity;
        await product.save();

        const orders = await Order.findOne({ orderItems: order._id });

        if (orders.coupon) {
            const orderTotal = parseInt(order.price * order.quantity);
            await handleReturnAmount(order, orders, orderTotal);
        }

        await order.save();
    },
};

async function createWalletTransaction(wallet, amount) {
    return WalletTransactoins.create({
        wallet: wallet._id,
        amount: amount,
        type: "credit",
    });
}
