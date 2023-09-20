const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Otp = require("../../models/otpModel");
const { generateOtp } = require("../../utils/sendOtp");
const sendEmail = require("../../utils/sendEmail");
const { validationResult } = require("express-validator");

/**
 * Wishlist Page Route
 * Method GET
 */
exports.wishlistpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/wishlist", { title: "Wishlist", page: "wishlist" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Profile Page Route
 * Method GET
 */
exports.profilepage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const user = await User.findById(req.user._id).populate("address");
        res.render("shop/pages/user/profile", { title: "Profile", page: "profile", user, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Profile page
 * Method PUT
 */
exports.editProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, street, city, state, pincode, mobile } = req.body;
    const id = req.params.id;
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            res.redirect("/user/profile");
        } else {
            validateMongoDbId(id);
            const address = await Address.create({
                street: street,
                city: city,
                state: state,
                pincode: pincode,
                mobile: mobile,
            });
            const user = await User.findByIdAndUpdate(id, {
                firstName: firstName,
                lastName: lastName,
                $push: { address: address._id },
            });

            req.flash("success", "Profile updated");
            res.redirect("/user/profile");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Address Page Route
 * Method GET
 */
exports.addresspage = asyncHandler(async (req, res) => {
    try {
        const address = await Address.find();
        const messages = req.flash();
        res.render("shop/pages/user/address", { title: "Address", page: "address", address, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Address Page Route
 * Method GET
 */
exports.addAddresspage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/add-address", { title: "Add Address", page: "add-address" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Address Route
 * Method POST
 */
exports.addAddress = asyncHandler(async (req, res) => {
    try {
        const newAddress = await Address.create(req.body);
        req.flash("success", "Address Added");
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Address page Route
 * Method GET
 */
exports.editAddresspage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const address = await Address.findById(id);
        res.render("shop/pages/user/edit-address", { title: "Edit Address", page: "Edit-address", address });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Address Route
 * Method POST
 */
exports.editAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const address = await Address.findByIdAndUpdate(id, req.body);
        req.flash("success", `${address.title} updated`);
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Address Route
 * Method DELETE
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const address = await Address.findByIdAndDelete(id);
        req.flash("warning", `${address.title} deleted`);
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/checkout", { title: "Checkout", page: "checkout" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Send Email Route
 * Method GET
 */
exports.sendEmail = asyncHandler(async (req, res) => {
    try {
        const otp = await Otp.create({
            user_id: req.user._id,
            user_email: req.user.email,
            otp_code: generateOtp(),
            expiration_time: Date.now() + 5 * 60 * 1000,
        });
        try {
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body>
    <table cellspacing="0" cellpadding="0" width="100%">
        <tr>
            <td align="center" style="background-color: #f4f4f4; padding: 40px 0;">
                <table cellspacing="0" cellpadding="0" width="600" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <tr>
                        <td style="text-align: center; padding: 30px;">
                            <h2>Verify Your Email Address</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px;">
                            <p>Dear ${req.user.firstName},</p>
                            <p>Thank you for registering with Craftopia! To complete the registration process and ensure the security of your account, please verify your email address.</p>
                            <p>Here is your one-time verification code:</p>
                            <p style="font-size: 24px; font-weight: bold;">OTP Code: ${otp.otp_code}</p>
                            <p>Please use this code within the next 5 minutes to confirm your email address. If you do not verify your email within this time frame, you will need to request a new OTP.</p>
                            <p>If you did not sign up for an account with Craftopia, please disregard this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 30px;">
                            <p>Thank you for choosing Craftopia. We look forward to serving you!</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
            sendEmail({
                email: req.user.email,
                subject: "Email Verification",
                html: html,
            });
            req.flash("success", "Email Send Please check your inbox");
            return res.redirect("/auth/verify-email");
        } catch (error) {
            res.json("Error");
            req.flash("danger", "Failed to send verification mail");
            res.redirect("/user/profile");
        }
        req.flash("success", "Email Verified");
        res.redirect("/user/profile");
    } catch (error) {
        throw new Error(error);
    }
});
