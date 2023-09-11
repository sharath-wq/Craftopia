const asyncHandler = require("express-async-handler");
const Admin = require("../../models/adminModel");
const { generateToken } = require("../../config/jwt");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    const admin = req?.session?.admin;
    try {
        if (admin) {
            res.redirect("/admin/dashboard");
        } else {
            res.render("admin/pages/auth/login", { title: "Login" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Login Admin Route
 * Method GET
 */
exports.loginAdmin = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin && (await existingAdmin.isPasswordMatched(password))) {
            const accessToken = await generateToken(existingAdmin._id);
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 72 * 60 * 60 * 1000,
            });
            req.session.admin = existingAdmin;
            res.redirect("/admin/dashboard");
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Logout Admin Route
 * Method GET
 */
exports.logoutAdmin = asyncHandler(async (req, res) => {
    const accessToken = req?.cookies?.accessToken;
    try {
        if (accessToken) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
            });
            req.session.admin = null;
            res.redirect("/admin/login");
        } else {
            res.redirect("/admin/login");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register Page Route
 * Method GET
 */
exports.registerpage = asyncHandler(async (req, res) => {
    const admin = req?.session?.admin;
    try {
        if (admin) {
            res.redirect("/admin");
        } else {
            res.render("admin/pages/auth/register", { title: "Register" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register Admin Route
 * Method POST
 */
exports.registerAdmin = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        const existingAdmin = await Admin.findOne({ email: email });

        if (!existingAdmin) {
            const newAdmin = await Admin.create(req.body);
            req.session.admin = newAdmin;
            res.redirect("/admin");
        } else {
            throw new Error("Admin Already Exists");
        }
    } catch (error) {
        throw new Error(error);
    }
});
