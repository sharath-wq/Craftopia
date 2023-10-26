const asyncHandler = require("express-async-handler");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");
const { validationResult } = require("express-validator");
const sharp = require("sharp");
const { admin } = require("../../utils/firebase");

/**
 * Manage Category Page Route
 * Method GET
 */
exports.categoriespage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const categories = await Category.find();
        res.render("admin/pages/category/categories", { title: "category", categories, messages });
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
 * Edit Category Page Route
 * Method GET
 */
exports.editCategorypage = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const messages = req.flash();
        const category = await Category.findById(id);
        res.render("admin/pages/category/edit-category", { title: "Add Category", messages, category });
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            res.redirect("back");
        } else {
            const existingCategory = await Category.findOne({ title: { $regex: new RegExp(req.body.title, "i") } });
            if (existingCategory) {
                req.flash("warning", "Category Alrady Exists");
                res.redirect("/admin/category/add");
            } else {
                const newCategory = await Category.create({
                    title: req.body.title,
                    isListed: req.body.isListed,
                });
                req.flash("success", `${newCategory.title} added Successfully`);
                res.redirect("/admin/category/add");
            }
        }
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
            res.redirect("/admin/category");
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
            res.redirect("/admin/category");
        } else {
            req.flash("danger", `Can't List ${listedCategory.title}`);
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Category
 * Method PUT
 */
exports.editCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const { title, isListed, offer, offerDescription, startDate, endDate } = req.body;

        const isExisting = await Category.findOne({ title: title, _id: { $ne: id } });

        if (isExisting) {
            req.flash("warning", "Category already exist with same name");
            res.redirect("back");
        }

        const editedCategory = await Category.findById(id);
        editedCategory.title = title;
        editedCategory.isListed = isListed;
        editedCategory.offer = offer;
        editedCategory.offerDescription = offerDescription;
        editedCategory.startDate = startDate;
        editedCategory.endDate = endDate;
        await editedCategory.save();

        req.flash("success", `Category ${editedCategory.title} updated`);
        res.redirect("/admin/category");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Category
 * Method DELETE
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const deletedCategory = await Category.findByIdAndDelete(id);
        req.flash("success", `Category ${deletedCategory.title} deleted`);
        res.redirect("/admin/category");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delette Category Image
 * Method DELETE
 */
exports.deleteImage = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);
        const categoryImageUrl = category.image;
        const categoryUrlParts = categoryImageUrl.split("/");
        const categoryPath = categoryUrlParts.slice(4).join("/");

        await admin.storage().bucket().file(categoryPath).delete();

        await Category.findByIdAndUpdate(categoryId, {
            image: "",
        });

        res.json({ message: "Image Removed" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add New Image
 * Method POST
 */
exports.addNewImage = asyncHandler(async (req, res) => {
    try {
        const categoryId = req.params.id;
        const file = req.file;
        const categoryImageBuffer = await sharp(file.buffer)
            .resize(540, 540)
            .png({ quality: 100 })
            .webp({ quality: 100 })
            .jpeg({ quality: 100 })
            .toBuffer();
        const categoryFileName = `thumbnails/${Date.now()}_${file.originalname}`;
        await admin.storage().bucket().file(categoryFileName).save(categoryImageBuffer);
        const categoryImageUrl = `${process.env.FIREBASE_URL}${categoryFileName}`;

        const category = await Category.findByIdAndUpdate(categoryId, { image: categoryImageUrl });

        res.redirect(`/admin/category/edit/${categoryId}`);
    } catch (error) {
        throw new Error(error);
    }
});
