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
router.put("/:id", orderController.cancelOrder);
router.put("/single/:id", orderController.cancelSingleOrder);
router.post("/return/:id", orderController.returnOrder);

module.exports = router;
