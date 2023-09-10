const express = require("express");
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");
const authController = require("../../controllers/shop/authController");
const userControler = require("../../controllers/shop/userController");
const orderController = require("../../controllers/shop/orderController");
const cartController = require("../../controllers/shop/cartController");
const { userAuthMiddleware } = require("../../middlewares/authMiddleware");
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
router.get("/logout", authController.logoutUser);
router.get("/forgot-password", authController.forgotPasswordpage);
router.get("/forgot-password-success", authController.forgotPasswordSuccesspage);

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

// User Routes
router.get("/wishlist", userAuthMiddleware, userControler.wishlistpage);
router.get("/profile", userAuthMiddleware, userControler.profilepage);
router.get("/address", userAuthMiddleware, userControler.addresspage);
router.get("/checkout", userAuthMiddleware, userControler.checkoutpage);
router.get("/add-address", userAuthMiddleware, userControler.addAddresspage);

// Order Routes
router.get("/orders", userAuthMiddleware, orderController.orderspage);
router.get("/order-completed", userAuthMiddleware, orderController.orderCompletedpage);

// Cart Routes
router.get("/cart", userAuthMiddleware, cartController.cartpage);

/**
 * TODO:
 * Fix the 404 page error
 */

// router.get("/*", (req, res) => {
//     res.render("shop/pages/404", { title: "404 Page", page: "404" });
// });

module.exports = router;
