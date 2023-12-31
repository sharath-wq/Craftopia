const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");
const sharp = require("sharp");
const Images = require("../../models/imageModel");
const { admin } = require("../../utils/firebase");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const products = await Product.find({ isDeleted: false })
            .populate("category")
            .populate("images")
            .sort({ createdAt: -1 })
            .exec();
        res.render("admin/pages/product/products", { title: "Products", products, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addProductpage = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find({ isListed: true });
        res.render("admin/pages/product/add-product", { title: "Add Products", categories });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Route
 * Method POST
 */
exports.createProduct = asyncHandler(async (req, res) => {
    try {
        const files = req.files;
        const imageUrls = [];
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            res.redirect("/admin/products/add");
        } else {
            for (const file of files) {
                const thumbnailBuffer = await sharp(file.buffer).resize(300, 300).toBuffer();
                const productImageBuffer = await sharp(file.buffer).resize(800, 1000).toBuffer();

                const thumbnailFileName = `thumbnails/${Date.now()}_${file.originalname}`;
                const productImageFileName = `product-images/${Date.now()}_${file.originalname}`;

                await admin.storage().bucket().file(thumbnailFileName).save(thumbnailBuffer);
                await admin.storage().bucket().file(productImageFileName).save(productImageBuffer);

                // Get the download URLs for the uploaded images
                const thumbnailUrl = `${process.env.FIREBASE_URL}${thumbnailFileName}`;
                const productImageUrl = `${process.env.FIREBASE_URL}${productImageFileName}`;

                imageUrls.push({ thumbnailUrl, productImageUrl });
            }
            const images = await Images.create(imageUrls);
            const ids = images.map((image) => image._id);

            const newProduct = await Product.create({
                title: req.body.title,
                category: req.body.category,
                description: req.body.description,
                productPrice: req.body.productPrice,
                salePrice: req.body.salePrice,
                quantity: req.body.quantity,
                color: req.body.color,
                material: req.body.material,
                artForm: req.body.artForm,
                images: ids,
            });

            req.flash("success", `${newProduct.title} added`);
            res.redirect("/admin/products");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Product Page Route
 * Method GET
 */
exports.editProductpage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        const messages = req.flash();
        validateMongoDbId(id);
        const categories = await Category.find({ isListed: true });
        const product = await Product.findById(id).populate("category").populate("images").exec();
        res.render("admin/pages/product/edit-product", { title: "Edit Products", product, categories, messages });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Edit Product Route
 * Method PUT
 */
exports.updateProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.array().forEach((error) => {
                req.flash("danger", error.msg);
            });
            res.redirect("back");
        } else {
            const editedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
            req.flash("success", `Product ${editedProduct.title} updated`);
            res.redirect("/admin/products");
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * List Product Route
 * Method PUT
 */
exports.listProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { isListed: true });
        req.flash("success", `${updatedProduct.title} Listed`);
        res.redirect("/admin/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Unlist Product Route
 * Method PUT
 */
exports.unlistProdcut = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, { isListed: false });
        req.flash("warning", `${updatedProduct.title} Unllisted`);
        res.redirect("/admin/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Product Edit Images Route
 * Method PUT
 */
exports.editProductImages = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);

        const file = req.file;

        const thumbnailBuffer = await sharp(file.buffer).resize(300, 300).toBuffer();
        const productImageBuffer = await sharp(file.buffer).resize(800, 1000).toBuffer();

        const thumbnailFileName = `thumbnails/${Date.now()}_${file.originalname}`;
        const productImageFileName = `product-images/${Date.now()}_${file.originalname}`;

        await admin.storage().bucket().file(thumbnailFileName).save(thumbnailBuffer);
        await admin.storage().bucket().file(productImageFileName).save(productImageBuffer);

        // Get the download URLs for the uploaded images
        const thumbnailUrl = `${process.env.FIREBASE_URL}${thumbnailFileName}`;
        const productImageUrl = `${process.env.FIREBASE_URL}${productImageFileName}`;

        const images = await Images.findByIdAndUpdate(id, {
            thumbnailUrl: thumbnailUrl,
            productImageUrl: productImageUrl,
        });

        req.flash("success", "Image updated");
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Product (Soft delete)
 * Method DELETE
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByIdAndUpdate(productId, { isDeleted: true });
        req.flash("danger", `${product.title} is deleted`);
        res.redirect("/admin/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Product Image
 * Method DELETE
 */
exports.deleteImage = asyncHandler(async (req, res) => {
    try {
        const imageId = req.params.id;
        const image = await Images.findById(imageId);

        // Check if the image exists
        if (!image) {
            return res.status(404).json({ message: "Image not found" });
        }

        // Get the URLs of the image in Firebase Storage
        const thumbnailImageUrl = image.thumbnailUrl;
        const productImageUrl = image.productImageUrl;

        // Parse the Firebase Storage URLs to get the paths
        const thumbnailUrlParts = thumbnailImageUrl.split("/");
        const productUrlParts = productImageUrl.split("/");

        const thumbnailPath = thumbnailUrlParts.slice(4).join("/");
        const productPath = productUrlParts.slice(4).join("/");

        // Delete the image files from Firebase Storage
        await admin.storage().bucket().file(thumbnailPath).delete();
        await admin.storage().bucket().file(productPath).delete();

        // Optionally, you can also remove the image from your database
        await Images.findByIdAndRemove(imageId);
        const product = await Product.findOneAndUpdate({ images: imageId }, { $pull: { images: imageId } }, { new: true });

        res.json({ message: "Images Removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

/**
 * Add New Images
 * Method POST
 */
exports.addNewImages = asyncHandler(async (req, res) => {
    try {
        const files = req.files;
        const imageUrls = [];
        const productId = req.params.id;

        for (const file of files) {
            const thumbnailBuffer = await sharp(file.buffer).resize(300, 300).toBuffer();
            const productImageBuffer = await sharp(file.buffer).resize(800, 1000).toBuffer();

            const thumbnailFileName = `thumbnails/${Date.now()}_${file.originalname}`;
            const productImageFileName = `product-images/${Date.now()}_${file.originalname}`;

            await admin.storage().bucket().file(thumbnailFileName).save(thumbnailBuffer);
            await admin.storage().bucket().file(productImageFileName).save(productImageBuffer);

            // Get the download URLs for the uploaded images
            const thumbnailUrl = `${process.env.FIREBASE_URL}${thumbnailFileName}`;
            const productImageUrl = `${process.env.FIREBASE_URL}${productImageFileName}`;

            imageUrls.push({ thumbnailUrl, productImageUrl });
        }

        const images = await Images.create(imageUrls);
        const ids = images.map((image) => image._id);

        const product = await Product.findByIdAndUpdate(productId, {
            $push: { images: ids },
        });
        req.flash("success", "Image added");
        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});
