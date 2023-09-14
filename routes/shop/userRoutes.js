const express = require("express");
const router = express.Router();
const userControler = require("../../controllers/shop/userController");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

// User Routes
router.get("/wishlist", userControler.wishlistpage);
router.get("/profile", userControler.profilepage);
router.get("/address", userControler.addresspage);
router.get("/checkout", userControler.checkoutpage);
router.get("/address/add", userControler.addAddresspage);

module.exports = router;
