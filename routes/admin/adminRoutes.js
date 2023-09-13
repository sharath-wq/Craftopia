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
const customerController = require("../../controllers/admin/customerController");
const orderController = require("../../controllers/admin/orderController");

// Middlewares
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const { ensureAdmin, ensureSuperAdmin, isBlockedAdmin } = require("../../middlewares/authMiddleware");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Admin Routes
router.get("/", ensureLoggedIn({ redirectTo: "/admin/login" }), ensureAdmin, isBlockedAdmin, adminController.homepage);
router.get(
    "/dashboard",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    adminController.dashboardpage
);
router.get(
    "/settings",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    adminController.settingspage
);
router.get(
    "/sales-report",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    adminController.salesReportpage
);

// Auth Rotues
router.get("/login", ensureLoggedOut({ redirectTo: "/admin/dashboard" }), authController.loginpage);
router.get(
    "/logout",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,

    authController.logoutAdmin
);
router.get("/blocked/:id", authController.blockedAdminpage);

router.post(
    "/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/admin/dashboard",
        failureRedirect: "/admin/login",
        failureFlash: true,
    })
);

// Product Routes
router.get(
    "/products",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.productspage
);
router.get(
    "/product/add",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.addProductpage
);
router.get(
    "/product/edit/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.editProductpage
);

router.post(
    "/product/add",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.createProduct
);

router.put(
    "/product/edit/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.updateProduct
);

router.delete(
    "/product/delete/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    productController.deleteProduct
);

// Category Routes
router.get(
    "/categories",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.categoriespage
);
router.get(
    "/category/add",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.addCategorypage
);
router.get(
    "/category/edit/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.editCategorypage
);

router.post(
    "/category/add",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.addCategory
);

router.put(
    "/category/unlist/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.unlist
);

router.put(
    "/category/list/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.list
);

router.put(
    "/category/edit/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.editCategory
);

router.delete(
    "/category/delete/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    categoryController.deleteCategory
);

// Banner Routes
router.get(
    "/banners",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    bannerController.bannerspage
);
router.get(
    "/add-banner",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    bannerController.addBannerpage
);

// Coupon Routes
router.get(
    "/coupons",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    couponController.couponspage
);
router.get(
    "/add-coupon",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    couponController.addCoupon
);

// Customer Routes
router.get(
    "/customers",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    customerController.customerpage
);
router.get(
    "/customer/view/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    customerController.viewCustomer
);

router.put(
    "/customer/block/:id",
    ensureLoggedIn({ redirectTo: "/auth/login" }),
    ensureAdmin,
    isBlockedAdmin,
    customerController.blockCustomer
);
router.put(
    "/customer/unblock/:id",
    ensureLoggedIn({ redirectTo: "/auth/login" }),
    ensureAdmin,
    isBlockedAdmin,
    customerController.unblockCustomer
);

// Admin Routes
router.get(
    "/admins",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureSuperAdmin,
    isBlockedAdmin,
    adminController.adminpage
);
router.get(
    "/admins/view/:id",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureSuperAdmin,
    isBlockedAdmin,
    adminController.viewAdmin
);

router.put(
    "/admins/block/:id",
    ensureLoggedIn({ redirectTo: "/auth/login" }),
    ensureSuperAdmin,
    isBlockedAdmin,
    adminController.blockAdmin
);
router.put(
    "/admins/unblock/:id",
    ensureLoggedIn({ redirectTo: "/auth/login" }),
    ensureSuperAdmin,
    isBlockedAdmin,
    adminController.unblockAdmin
);

// Order Routes
router.get(
    "/orders",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    orderController.ordersPage
);
router.get(
    "/edit-order",
    ensureLoggedIn({ redirectTo: "/admin/login" }),
    ensureAdmin,
    isBlockedAdmin,
    orderController.editOrder
);

router.get("*", (req, res) => {
    res.render("admin/pages/404", { title: "404" });
});

module.exports = router;
