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
