const userAuthMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
};

const adminAuthMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/admin/login");
    }
};

const isUserNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/");
    } else {
        next();
    }
};

const isAdminNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        next();
    }
};

module.exports = { userAuthMiddleware, adminAuthMiddleware, isUserNotAuthenticated, isAdminNotAuthenticated };
