const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const status = require("../../utils/status");
const Product = require("../../models/productModel");

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
            .select("orderNumber createdAt products.product products.quantity totalAmount paymentMethod status customer")
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
            .populate({
                path: "customer",
                model: "User",
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
        if (req.body.status === status.status.cancelled) {
            const product = await Product.findById(order.products[0].product);
            product.sold -= order.products[0].quantity;
            await product.save();
        }
        res.redirect("/admin/orders");
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
        const order = await Order.findOne({ orderNumber: search });
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
