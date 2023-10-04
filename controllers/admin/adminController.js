const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const { roles } = require("../../utils/constants");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Order = require("../../models/orderModel");
const moment = require("moment");
const Product = require("../../models/productModel");
const numeral = require("numeral");
const status = require("../../utils/status");

/**
 * Home Page Route
 * Method GET
 */
exports.homepage = asyncHandler(async (req, res) => {
    const admin = req?.session?.admin;
    try {
        if (admin) {
            res.redirect("/admin/dashboard");
        } else {
            res.redirect("/admin/auth/login");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Dashborad Page Route
 * Method GET
 */
exports.dashboardpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const user = req?.user;
        const recentOrders = await Order.find()
            .limit(5)
            .populate({
                path: "user",
                select: "firstName lastName image",
            })
            .select("totalAmount orderedDate totalPrice")
            .sort({ createdAt: -1 });

        let totalSalesAmount = (await Order.find({ status: { $ne: "Cancelled" } })).reduce(
            (total, order) => total + order.totalAmount,
            0
        );
        totalSalesAmount = numeral(totalSalesAmount).format("0.0a");

        // Format timestamps using moment.js
        recentOrders.forEach((order) => {
            order.createdAtFormatted = moment(order.orderedDate).fromNow();
        });
        const totalSoldProducts = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    total_sold_count: {
                        $sum: "$sold",
                    },
                },
            },
        ]);

        const totalOrderCount = await Order.countDocuments();
        const totalActiveUserCount = await User.countDocuments({ isBlocked: false });

        res.render("admin/pages/admin/dashboard", {
            title: "Dashboard",
            user,
            messages,
            recentOrders,
            totalOrderCount,
            totalActiveUserCount,
            totalSalesAmount,
            totalSoldProducts: totalSoldProducts[0].total_sold_count,
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Settings Page Route
 * Method GET
 */
exports.settingspage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/admin/settings", { title: "Settings", user: req.user });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Admins Page Route
 * Method GET
 */
exports.adminpage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const admins = await User.find({ role: { $in: [roles.admin, roles.superAdmin] } });
        res.render("admin/pages/customer/admins", { title: "Admins", admins, messages, roles });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Block Admin
 * Method PUT
 */
exports.blockAdmin = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        if (req.user.id !== id) {
            const blockedCustomer = await User.findByIdAndUpdate(
                id,
                {
                    isBlocked: true,
                },
                {
                    new: true,
                }
            );
            if (blockedCustomer) {
                req.flash("success", `${blockedCustomer.email} Blocked Successfully`);
                res.redirect("/admin/admins");
            } else {
                req.flash("danger", `Can't block ${blockedCustomer}`);
                res.redirect("/admin/admins");
            }
        } else {
            req.flash("warning", "You can't block yourslef, ask another admin");
            res.redirect("/admin/admins");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unblock Admin
 * Method PUT
 */
exports.unblockAdmin = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
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
        if (unblockCustomer) {
            req.flash("success", `${unblockCustomer.email} Unblocked Successfully`);
            res.redirect("/admin/admins");
        } else {
            req.flash("danger", `Can't Unblock ${unblockCustomer}`);
            res.redirect("/admin/admins");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * View a Admin Page Route
 * Method GET
 */
exports.viewAdmin = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const id = req.params.id;
        validateMongoDbId(id);
        const customer = await User.findById(id);
        res.render("admin/pages/customer/customer", { title: "Admins", customer, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Sales Report Page Route
 * Method GET
 */
exports.salesReportpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/admin/sales-report", { title: "Sales Report" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Update Role
 * Method PUT
 */
exports.updateRole = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        if (req.user.id === id) {
            req.flash("warning", "Super admin cannot change their role themsleves, ask another super admin");
            res.redirect("/admin/admins");
        } else {
            const updateAdmin = await User.findByIdAndUpdate(
                id,
                {
                    role: req.body.role,
                },
                {
                    new: true,
                }
            );
            if (updateAdmin) {
                req.flash("success", `${updateAdmin.firstName} updated to ${updateAdmin.role}`);
                res.redirect("/admin/admins");
            } else {
                req.flash("danger", `Can't Update the role`);
            }
        }
    } catch (error) {
        throw new Error(error);
    }
});
