const express = require("express");
const router = express();
const { body, validationResult } = require("express-validator");
const passport = require("passport");

// Controllers
const adminController = require("../../controllers/admin/adminController");

// Middlewares
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const { ensureAdmin, ensureSuperAdmin, isBlockedAdmin } = require("../../middlewares/authMiddleware");

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
