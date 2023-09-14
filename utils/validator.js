const { body } = require("express-validator");

module.exports = {
    registerValidator: [
        body("email").trim().isEmail().withMessage("Email must be valid email").normalizeEmail().toLowerCase(),
        body("mobile").trim().isMobilePhone().withMessage("Enter a valid mobile number"),
        body("password").trim().isLength(2).withMessage("Password length short, min 2 characters required"),
        body("confirm-password").custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Password do not match");
            }
            return true;
        }),
    ],
};
