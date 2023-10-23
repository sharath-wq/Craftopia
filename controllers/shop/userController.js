const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");
const Otp = require("../../models/otpModel");
const { generateOtp } = require("../../utils/sendOtp");
const sendEmail = require("../../utils/sendEmail");
const { validationResult } = require("express-validator");
const sharp = require("sharp");
const { admin } = require("../../utils/firebase");
const Wallet = require("../../models/walletModel");
const WalletTransaction = require("../../models/walletTransactionModel");

/**
 * Profile Page Route
 * Method GET
 */
exports.profilepage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const user = await User.findById(req.user._id).populate("address");
        const wallet = await Wallet.findOne({ user: user._id });
        res.render("shop/pages/user/profile", { title: "Profile", page: "profile", user, messages, wallet });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Profile page
 * Method PUT
 */
exports.editProfile = asyncHandler(async (req, res) => {
    const id = req.params.id;
    try {
        const errors = validationResult(req);
        const { firstName, lastName, mobile } = req.body;
        const file = req.file;

        if (file) {
            const avatharBuffer = await sharp(file.buffer).resize(200, 200).toBuffer();
            const avatharFileName = `avathars/${Date.now()}_${file.originalname}`;
            await admin.storage().bucket().file(avatharFileName).save(avatharBuffer);
            const avatharUrl = `${process.env.FIREBASE_URL}${avatharFileName}`;
            if (!errors.isEmpty()) {
                errors.array().forEach((error) => {
                    req.flash("danger", error.msg);
                });
                res.redirect("/user/profile");
            } else {
                validateMongoDbId(id);
                const user = await User.findByIdAndUpdate(id, {
                    firstName: firstName,
                    lastName: lastName,
                    image: avatharUrl,
                    mobile: mobile,
                });

                req.flash("success", "Profile updated");
                res.redirect("/user/profile");
            }
        } else {
            if (!errors.isEmpty()) {
                errors.array().forEach((error) => {
                    req.flash("danger", error.msg);
                });
                res.redirect("/user/profile");
            } else {
                validateMongoDbId(id);
                const user = await User.findByIdAndUpdate(id, {
                    firstName: firstName,
                    lastName: lastName,
                    mobile: mobile,
                });

                req.flash("success", "Profile updated");
                res.redirect("/user/profile");
            }
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
        const userid = req.user._id;
        const userAddres = await User.findOne(userid).populate("address");
        const messages = req.flash();
        res.render("shop/pages/user/address", { title: "Address", page: "address", address: userAddres.address, messages });
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
        const userid = req.user._id;
        const newAddress = await Address.create(req.body);
        await User.findByIdAndUpdate(userid, { $push: { address: newAddress._id } });
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
        const userId = req.user._id;
        validateMongoDbId(id);
        await User.findByIdAndUpdate(userId, { $pull: { address: id } });
        const address = await Address.findByIdAndDelete(id);
        req.flash("warning", `${address.title} deleted`);
        res.redirect("/user/address");
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

/**
 * Add Review
 * Method POST
 */
exports.addReview = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user._id;

        const existingReview = await Review.findOne({ user: userId, product: productId });

        if (existingReview) {
            existingReview.review = req.body.review;
            existingReview.rating = req.body.rating;
            await existingReview.save();
        } else {
            const newReview = await Review.create({
                user: userId,
                product: productId,
                review: req.body.review,
                rating: req.body.rating,
            });
        }
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Wallet Transactions
 * Method Get
 */
exports.walletTransactionspage = asyncHandler(async (req, res) => {
    try {
        const walletId = req.params.id;
        const walletTransactions = await WalletTransaction.find({ wallet: walletId }).sort({ timestamp: -1 });
        res.render("shop/pages/user/walletTransactions", {
            title: "Wallet Transactions",
            page: "Wallet-Transactions",
            walletTransactions,
        });
    } catch (error) {
        throw new Error(error);
    }
});
