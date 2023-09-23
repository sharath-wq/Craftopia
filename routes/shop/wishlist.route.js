const express = require("express");
const router = express.Router();
const wishlsitController = require("../../controllers/shop/wishlistController");

router.get("/", wishlsitController.wishlistpage);
router.get("/add/:id", wishlsitController.addToWishlist);
router.get("/remove/:id", wishlsitController.removeFromWishlist);

module.exports = router;
