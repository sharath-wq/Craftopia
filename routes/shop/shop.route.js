const express = require("express");
const router = express.Router();

// Controllers
const shopController = require("../../controllers/shop/shopController");
const productController = require("../../controllers/shop/productController");

const { isBlockedUser } = require("../../middlewares/authMiddleware");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/", isBlockedUser, shopController.shopHomepage);
router.get("/contact", isBlockedUser, shopController.contactpage);
router.get("/about", isBlockedUser, shopController.aboutpage);

// Product Routes
router.get("/shop", isBlockedUser, productController.shoppage);
router.get("/product/:id", isBlockedUser, productController.singleProductpage);

// Cart Routes

module.exports = router;
