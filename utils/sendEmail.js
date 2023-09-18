const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

const sendEmail = asyncHandler(async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const emailOptions = {
        from: "Craftopia support<support@craftopia.com>",
        to: options.email,
        subject: options.subject,
        html: options.html,
    };

    await transporter.sendMail(emailOptions);
});

module.exports = sendEmail;
