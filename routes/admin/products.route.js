const express = require("express");
const router = express.Router();
const productController = require("../../controllers/admin/productController");
const upload = require("../../utils/upload");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Product Routes
router.get("/", productController.productspage);
router.get("/add", productController.addProductpage);
router.get("/edit/:id", productController.editProductpage);
router.get("/edit/images/:id", productController.editProductImagespage);
router.post("/add", upload.array("files", 4), productController.createProduct);
router.put("/edit/:id", productController.updateProduct);
router.put("/list/:id", productController.listProduct);
router.put("/unlist/:id", productController.unlistProdcut);
router.put("/edit/images/upload/:id", upload.single("file"), productController.editProductImages);

module.exports = router;
