const express = require("express");
const router = express.Router();
const authController = require("../../controllers/shop/authController");
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const passport = require("passport");
const { registerValidator } = require("../../utils/validator");

router.use((req, res, next) => {
    req.app.set("layout", "shop/layout");
    next();
});

router.get("/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/auth/login",
        failureFlash: true,
    })
);

// Auth Routes
router.get("/login", ensureLoggedOut({ redirectTo: "/" }), authController.loginpage);
router.get("/logout", ensureLoggedIn({ redirectTo: "/auth/login" }), authController.logoutUser);
router.get("/register", ensureLoggedOut({ redirectTo: "/" }), authController.registerpage);
router.get("/forgot-password", ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordpage);
router.get("/forgot-password-success", ensureLoggedOut({ redirectTo: "/" }), authController.forgotPasswordSuccesspage);
router.get("/blocked/:id", authController.blockedUserpage);

router.post("/register", registerValidator, authController.registerUser);
router.post(
    "/login",
    passport.authenticate("local", { successRedirect: "/", failureRedirect: "/auth/login", failureFlash: true })
);
module.exports = router;
