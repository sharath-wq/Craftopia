const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const { validationResult } = require("express-validator");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/login", { title: "Login", page: "login", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Logout Route
 * Method GET
 */
exports.logoutUser = asyncHandler(async (req, res, next) => {
    try {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Logged Out!");
            res.redirect("/login");
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register a User
 * Method POST
 */
exports.registerUser = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            const messages = req.flash();
            res.render("shop/pages/auth/register", { title: "Register", page: "Login", messages, data: req.body });
        } else {
            const email = req.body.email;
            const existingUser = await User.findOne({ email: email });

            if (!existingUser) {
                const newUser = await User.create(req.body);
                req.flash("success", "Admin Registerd Successfully Please Login");
                res.redirect("/login");
            } else {
                req.flash("warning", "Email Alardy Registerd Please login");
                res.redirect("/login");
            }
        }
    } catch (error) {
        if (error.keyPattern.mobile === 1) {
            req.flash("danger", "Mobile number already registered");
            res.redirect("/register");
        } else {
            throw new Error(error);
        }
    }
});

/**
 * Register Page Route
 * Method GET
 */
exports.registerpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/register", { title: "Register", page: "register", data: "", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Forgot Password Page Route
 * Method GET
 */
exports.forgotPasswordpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/auth/forgot-password", { title: "Forgot Password", page: "forgot-password" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Forgot Password Success Page Route
 * Method GET
 */
exports.forgotPasswordSuccesspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/auth/forgot-password-success", {
            title: "Forgot Password Success",
            page: "forgot-password-success",
        });
    } catch (error) {
        throw new Error(error);
    }
});
