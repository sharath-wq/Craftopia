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
    profileValidator: [
        body("firstName").not().isEmpty().withMessage("First Name is required"),
        body("lastName").not().isEmpty().withMessage("Last Name is required"),
        body("street").not().isEmpty().withMessage("Street is required"),
        body("city").not().isEmpty().withMessage("City is required"),
        body("state").not().isEmpty().withMessage("State is required"),
        body("pincode").not().isEmpty().withMessage("Pincode is required"),
        body("mobile").not().isEmpty().isMobilePhone().withMessage("Invalid Mobile Number"),
    ],
};
