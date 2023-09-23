const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/authController");
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const { ensureAdmin } = require("../../middlewares/authMiddleware");
const passport = require("passport");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: "/admin",
        failureRedirect: "/admin/auth/login",
        failureFlash: true,
    })
);

router.get("/login", ensureLoggedOut({ redirectTo: "/admin/dashboard" }), authController.loginpage);
router.get(
    "/logout",
    ensureLoggedIn({ redirectTo: "/admin/auth/login" }),
    ensureAdmin,

    authController.logoutAdmin
);
router.get("/blocked/:id", authController.blockedAdminpage);

router.post(
    "/login",
    passport.authenticate("local", {
        successReturnToOrRedirect: "/admin/dashboard",
        failureRedirect: "/admin/auth/login",
        failureFlash: true,
    })
);

module.exports = router;
