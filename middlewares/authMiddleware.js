const { roles } = require("../utils/constants");

const ensureSuperAdmin = (req, res, next) => {
    if (req.user.role === roles.superAdmin) {
        next();
    } else {
        req.flash("warning", "You are not Authorized");
        res.redirect("/admin");
    }
};

const ensureAdmin = (req, res, next) => {
    if (req.user.role === roles.admin || req.user.role === roles.superAdmin) {
        next();
    } else {
        req.flash("warning", "You are not Authorized");
        res.redirect("/");
    }
};

const isBlockedAdmin = (req, res, next) => {
    if (req.user.isBlocked) {
        res.redirect(`/admin/auth/blocked/${req.user._id}`);
    } else {
        next();
    }
};

const isBlockedUser = (req, res, next) => {
    if (req?.user?.isBlocked) {
        res.redirect(`/auth/blocked/${req.user._id}`);
    } else {
        next();
    }
};

module.exports = { ensureAdmin, ensureSuperAdmin, isBlockedAdmin, isBlockedUser };
