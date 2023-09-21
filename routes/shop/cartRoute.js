const express = require("express");
const router = express.Router();

const cartController = require("../../controllers/shop/cartController");

router.get("/", cartController.cartpage);
router.get("/add/:id", cartController.addToCart);
router.get("/remove/:id", cartController.removeFromCart);
router.get("/inc/:id", cartController.incQuantity);
router.get("/dec/:id", cartController.decQuantity);

module.exports = router;
