const express = require("express");
const router = express.Router();
const userControler = require("../../controllers/shop/userController");
const { profileValidator } = require("../../utils/validator");
const upload = require("../../utils/upload");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

// User Routes
router.get("/profile", userControler.profilepage);
router.get("/address", userControler.addresspage);
router.get("/address/add", userControler.addAddresspage);
router.get("/address/edit/:id", userControler.editAddresspage);
router.get("/profile/send-email-otp", userControler.sendEmail);
router.get("/profile/wallet/:id", userControler.walletTransactionspage);

router.post("/address/add", userControler.addAddress);
router.post("/review/add/:id", userControler.addReview);

router.put("/profile/edit/:id", profileValidator, upload.single("file"), userControler.editProfile);
router.put("/address/edit/:id", userControler.editAddress);

router.delete("/address/delete/:id", userControler.deleteAddress);

module.exports = router;
