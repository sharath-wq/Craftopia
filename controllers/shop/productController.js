const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const validateMongoDbId = require("../../utils/validateMongodbId");

/**
 * Shop page Route
 * Method GET
 */
exports.shoppage = asyncHandler(async (req, res) => {
    try {
        // Initialize query options with a default filter
        const queryOptions = { isListed: true };

        // Extract query parameters
        const { search, category, page, perPage, minPrice, maxPrice, sortBy } = req.query;

        // Apply search filter if provided
        if (search) {
            queryOptions.title = { $regex: new RegExp(search, "i") };
        }

        // Apply category filter if provided
        if (category) {
            queryOptions.category = category;
        }

        // Parse pagination parameters
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(perPage) || 8;
        const skip = (currentPage - 1) * itemsPerPage;

        // Initialize sorting options
        const sortOptions = {};
        if (sortBy === "az") {
            sortOptions.title = 1; // Sort A to Z
        } else if (sortBy === "za") {
            sortOptions.title = -1; // Sort Z to A
        } else if (sortBy === "price-asc") {
            sortOptions.salePrice = 1;
        } else if (sortBy === "price-desc") {
            sortOptions.salePrice = -1;
        }

        // Query products based on filters, sorting, and pagination
        const productsQuery = Product.find(queryOptions)
            .populate("images")
            .skip(skip)
            .limit(itemsPerPage)
            .sort(sortOptions)
            .exec();

        // Get the total count of products matching the filters
        const totalProductsCount = await Product.countDocuments(queryOptions);

        // Fetch categories for filtering
        const categories = await Category.find({ isListed: true });

        // Render the view with the obtained data
        res.render("shop/pages/products/shop", {
            title: "Shop",
            page: "shop",
            products: await productsQuery,
            categories,
            search,
            category,
            currentPage,
            itemsPerPage,
            totalProductsCount,
            sortBy,
        });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Single Prodcut page Route
 * Method GET
 */
exports.singleProductpage = asyncHandler(async (req, res) => {
    const id = req.params.id;
    validateMongoDbId(id);
    try {
        const products = await Product.find().limit(3).populate("images").exec();
        const product = await Product.findById(id).populate("images").exec();
        res.render("shop/pages/products/product", { title: "Product", page: "product", products, product });
    } catch (error) {
        throw new Error(error);
    }
});
