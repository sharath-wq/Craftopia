const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const { status } = require("../../utils/status");
const OrderItem = require("../../models/orderItemModel");
/**
 * Orders Page Route
 * Method GET
 */
exports.orderspage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

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
            .sort({ orderedDate: -1 });

        res.render("shop/pages/user/orders", {
            title: "Orders",
            page: "orders",
            orders,
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.singleOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const order = await OrderItem.findById(orderId).populate({
            path: "product",
            modal: "Product",
            populate: {
                path: "images",
                model: "Images",
            },
        });
        const orders = await Order.findOne({ orderItems: orderId }).select("shippingAddress city orderedDate");
        res.render("shop/pages/user/single-order.ejs", {
            title: order.product.title,
            page: order.product.title,
            order,
            orders,
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Cancel Order Route
 * Method PUT
 */
exports.chancelOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const updatedOrder = await OrderItem.findByIdAndUpdate(orderId, {
            status: status.cancelled,
        });
        const cancelledProduct = await Product.findById(updatedOrder.product);
        cancelledProduct.quantity += updatedOrder.quantity;
        cancelledProduct.sold -= updatedOrder.quantity;
        await cancelledProduct.save();
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});
