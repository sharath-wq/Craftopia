const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/shop/checkoutController");

router.post("/", checkoutController.checkoutpage);
router.get("/get", checkoutController.getCartData);
router.post("/place-order", checkoutController.placeOrder);
router.get("/order-placed/:id", checkoutController.orderPlaced);

module.exports = router;
