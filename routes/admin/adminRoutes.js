const express = require("express");
const router = express();

// Controllers
const adminController = require("../../controllers/admin/adminController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Admin Routes
router.get("/", adminController.homepage);
router.get("/dashboard", adminController.dashboardpage);
router.get("/settings", adminController.settingspage);
router.get("/sales-report", adminController.salesReportpage);

router.use((req, res) => {
    res.render("admin/pages/404", { title: "404", page: "404" });
});

module.exports = router;
