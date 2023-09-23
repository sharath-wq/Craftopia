const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/shop/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

// Order Routes
router.get("/", orderController.orderspage);
router.get("/:id", orderController.singleOrder);
router.put("/:id", orderController.chancelOrder);

module.exports = router;
