const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Manage Category Page Route
 * Method GET
 */
exports.categoriespage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const categories = await Category.find();
        res.render("admin/pages/category/categories", { title: "Categories", categories, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Category Page Route
 * Method GET
 */
exports.addCategorypage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        res.render("admin/pages/category/add-category", { title: "Add Category", messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Category
 * Method POST
 */
exports.addCategory = asyncHandler(async (req, res) => {
    try {
        const existingCategory = await Category.findOne({ title: req.body.title });
        if (existingCategory) {
            req.flash("warning", "Category Alrady Exists");
            res.redirect("/admin/category/add");
        }
        const newCategory = await Category.create(req.body);
        req.flash("success", `${newCategory.title} added Successfully`);
        res.redirect("/admin/category/add");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unlist Category
 * Method PUT
 */
exports.unlist = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    // console.log(req.params.id);
    try {
        const unlistedCategory = await Category.findByIdAndUpdate(
            id,
            {
                isListed: false,
            },
            {
                new: true,
            }
        );

        if (unlistedCategory) {
            req.flash("success", `${unlistedCategory.title} is unlisted`);
            res.redirect("/admin/categories");
        } else {
            req.flash("danger", `Can't Unlist ${unlistedCategory.title}`);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * List Category
 * Method PUT
 */
exports.list = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const listedCategory = await Category.findByIdAndUpdate(
            id,
            {
                isListed: true,
            },
            {
                new: true,
            }
        );
        if (listedCategory) {
            req.flash("success", `${listedCategory.title} is listed`);
            res.redirect("/admin/categories");
        } else {
            req.flash("danger", `Can't List ${listedCategory.title}`);
        }
    } catch (error) {
        throw new Error(error);
    }
});
