const asyncHandler = require("express-async-handler");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/auth/login", { title: "Login" });
    } catch (error) {
        throw new Error(error);
    }
});
