const asyncHandler = require("express-async-handler");
const Coupon = require("../../models/couponModel");

/**
 * Manage Coupon Page Route
 * Method GET
 */
exports.couponspage = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ _id: 1 });
        res.render("admin/pages/coupon/coupons", { title: "Coupons", coupons });
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
        const messages = req.flash();
        res.render("admin/pages/coupon/add-coupon", { title: "Add Coupon", messages, data: {} });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Create Coupon
 * Method POST
 */
exports.createCoupon = asyncHandler(async (req, res) => {
    try {
        const existingCoupon = await Coupon.findOne({ code: req.body.code });

        console.log(req.body);

        if (!existingCoupon) {
            const newCoupon = await Coupon.create({
                code: req.body.code,
                type: req.body.type,
                value: parseInt(req.body.value),
                description: req.body.description,
                expiryDate: req.body.expiryDate,
                minAmount: parseInt(req.body.minAmount),
                maxAmount: parseInt(req.body.maxAmount) || 0,
            });
            res.redirect("/admin/coupons");
        }
        req.flash("warning", "Coupon exists with same code");
        res.render("admin/pages/coupon/add-coupon", { title: "Add Coupon", messages, data: req.body });
    } catch (error) {
        throw new Error(error);
    }
});
