const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const { validationResult } = require("express-validator");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Category = require("../../models/categoryModel");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const Otp = require("../../models/otpModel");
const { generateOtp, sendOtp } = require("../../utils/sendOtp");

/**
 * Login Page Route
 * Method GET
 */
exports.loginpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const categories = await Category.find({ isListed: true });
        res.render("shop/pages/auth/login", { title: "Login", page: "login", messages, categories });
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
            res.redirect("/auth/login");
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Blcoked User page
 * Method GET
 */
exports.blockedUserpage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const user = await User.findById(id);
        res.render("shop/pages/auth/blocked", { title: "Blocked", page: "blocked", user });
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
                req.flash("success", "User Registerd Successfully Please Login");
                res.redirect("/auth/login");
            } else {
                req.flash("warning", "Email Alardy Registerd Please login");
                res.redirect("/auth/login");
            }
        }
    } catch (error) {
        if (error.keyPattern.mobile === 1) {
            req.flash("danger", "Mobile number already registered");
            res.redirect("/auth/register");
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
        const messages = req.flash();
        res.render("shop/pages/auth/forgot-password", { title: "Forgot Password", page: "forgot-password", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Forgot Password Route
 * Method POST
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            req.flash("danger", "Email Not Found");
            return res.redirect("/auth/forgot-password");
        }

        const resetToken = await user.createResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/auth/reset-password/${resetToken}`;
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td>
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" bgcolor="#007bff" style="padding: 40px 0;">
                            <h1 style="color: #ffffff;">Password Reset</h1>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" style="padding: 40px 30px;">
                            <p>Dear ${user.firstName},</p>
                            <p>We have received a request to reset your password. To reset your password, click the button below:</p>
                            <p style="text-align: center;">
                                <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                            </p>
                            <p>If you didn't request a password reset, you can ignore this email. Your password will remain unchanged.</p>
                            <p>Thank you for using our service!</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#f4f4f4" style="text-align: center; padding: 20px 0;">
                            <p>&copy; 2023 Craftopia</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset",
                html: html,
            });

            req.flash("success", "Reset Link sent to your mail id");
            return res.redirect("/auth/forgot-password");
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires = undefined;
            console.error(error);
            req.flash("danger", "There was an error sending the password reset email, please try again later");
            return res.redirect("/auth/forgot-password");
        }
    } catch (error) {
        console.error(error);
        req.flash("danger", "An error occurred, please try again later");
        return res.redirect("/auth/forgot-password");
    }
});

/**
 * Reset Password Page Route
 * Method GET
 */
exports.resetPasswordpage = asyncHandler(async (req, res) => {
    try {
        const token = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {
            req.flash("warning", "Token is invalid or has expired");
            res.redirect("/auth/forgot-password");
        }

        res.render("shop/pages/auth/reset-password", { title: "Reset Password", page: "Reset-password", token });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Reset Password Route
 * Method PUT
 */
exports.resetPassword = asyncHandler(async (req, res) => {
    const token = req.params.token;
    try {
        const user = await User.findOne({ passwordResetToken: token, passwordResetTokenExpires: { $gt: Date.now() } });

        if (!user) {
            req.flash("warning", "Token is invalid or has expired");
            res.redirect("/auth/forgot-password");
        }

        user.password = req.body.password;
        user.passwordResetToken = null;
        user.passwordResetTokenExpires = null;
        user.passwordChangedAt = Date.now();

        await user.save();

        req.flash("success", "Password changed");
        res.redirect("/auth/login");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Send Otp page Route
 * Method GET
 */
exports.sendOtppage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/send-otp", { title: "Send Otp", page: "Send Otp", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Verify Otp page Route
 * Method GET
 */
exports.verifyOtppage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("shop/pages/auth/verify-otp", { title: "Verify Otp", page: "Verify Otp", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Send Otp Route
 * Method POST
 */
exports.sendOtp = asyncHandler(async (req, res) => {
    try {
        const { mobile } = req.body;
        const otp = await Otp.create({
            user_id: req.user.id,
            user_mobile: mobile,
            otp_code: generateOtp(),
            expiration_time: Date.now() + 5 * 60 * 1000,
        });

        try {
            sendOtp(mobile, otp.otp_code);
            req.flash("success", "OTP sent successfully");
            res.redirect("/auth/verify-otp");
        } catch (error) {
            req.flash("danger", "Failed to send OTP");
            res.redirect("/auth/send-otp");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Verify Otp Route
 * Method POST
 */
exports.verifyOtp = asyncHandler(async (req, res) => {
    try {
        const otp = await Otp.findOne({ otp_code: req.body.otp, expiration_time: { $gt: Date.now() }, used: false });

        if (!otp) {
            req.flash("danger", "Otp is invalid or expired");
            res.redirect("/auth/verify-otp");
        }

        await otp.updateOne({ expiration_time: null, used: true });

        const user = await User.findByIdAndUpdate(otp.user_id, {
            mobile: otp.user_mobile,
            isMobileVerified: true,
        });

        req.flash("success", "Mobile number verifed successfully");
        res.redirect("/");
    } catch (error) {
        throw new Error(error);
    }
});
