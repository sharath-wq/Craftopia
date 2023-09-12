const express = require("express");
const router = express();
const { body, validationResult } = require("express-validator");
const passport = require("passport");

// Controllers
const adminController = require("../../controllers/admin/adminController");
const authController = require("../../controllers/admin/authController");
const productController = require("../../controllers/admin/productController");
const categoryController = require("../../controllers/admin/categoryController");
const bannerController = require("../../controllers/admin/bannerController");
const couponController = require("../../controllers/admin/couponController");
const custoemrController = require("../../controllers/admin/customerController");
const orderController = require("../../controllers/admin/orderController");

// Middlewares
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Admin Routes
router.get("/", ensureLoggedIn({ redirectTo: "/admin/login" }), adminController.homepage);
router.get("/dashboard", ensureLoggedIn({ redirectTo: "/admin/login" }), adminController.dashboardpage);
router.get("/settings", ensureLoggedIn({ redirectTo: "/admin/login" }), adminController.settingspage);
router.get("/sales-report", ensureLoggedIn({ redirectTo: "/admin/login" }), adminController.salesReportpage);

// Auth Rotues
router.get("/login", ensureLoggedOut({ redirectTo: "/admin/" }), authController.loginpage);
router.get("/logout", ensureLoggedIn({ redirectTo: "/admin/login" }), authController.logoutAdmin);

router.post(
    "/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/admin/",
        failureRedirect: "/admin/login",
        failureFlash: true,
    })
);

// Product Routes
router.get("/products", ensureLoggedIn({ redirectTo: "/admin/login" }), productController.productspage);
router.get("/add-product", ensureLoggedIn({ redirectTo: "/admin/login" }), productController.addProductpage);
router.get("/edit-product", ensureLoggedIn({ redirectTo: "/admin/login" }), productController.editProductpage);

// Category Routes
router.get("/categories", ensureLoggedIn({ redirectTo: "/admin/login" }), categoryController.categoriespage);
router.get("/add-category", ensureLoggedIn({ redirectTo: "/admin/login" }), categoryController.addCategorypage);

// Banner Routes
router.get("/banners", ensureLoggedIn({ redirectTo: "/admin/login" }), bannerController.bannerspage);
router.get("/add-banner", ensureLoggedIn({ redirectTo: "/admin/login" }), bannerController.addBannerpage);

// Coupon Routes
router.get("/coupons", ensureLoggedIn({ redirectTo: "/admin/login" }), couponController.couponspage);
router.get("/add-coupon", ensureLoggedIn({ redirectTo: "/admin/login" }), couponController.addCoupon);

// Customer Routes
router.get("/customers", ensureLoggedIn({ redirectTo: "/admin/login" }), custoemrController.customerpage);

// router.put("/customer/block/:id", custoemrController.blockCustomer);
// router.put("/customer/unblock/:id", custoemrController.unblockCustomer);

// Order Routes
router.get("/orders", ensureLoggedIn({ redirectTo: "/admin/login" }), orderController.ordersPage);
router.get("/edit-order", ensureLoggedIn({ redirectTo: "/admin/login" }), orderController.editOrder);

router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404" });
});

module.exports = router;
