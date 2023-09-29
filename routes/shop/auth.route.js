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
router.get("/blocked/:id", authController.blockedUserpage);
router.get("/reset-password/:token", ensureLoggedOut({ redirectTo: "/" }), authController.resetPasswordpage);
router.get("/send-otp", ensureLoggedIn({ redirectTo: "/auth/login" }), authController.sendOtppage);
router.get("/verify-otp", ensureLoggedIn({ redirectTo: "/auth/login" }), authController.verifyOtppage);
router.get("/verify-email", authController.verifyEmailpage);

router.post("/register", registerValidator, authController.registerUser);
router.post(
    "/login",
    passport.authenticate("local", { successRedirect: "/", failureRedirect: "/auth/login", failureFlash: true })
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/send-otp", ensureLoggedIn({ redirectTo: "/" }), authController.sendOtp);
router.post("/verify-otp", ensureLoggedIn({ redirectTo: "/" }), authController.verifyOtp);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-email", authController.resendEmail);
router.put("/reset-password/:token", authController.resetPassword);

module.exports = router;
