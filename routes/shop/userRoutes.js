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
router.get("/address/edit/:id", userControler.editAddresspage);

router.post("/address/add", userControler.addAddress);

router.put("/profile/edit/:id", userControler.editProfile);
router.put("/address/edit/:id", userControler.editAddress);

router.delete("/address/delete/:id", userControler.deleteAddress);
module.exports = router;
