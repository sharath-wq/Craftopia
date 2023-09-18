const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOtp(mobile, otp) {
    client.messages.create({
        body: `Hello! Your OTP for mobile number verification is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}`,
    });
}

module.exports = { generateOtp, sendOtp };
