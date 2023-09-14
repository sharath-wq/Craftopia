const express = require("express");
const router = express.Router();
const customerController = require("../../controllers/admin/customerController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

router.get("/", customerController.customerpage);
router.get("/view/:id", customerController.viewCustomer);
router.put("/block/:id", customerController.blockCustomer);
router.put("/unblock/:id", customerController.unblockCustomer);
router.put("/update-role/:id", customerController.updateRole);

module.exports = router;
