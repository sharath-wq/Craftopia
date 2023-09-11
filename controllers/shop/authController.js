const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const { generateToken } = require("../../config/jwt");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    const user = req?.session?.user;
    console.log(user);
    try {
        if (!user) {
            res.render("shop/pages/auth/login", { title: "Login", page: "login" });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Login User
 * Method POST
 */
exports.loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        const existingUser = await User.findOne({ email });
        if (existingUser && (await existingUser.isPasswordMatched(password))) {
            const accessToken = await generateToken(existingUser?._id);
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 72 * 60 * 60 * 1000,
            });
            req.session.user = existingUser;
            res.redirect("/");
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Logout User Route
 * Method GET
 */
exports.logoutUser = asyncHandler(async (req, res) => {
    const accessToken = req?.cookies?.accessToken;
    try {
        if (accessToken) {
            res.clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
            });
            req.session.user = null;
            res.redirect("/login");
        } else {
            res.redirect("/login");
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
    const user = req?.session?.user;
    try {
        if (user) {
            res.redirect("/");
        } else {
            res.render("shop/pages/auth/register", { title: "Register", page: "register" });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Register User
 * Method POST
 */
exports.registerUser = asyncHandler(async (req, res) => {
    try {
        const email = req.body.email;
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            const newUser = await User.create(req.body);
            req.session.user = newUser;
            res.redirect("/");
        } else {
            throw new Error("User Already Exists");
        }
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
