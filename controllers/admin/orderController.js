const asyncHandler = require("express-async-handler");

/**
 * Manage Orders Page Route
 * Method GET
 */
exports.ordersPage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/order/orders", { title: "Orders" });
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
        res.render("admin/pages/order/edit-order", { title: "Edit Order" });
    } catch (error) {
        throw new Error(error);
    }
});
