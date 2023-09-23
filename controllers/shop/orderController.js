const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");

/**
 * Orders Page Route
 * Method GET
 */
exports.orderspage = asyncHandler(async (req, res) => {
    try {
        const { page, perPage } = req.query;
        const userId = req.user._id;

        const orderItems = await Order.find({ customer: userId })
            .select("orderNumber createdAt products.product status")
            .populate({
                path: "products.product",
                model: "Product",
                populate: {
                    path: "images",
                    model: "Images",
                },
            })
            .populate({
                path: "address",
                model: "Address",
            })
            .sort({ createdAt: -1 });

        res.render("shop/pages/user/orders", {
            title: "Orders",
            page: "orders",
            orderItems,
        });
    } catch (error) {
        throw new Error(error);
    }
});
