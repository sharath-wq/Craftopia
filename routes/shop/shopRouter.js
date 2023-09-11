const express = require("express");
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");
const authController = require("../../controllers/shop/authController");
const userControler = require("../../controllers/shop/userController");
const orderController = require("../../controllers/shop/orderController");
const cartController = require("../../controllers/shop/cartController");
const router = express.Router();
const passport = require("passport");
const { body, validationResult } = require("express-validator");

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
router.get("/login", authController.loginpage);
router.get("/logout", authController.logoutUser);
router.get("/register", authController.registerpage);
router.get("/forgot-password", authController.forgotPasswordpage);
router.get("/forgot-password-success", authController.forgotPasswordSuccesspage);

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
router.get("/wishlist", userControler.wishlistpage);
router.get("/profile", userControler.profilepage);
router.get("/address", userControler.addresspage);
router.get("/checkout", userControler.checkoutpage);
router.get("/add-address", userControler.addAddresspage);

// Order Routes
router.get("/orders", orderController.orderspage);
router.get("/order-completed", orderController.orderCompletedpage);

// Cart Routes
router.get("/cart", cartController.cartpage);

module.exports = router;
