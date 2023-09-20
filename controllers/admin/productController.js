const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");
const sharp = require("sharp");
const Images = require("../../models/imageModel");
const admin = require("firebase-admin");
const serviceAccount = require("../../config/craftopia-c8c47-firebase-adminsdk-yanr7-1eefc24806.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const products = await Product.find().populate("images").exec();
        const categories = await Category.find({ isListed: true });
        res.render("admin/pages/product/products", { title: "Products", products, categories, messages });
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
        const existingProduct = await Product.findOne({ title: req.body.title });

        if (existingProduct) {
            req.flash("warning", "Product already exists");
            res.redirect("/admin/products");
        } else {
            const files = req.files;
            const imageUrls = [];
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
        validateMongoDbId(id);
        const categories = await Category.find({ isListed: true });
        const product = await Product.findById(id).populate("images").exec();
        res.render("admin/pages/product/edit-product", { title: "Edit Products", product, categories });
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
        const editedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        req.flash("success", `Product ${editedProduct.title} updated`);
        res.redirect("/admin/products");
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
 * Product Edit Images Page Route
 * Method GET
 */
exports.editProductImagespage = asyncHandler(async (req, res) => {
    try {
        const id = req.params.id;
        validateMongoDbId(id);
        const messages = req.flash();
        const product = await Product.findById(id).populate("images").exec();
        res.render("admin/pages/product/edit-images", { title: "Edit Images", product, messages });
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
