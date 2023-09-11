const express = require("express");
const router = express.Router();

// Controllers
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");
const authController = require("../../controllers/shop/authController");
const userControler = require("../../controllers/shop/userController");
const orderController = require("../../controllers/shop/orderController");
const cartController = require("../../controllers/shop/cartController");

const passport = require("passport");
const { body, validationResult } = require("express-validator");

// Middlewares
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/", shopController.shopHomepage);
router.get("/contact", shopController.contactpage);
router.get("/about", shopController.aboutpage);

// Product Routes
router.get("/shop", productController.shoppage);
router.get("/product/:id", productController.singleProductpage);

// Auth Routes
router.get("/login", ensureLoggedOut({ redirectTo: "/" }), authController.loginpage);
router.get("/logout", ensureLoggedIn({ redirectTo: "/login" }), authController.logoutUser);
router.get("/register", ensureLoggedOut({ redirectTo: "/" }), authController.registerpage);
router.get("/forgot-password", ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordpage);
router.get("/forgot-password-success", ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordSuccesspage);

router.post(
    "/login",
    passport.authenticate("local", { successRedirect: "/", failureRedirect: "/login", failureFlash: true })
);

router.post(
    "/register",
    [
        body("email").trim().isEmail().withMessage("Email must be valid email").normalizeEmail().toLowerCase(),
        body("mobile").trim().isMobilePhone().withMessage("Enter a valid mobile number"),
        body("password").trim().isLength(2).withMessage("Password length short, min 2 characters required"),
        body("confirm-password").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password do not match");
            }
            return true;
        }),
    ],
    authController.registerUser
);
// User Routes
router.get("/wishlist", ensureLoggedIn({ redirectTo: "/login" }), userControler.wishlistpage);
router.get("/profile", ensureLoggedIn({ redirectTo: "/login" }), userControler.profilepage);
router.get("/address", ensureLoggedIn({ redirectTo: "/login" }), userControler.addresspage);
router.get("/checkout", ensureLoggedIn({ redirectTo: "/login" }), userControler.checkoutpage);
router.get("/add-address", ensureLoggedIn({ redirectTo: "/login" }), userControler.addAddresspage);

// Order Routes
router.get("/orders", ensureLoggedIn({ redirectTo: "/login" }), orderController.orderspage);
router.get("/order-completed", ensureLoggedIn({ redirectTo: "/login" }), orderController.orderCompletedpage);

// Cart Routes
router.get("/cart", ensureLoggedIn({ redirectTo: "/login" }), cartController.cartpage);

module.exports = router;
