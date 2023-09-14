const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Product Routes
router.get("/", productController.productspage);
router.get("/add", productController.addProductpage);
router.get("/edit/:id", productController.editProductpage);
router.post("/add", productController.createProduct);
router.put("/edit/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
