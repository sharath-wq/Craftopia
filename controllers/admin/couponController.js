const asyncHandler = require("express-async-handler");

/**
 * Manage Coupon Page Route
 * Method GET
 */
exports.couponspage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/coupon/coupons", { title: "Coupons" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Coupon Page Route
 * Method GET
 */
exports.addCoupon = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/coupon/add-coupon", { title: "Add Coupon" });
    } catch (error) {
        throw new Error(error);
    }
});
