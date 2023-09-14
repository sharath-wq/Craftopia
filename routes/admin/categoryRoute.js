const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/admin/categoryController");

router.use((req, res, next) => {
    req.app.set("layout", "admin/layout");
    next();
});

// Category Routes
router.get("/", categoryController.categoriespage);
router.get("/add", categoryController.addCategorypage);
router.get("/edit/:id", categoryController.editCategorypage);
router.post("/add", categoryController.addCategory);
router.put("/unlist/:id", categoryController.unlist);
router.put("/list/:id", categoryController.list);
router.put("/edit/:id", categoryController.editCategory);
router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = router;
