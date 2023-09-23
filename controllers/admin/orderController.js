const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");

/**
 * Manage Orders Page Route
 * Method GET
 */
exports.ordersPage = asyncHandler(async (req, res) => {
    try {
        const orderItems = await Order.find()
            .select("orderNumber createdAt products.product status")
            .populate({
                path: "products.product",
                model: "Product",
                populate: {
                    path: "images",
                    model: "Images",
                },
            })
            .populate({
                path: "address",
                model: "Address",
            })
            .sort({ createdAt: -1 });
        // res.json(orderItems);
        res.render("admin/pages/order/orders", { title: "Orders", orderItems });
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
        const order = await Order.find({ orderNumber: orderId })
            .select("orderNumber createdAt products.product products.quantity totalAmount paymentMethod status")
            .populate({
                path: "products.product",
                model: "Product",
                populate: {
                    path: "images",
                    model: "Images",
                },
            })
            .populate({
                path: "address",
                model: "Address",
            })
            .sort({ createdAt: -1 });
        // res.json(order);
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
        // res.json(req.body);
        const order = await Order.findOneAndUpdate(
            { orderNumber: orderId },
            {
                status: req.body.status,
            }
        );
        res.redirect("/admin/orders");
    } catch (error) {
        throw new Error(error);
    }
});
