const asyncHandler = require("express-async-handler");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const Review = require("../../models/reviewModel");
const validateMongoDbId = require("../../utils/validateMongodbId");
const shuffleArray = require("../../utils/shuffleProducts");

/**
 * Shop page Route
 * Method GET
 */
exports.shoppage = asyncHandler(async (req, res) => {
    try {
        const queryOptions = { isListed: true };
        const messages = req.flash();
        const { search, page, perPage, sortBy } = req.query;
        let selectedCategories = [];

        if (req.query.category) {
            if (Array.isArray(req.query.category)) {
                selectedCategories = req.query.category;
            } else {
                selectedCategories = [req.query.category];
            }
        }

        if (selectedCategories.length > 0) {
            const categoryTitles = selectedCategories[0].split(" ");

            // Create an array to store category ObjectIDs for each title
            const categoryIds = [];

            for (const title of categoryTitles) {
                const newTitle = title.split("-").join(" ");
                console.log(newTitle);
                const titleIds = await Category.find({ title: newTitle });
                console.log(titleIds);
                categoryIds.push(...titleIds);
            }

            queryOptions.category = { $in: categoryIds };
        }

        if (search) {
            queryOptions.$or = [
                { title: { $regex: new RegExp(search, "i") } },
                { color: { $regex: new RegExp(search, "i") } },
                { material: { $regex: new RegExp(search, "i") } },
                { artForm: { $regex: new RegExp(search, "i") } },
            ];
        }

        queryOptions.isListed = true;
        queryOptions.isDeleted = false;

        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(perPage) || 8;
        const allProducts = await Product.find(queryOptions).populate("images").exec();

        // Apply pagination to the shuffled products
        const skip = (currentPage - 1) * itemsPerPage;
        const products = allProducts.slice(skip, skip + itemsPerPage);

        // Apply sorting to the paginated products
        const sortOptions = {};
        if (sortBy === "az") {
            sortOptions.title = 1;
        } else if (sortBy === "za") {
            sortOptions.title = -1;
        } else if (sortBy === "price-asc") {
            sortOptions.salePrice = 1;
        } else if (sortBy === "price-desc") {
            sortOptions.salePrice = -1;
        }

        products.sort((a, b) => {
            if (sortOptions.title) {
                return a.title.localeCompare(b.title) * sortOptions.title;
            } else if (sortOptions.salePrice) {
                return (a.salePrice - b.salePrice) * sortOptions.salePrice;
            }
            return 0;
        });

        const totalProductsCount = allProducts.length;

        const categories = await Category.find({ isListed: true });

        res.render("shop/pages/products/shop", {
            title: "Shop",
            page: "shop",
            products,
            categories,
            search,
            selectedCategories,
            currentPage,
            itemsPerPage,
            totalProductsCount,
            sortBy,
            messages,
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
    const user = req.user;
    validateMongoDbId(id);
    try {
        const messages = req.flash();
        const product = await Product.findById(id).populate("images").exec();
        const reviews = await Review.find({ product: id }).populate("user");
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
        })
            .populate("images")
            .exec();

        let totalRating = 0;
        let avgRating = 0;
        if (reviews.length > 0) {
            for (const review of reviews) {
                totalRating += Math.ceil(parseFloat(review.rating));
            }
            const averageRating = totalRating / reviews.length;
            avgRating = averageRating.toFixed(2);
        } else {
            avgRating = 0;
        }
        res.render("shop/pages/products/product", {
            title: "Product",
            page: "product",
            relatedProducts,
            product,
            messages,
            user,
            reviews,
            avgRating,
        });
    } catch (error) {
        throw new Error(error);
    }
});
