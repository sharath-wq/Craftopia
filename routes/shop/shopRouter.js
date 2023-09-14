const express = require("express");
const router = express.Router();

// Controllers
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");
const cartController = require("../../controllers/shop/cartController");

// Middlewares
const { ensureLoggedIn } = require("connect-ensure-login");
const { isBlockedUser } = require("../../middlewares/authMiddleware");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/", isBlockedUser, shopController.shopHomepage);
router.get("/contact", shopController.contactpage);
router.get("/about", shopController.aboutpage);

// Product Routes
router.get("/shop", productController.shoppage);
router.get("/product/:id", productController.singleProductpage);

// Cart Routes
router.get("/cart", ensureLoggedIn({ redirectTo: "/auth/login" }), cartController.cartpage);

module.exports = router;
