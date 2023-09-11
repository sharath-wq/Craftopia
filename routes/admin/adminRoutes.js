const express = require("express");
const router = express();
const { body, validationResult } = require("express-validator");

// Controllers
const adminController = require("../../controllers/admin/adminController");
const authController = require("../../controllers/admin/authController");
const productController = require("../../controllers/admin/productController");
const categoryController = require("../../controllers/admin/categoryController");
const bannerController = require("../../controllers/admin/bannerController");
const couponController = require("../../controllers/admin/couponController");
const custoemrController = require("../../controllers/admin/customerController");
const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Admin Routes
router.get("/", adminController.homepage);
router.get("/dashboard", adminController.dashboardpage);
router.get("/settings", adminController.settingspage);
router.get("/sales-report", adminController.salesReportpage);

// Auth Rotues
router.get("/login", authController.loginpage);
// router.get("/register", authController.registerpage);

// router.post(
//     "/register",
//     [
//         body("email").trim().isEmail().withMessage("Email must be valid email").normalizeEmail().toLowerCase(),
//         body("mobile").trim().isMobilePhone().withMessage("Enter a valid mobile number"),
//         body("password").trim().isLength(2).withMessage("Password length short, min 2 characters required"),
//         body("confirm-password").custom((value, { req }) => {
//             if (value !== req.body.password) {
//                 throw new Error("Password do not match");
//             }
//             return true;
//         }),
//     ],
//     authController.registerAdmin
// );

// Product Routes
router.get("/products", productController.productspage);
router.get("/add-product", productController.addProductpage);
router.get("/edit-product", productController.editProductpage);

// Category Routes
router.get("/categories", categoryController.categoriespage);
router.get("/add-category", categoryController.addCategorypage);

// Banner Routes
router.get("/banners", bannerController.bannerspage);
router.get("/add-banner", bannerController.addBannerpage);

// Coupon Routes
router.get("/coupons", couponController.couponspage);
router.get("/add-coupon", couponController.addCoupon);

// Customer Routes
router.get("/customers", custoemrController.customerpage);
router.get("/edit-customer/:id", custoemrController.editCustomer);

// Order Routes
router.get("/orders", orderController.ordersPage);
router.get("/edit-order", orderController.editOrder);

router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404" });
});

module.exports = router;
