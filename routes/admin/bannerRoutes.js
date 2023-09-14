// Banner Routes
const express = require("express");
const router = express.Router();
const bannerController = require("../../controllers/admin/bannerController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", bannerController.bannerspage);
router.get("/add", bannerController.addBannerpage);

module.exports = router;
