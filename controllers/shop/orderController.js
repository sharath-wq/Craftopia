const asyncHandler = require("express-async-handler");

/**
 * Orders Page Route
 * Method GET
 */
exports.orderspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/orders", { title: "Orders", page: "orders" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Orders Completed Page Route
 * Method GET
 */
exports.orderCompletedpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/order-completed", { title: "Orders Placed", page: "orders-completed" });
    } catch (error) {
        throw new Error(error);
    }
});
