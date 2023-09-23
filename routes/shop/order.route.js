const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/shop/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

// Order Routes
router.get("/", orderController.orderspage);

module.exports = router;
