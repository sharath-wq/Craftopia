const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/admin/orderController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", orderController.ordersPage);
router.get("/edit", orderController.editOrder);

module.exports = router;
