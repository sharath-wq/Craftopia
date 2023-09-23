// Coupon Routes
const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/admin/couponController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", couponController.couponspage);
router.get("/add", couponController.addCoupon);

module.exports = router;
