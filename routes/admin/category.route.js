const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");
const { validateCategory } = require("../../utils/validator");
const upload = require("../../utils/upload");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Category Routes
router.get("/", categoryController.categoriespage);
router.get("/add", upload.single("file"), categoryController.addCategorypage);
router.get("/edit/:id", categoryController.editCategorypage);

router.post("/add", validateCategory, categoryController.addCategory);
router.put("/unlist/:id", categoryController.unlist);
router.put("/list/:id", categoryController.list);
router.put("/edit/:id", categoryController.editCategory);
router.post("/edit/images/upload/new/:id", upload.single("file"), categoryController.addNewImage);
router.delete("/delete/:id", categoryController.deleteCategory);
router.delete("/images/delete/:id", categoryController.deleteImage);

module.exports = router;
