const asyncHandler = require("express-async-handler");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/auth/login", { title: "Login", page: "login" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register Page Route
 * Method GET
 */
exports.registerpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/auth/register", { title: "Register", page: "register" });
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
