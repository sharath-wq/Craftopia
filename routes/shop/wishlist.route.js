const express = require("express");
const router = express.Router();
const wishlsitController = require("../../controllers/shop/wishlistController");

router.get("/", wishlsitController.wishlistpage);
router.get("/toggle/:id", wishlsitController.toggleWishlist);
router.get("/remove/:id", wishlsitController.removeFromWishlist);

module.exports = router;
