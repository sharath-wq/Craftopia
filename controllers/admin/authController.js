const asyncHandler = require("express-async-handler");

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
        req.flash("success", "Admin Registered Successflly You can login now");

        res.redirect("/admin/login");
    } catch (error) {
        throw new Error(error);
    }
});
