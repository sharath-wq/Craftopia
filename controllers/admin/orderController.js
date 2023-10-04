const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const status = require("../../utils/status");
const Product = require("../../models/productModel");
const OrderItem = require("../../models/orderItemModel");

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
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();
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
