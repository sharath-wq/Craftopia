const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    user_mobile: {
        type: String,
        default: null,
    },
    otp_code: {
        type: String,
        required: true,
    },
    expiration_time: {
        type: Date,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    used: {
        type: Boolean,
        default: false,
    },
});

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
