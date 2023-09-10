const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const userAuthMiddleware = asyncHandler(async (req, res, next) => {
    if (req?.cookies?.accessToken) {
        token = req?.cookies?.accessToken;
        try {
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decode.id);
                req.session.user = user;
                next();
            }
        } catch (error) {
            throw new Error("Token is not valid!, Please Login agian");
        }
    } else {
        res.redirect("/admin/login");
    }
});

const adminAuthMiddleware = asyncHandler(async (req, res, next) => {
    if (req?.cookies?.accessToken) {
        token = req?.cookies?.accessToken;
        try {
            if (token) {
                const decode = jwt.verify(token, process.env.JWT_SECRET);
                const admin = await Admin.findById(decode.id);
                req.session.admin = admin;
                next();
            }
        } catch (error) {
            throw new Error("Token is not Valid!, Please Login Again");
        }
    } else {
        res.redirect("/admin/login");
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const admin = req?.session?.admin;
    if (admin) {
        try {
            const { email } = admin;
            const adminUser = await Admin.findOne({ email });
            if (adminUser.role === "admin" || adminUser.role === "superadmin") {
                next();
            } else {
                throw new Error("You are not an admin");
            }
        } catch (error) {
            throw new Error(error);
        }
    } else {
        throw new Error("You are not an admin");
    }
});

const isSuperAdmin = asyncHandler(async (req, res, next) => {
    const superAdmin = req?.session?.admin;
    if (superAdmin) {
        try {
            const { email } = superAdmin;
            const adminUser = await Admin.findOne({ email });
            if (adminUser.role !== "superadmin") {
                throw new Error("You need super admin privilage to do this");
            } else {
                next();
            }
        } catch (error) {
            throw new Error(error);
        }
    } else {
        throw new Error("You are not an admin");
    }
});

module.exports = { userAuthMiddleware, adminAuthMiddleware, isAdmin, isSuperAdmin };
