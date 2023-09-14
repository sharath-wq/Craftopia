const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const User = require("../../models/userModel");
/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("admin/pages/auth/login", { title: "Login", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Blcoked Admin page
 * Method GET
 */
exports.blockedAdminpage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const user = await User.findById(id);
        res.render("admin/pages/auth/blocked", { title: "Blocked", page: "blocked", user });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Logout Admin
 * Method GET
 */
exports.logoutAdmin = asyncHandler(async (req, res, next) => {
    try {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Logged Out!");
            res.redirect("/admin/login");
        });
    } catch (error) {
        throw new Error(error);
    }
});
