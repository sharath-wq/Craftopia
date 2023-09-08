const asyncHandler = require("express-async-handler");

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
