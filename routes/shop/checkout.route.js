const express = require("express");
const router = express.Router();
const checkoutController = require("../../controllers/shop/checkoutController");

router.post("/", checkoutController.checkoutpage);
router.get("/get", checkoutController.getCartData);
router.post("/place-order", checkoutController.placeOrder);

module.exports = router;
