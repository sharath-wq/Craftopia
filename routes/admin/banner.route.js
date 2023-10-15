// Banner Routes
const express = require("express");
const router = express.Router();
const bannerController = require("../../controllers/admin/bannerController");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../../public/admin/uploads"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 10, // Set the limit to 10 megabytes (adjust as needed)
    },
});

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", bannerController.bannerspage);
router.get("/add", bannerController.addBannerpage);

router.post("/add", upload.single("file"), bannerController.createBanner);

module.exports = router;
