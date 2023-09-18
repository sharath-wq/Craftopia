const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Manage Product Page Route
 * Method GET
 */
exports.productspage = asyncHandler(async (req, res) => {
    try {
        const messages = req.flash();
        const products = await Product.find();
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
        const newProduct = await Product.create(req.body);
        req.flash("success", `${newProduct.title} is added successfully`);
        res.redirect("/admin/products");
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
        const product = await Product.findById(id);
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
        req.flash("success", `${updatedProduct.title} Unllisted`);
        res.redirect("/admin/products");
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Delete Product Route
 * Method DELETE
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        req.flash("warning", `${deletedProduct.title} deleted`);
        res.redirect("/admin/products");
    } catch (error) {
        throw new Error(error);
    }
});
