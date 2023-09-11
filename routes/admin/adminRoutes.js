const express = require("express");
const router = express();

const adminController = require("../../controllers/admin/adminController");
const authController = require("../../controllers/admin/authController");
const productController = require("../../controllers/admin/productController");
const categoryController = require("../../controllers/admin/categoryController");
const bannerController = require("../../controllers/admin/bannerController");
const couponController = require("../../controllers/admin/couponController");
const custoemrController = require("../../controllers/admin/customerController");
const orderController = require("../../controllers/admin/orderController");

const { adminAuthMiddleware, isSuperAdmin, isAdmin } = require("../../middlewares/authMiddleware");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Admin Routes
router.get("/", adminController.homepage);
router.get("/dashboard", adminAuthMiddleware, isAdmin, adminController.dashboardpage);
router.get("/settings", adminAuthMiddleware, isAdmin, adminController.settingspage);
router.get("/sales-report", adminAuthMiddleware, isSuperAdmin, adminController.salesReportpage);

// Auth Rotues
router.get("/login", authController.loginpage);
router.get("/register", authController.registerpage);
router.get("/logout", authController.logoutAdmin);

router.post("/register", authController.registerAdmin);
router.post("/login", authController.loginAdmin);

// Product Routes
router.get("/products", adminAuthMiddleware, isAdmin, productController.productspage);
router.get("/add-product", adminAuthMiddleware, isAdmin, productController.addProductpage);
router.get("/edit-product", adminAuthMiddleware, isAdmin, productController.editProductpage);

// Category Routes
router.get("/categories", adminAuthMiddleware, isAdmin, categoryController.categoriespage);
router.get("/add-category", adminAuthMiddleware, isAdmin, categoryController.addCategorypage);

// Banner Routes
router.get("/banners", adminAuthMiddleware, isAdmin, bannerController.bannerspage);
router.get("/add-banner", adminAuthMiddleware, isAdmin, bannerController.addBannerpage);

// Coupon Routes
router.get("/coupons", adminAuthMiddleware, isAdmin, couponController.couponspage);
router.get("/add-coupon", adminAuthMiddleware, isAdmin, couponController.addCoupon);

// Customer Routes
router.get("/customers", adminAuthMiddleware, isSuperAdmin, custoemrController.customerpage);

router.put("/customer/block/:id", adminAuthMiddleware, isAdmin, custoemrController.blockCustomer);
router.put("/customer/unblock/:id", adminAuthMiddleware, isAdmin, custoemrController.unblockCustomer);

// Order Routes
router.get("/orders", adminAuthMiddleware, isAdmin, orderController.ordersPage);
router.get("/edit-order", adminAuthMiddleware, isAdmin, orderController.editOrder);

router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404" });
});

module.exports = router;
