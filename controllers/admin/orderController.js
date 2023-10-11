const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const status = require("../../utils/status");
const Product = require("../../models/productModel");
const OrderItem = require("../../models/orderItemModel");
const Wallet = require("../../models/walletModel");
const WalletTransactoins = require("../../models/walletTransactionModel");

/**
 * Manage Orders Page Route
 * Method GET
 */
exports.ordersPage = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
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
            .select("orderId orderedDate shippingAddress city zip totalPrice")
            .sort({ orderedDate: -1 });
        // res.json(orders);
        res.render("admin/pages/order/orders", { title: "Orders", orders });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Order Page Route
 * Method GET
 */
exports.editOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ orderId: orderId })
            .populate({
                path: "orderItems",
                modal: "OrderItems",
                populate: {
                    path: "product",
                    modal: "Product",
                    populate: {
                        path: "images",
                        modal: "Images",
                    },
                },
            })
            .populate({
                path: "user",
                modal: "User",
            });
        res.render("admin/pages/order/edit-order", { title: "Edit Order", order });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Update Order Status
 * Method PUT
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await OrderItem.findByIdAndUpdate(orderId, {
            status: req.body.status,
        });

        if (req.body.status === status.status.shipped) {
            order.shippedDate = Date.now();
        } else if (req.body.status === status.status.delivered) {
            order.deliveredDate = Date.now();
        }
        await order.save();

        if (req.body.status === status.status.cancelled) {
            if (order.isPaid !== "pending") {
                const product = await Product.findById(order.product);
                product.sold -= order.quantity;
                product.quantity += order.quantity;
                await product.save();
            }
        }

        const orders = await Order.findOne({ orderItems: order._id });

        if (order.status === status.status.returnPending && orders.payment_method === "online_payment") {
            order.status = status.status.returned;
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();

            const wallet = await Wallet.findOne({ user: req.user._id });
            const orders = await Order.findOne({ orderItems: order._id });

            if (!wallet) {
                const newWallet = await Wallet.create({
                    balance: parseInt(order.price) * order.quantity,
                    user: orders.user,
                });
                const walletTransaction = await WalletTransactoins.create({
                    wallet: newWallet._id,
                    amount: parseInt(order.price) * order.quantity,
                    type: "credit",
                });
            } else {
                const existingWallet = await Wallet.findOne({ user: orders.user });
                existingWallet.balance += parseInt(order.price) * order.quantity;
                await existingWallet.save();

                const walletTransaction = await WalletTransactoins.create({
                    wallet: existingWallet._id,
                    amount: parseInt(order.price) * order.quantity,
                    type: "credit",
                });
            }

            await order.save();
        } else if (order.status === status.status.returnPending && orders.payment_method === "cash_on_delivery") {
            order.status = status.status.returned;
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();
            await order.save();

            const wallet = await Wallet.findOne({ user: req.user._id });
            const orders = await Order.findOne({ orderItems: order._id });

            if (!wallet) {
                const newWallet = await Wallet.create({
                    balance: parseInt(order.price) * order.quantity,
                    user: orders.user,
                });
                const walletTransaction = await WalletTransactoins.create({
                    wallet: newWallet._id,
                    amount: parseInt(order.price) * order.quantity,
                    type: "credit",
                });
            } else {
                const existingWallet = await Wallet.findOne({ user: orders.user });
                existingWallet.balance += parseInt(order.price) * order.quantity;
                await existingWallet.save();

                const walletTransaction = await WalletTransactoins.create({
                    wallet: existingWallet._id,
                    amount: parseInt(order.price) * order.quantity,
                    type: "credit",
                });
            }

            await order.save();
        }

        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Search Order
 * Method POST
 */
exports.searchOrder = asyncHandler(async (req, res) => {
    try {
        const search = req.body.search;
        const order = await Order.findOne({ orderId: search });
        if (order) {
            res.redirect(`/admin/orders/${search}`);
        } else {
            req.flash("danger", "Can't find Order!");
            res.redirect("/admin/dashboard");
        }
    } catch (error) {
        throw new Error(error);
    }
});
