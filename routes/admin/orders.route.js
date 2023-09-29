const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", orderController.ordersPage);
router.get("/:id", orderController.editOrder);
router.put("/update/:id", orderController.updateOrderStatus);
router.post("/search", orderController.searchOrder);

module.exports = router;
