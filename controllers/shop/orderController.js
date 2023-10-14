const asyncHandler = require("express-async-handler");
const orderHelper = require("../../helpers/shop/orderHelper");

/**
 * Orders Page Route
 * Method GET
 */
exports.orderspage = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const orders = await orderHelper.getOrders(userId);

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

        const { order, orders } = await orderHelper.getSingleOrder(orderId);
        const review = await orderHelper.getReview(req.user._id, order.product._id);

        res.render("shop/pages/user/single-order.ejs", {
            title: order.product.title,
            page: order.product.title,
            order,
            review,
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
exports.cancelOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;

        const result = await orderHelper.cancelOrderById(orderId);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Cancel Single Order Route
 * Method PUT
 */
exports.cancelSingleOrder = asyncHandler(async (req, res) => {
    try {
        const orderItemId = req.params.id;

        const result = await orderHelper.cancelSingleOrder(orderItemId, req.user._id);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Return Order Requst
 * Method POST
 */
exports.returnOrder = asyncHandler(async (req, res) => {
    try {
        const returnOrderItemId = req.params.id;
        const result = await orderHelper.returnOrder(returnOrderItemId);

        if (result === "redirectBack") {
            res.redirect("back");
        } else {
            res.json(result);
        }
    } catch (error) {
        throw new Error(error);
    }
});
