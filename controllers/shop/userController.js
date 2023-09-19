const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");

/**
 * Wishlist Page Route
 * Method GET
 */
exports.wishlistpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/wishlist", { title: "Wishlist", page: "wishlist" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Profile Page Route
 * Method GET
 */
exports.profilepage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const user = await User.findById(req.user._id).populate("address");
        res.render("shop/pages/user/profile", { title: "Profile", page: "profile", user, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Profile page
 * Method PUT
 */
exports.editProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, street, city, state, pincode, mobile } = req.body;
    const id = req.params.id;
    try {
        validateMongoDbId(id);
        const address = await Address.create({
            street: street,
            city: city,
            state: state,
            pincode: pincode,
            mobile: mobile,
        });
        const user = await User.findByIdAndUpdate(id, {
            firstName: firstName,
            lastName: lastName,
            $push: { address: address._id },
        });

        req.flash("success", "Profile updated");
        res.redirect("/user/profile");
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
        const address = await Address.find();
        const messages = req.flash();
        res.render("shop/pages/user/address", { title: "Address", page: "address", address, messages });
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
        const newAddress = await Address.create(req.body);
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
        validateMongoDbId(id);
        const address = await Address.findByIdAndDelete(id);
        req.flash("warning", `${address.title} deleted`);
        res.redirect("/user/address");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/checkout", { title: "Checkout", page: "checkout" });
    } catch (error) {
        throw new Error(error);
    }
});
