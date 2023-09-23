const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", adminController.adminpage);
router.get("/view/:id", adminController.viewAdmin);
router.put("/block/:id", adminController.blockAdmin);
router.put("/unblock/:id", adminController.unblockAdmin);
router.put("/update-role/:id", adminController.updateRole);

module.exports = router;
