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
        body("firstName").isEmpty().withMessage("First Name is required"),
        body("lastName").isEmpty().withMessage("Last Name is required"),
        body("street").isEmpty().withMessage("Street is required"),
        body("city").isEmpty().withMessage("City is required"),
        body("state").isEmpty().withMessage("State is required"),
        body("pincode").isEmpty().withMessage("Pincode is required"),
        // body("mobile").isEmpty().isMobilePhone().withMessage("Invalid Mobile Number"),
    ],
    productValidator: [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("description").trim().notEmpty().withMessage("Description is required"),
        body("productPrice").isNumeric().withMessage("Product price must be a number"),
        body("salePrice").isNumeric().withMessage("Sale price must be a number"),
        body("category").isMongoId().withMessage("Invalid category ID"),
        body("quantity").isNumeric().withMessage("Quantity must be a number"),
    ],
    productEditValidator: [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("description").trim().notEmpty().withMessage("Description is required"),
        body("productPrice").isNumeric().withMessage("Product price must be a number"),
        body("salePrice").isNumeric().withMessage("Sale price must be a number"),
        body("category").isMongoId().withMessage("Invalid category ID"),
        body("quantity").isNumeric().withMessage("Quantity must be a number"),
    ],
    validateCategory: [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Category title is required")
            .isLength({ min: 3 })
            .withMessage("Enter a valid title"),
    ],
};
