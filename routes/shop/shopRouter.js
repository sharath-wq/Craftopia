const express = require("express");
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");
const authController = require("../../controllers/shop/authController");
const userControler = require("../../controllers/shop/userController");
const orderController = require("../../controllers/shop/orderController");
const cartController = require("../../controllers/shop/cartController");
const router = express.Router();

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
router.get("/register", authController.registerpage);
router.get("/forgot-password", authController.forgotPasswordpage);
router.get("/forgot-password-success", authController.forgotPasswordSuccesspage);

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
