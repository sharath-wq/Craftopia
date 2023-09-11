const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Customer Page Route
 * Method GET
 */
exports.customerpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const users = await User.find();
        res.render("admin/pages/customer/customers", { title: "Customer", users, messages });
    } catch (error) {
        throw new Error(error);
    }
});
