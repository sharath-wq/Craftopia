const asyncHandler = require("express-async-handler");
const Admin = require("../../models/adminModel");
const { validationResult } = require("express-validator");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        console.log(messages);
        res.render("admin/pages/auth/login", { title: "Login", messages });
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
        const messages = req.flash();
        res.render("admin/pages/auth/register", { title: "Register", data: req.body, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register a User
 * Method POST
 */
exports.registerAdmin = asyncHandler(async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            const messages = req.flash();
            res.render("admin/pages/auth/register", { title: "Register", messages, data: req.body });
        } else {
            const email = req.body.email;
            const existingAdmin = await Admin.findOne({ email: email });

            if (!existingAdmin) {
                const newAdmin = await Admin.create(req.body);
                req.flash("success", "Admin Registerd Successfully Please Login");
                res.redirect("/admin/login");
            } else {
                req.flash("warning", "Email Alardy Registerd Please login");
                res.redirect("/admin/login");
            }
        }
    } catch (error) {
        if (error.keyPattern.mobile === 1) {
            req.flash("danger", "Mobile number already registered");
            res.redirect("/admin/register");
        } else {
            throw new Error(error);
        }
    }
});
