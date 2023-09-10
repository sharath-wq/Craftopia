const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const validateMongodbId = require("../../utils/validateMongodbId");

/**
 * Customer Page Route
 * Method GET
 */
exports.customerpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/customer/customers", { title: "Customer" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Customer Page Route
 * Method GET
 */
exports.editCustomer = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/customer/edit-customer", { title: "Edit Customer" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Block Customer
 * Method PUT
 */
exports.blockCustomer = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongodbId(id);
    try {
        const blockedCustomer = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            }
        );
        res.json(blockedCustomer);
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unblock Customer
 * Method PUT
 */
exports.unblockCustomer = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongodbId(id);
    try {
        const unblockCustomer = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            }
        );
        res.json(unblockCustomer);
    } catch (error) {
        throw new Error(error);
    }
});
