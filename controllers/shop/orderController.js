const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Address = require("../../models/addressModel");
const { status } = require("../../utils/status");
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

/**
 * Checkout Page Route
 * Method GET
 */
exports.singleOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ orderNumber: orderId })
            .select("orderNumber createdAt products.product products.quantity status")
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
            });
        res.render("shop/pages/user/single-order.ejs", {
            title: order.products[0].product.title,
            page: order.products[0].product.title,
            order,
        });
    } catch (error) {}
});

/**
 * Cancel Order Route
 * Method PUT
 */
exports.chancelOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const updatedOrder = await Order.findOneAndUpdate(
            { orderNumber: orderId },
            {
                status: status.cancelled,
            }
        );

        const cancelledProduct = updatedOrder.products[0];
        const cancelledProductId = cancelledProduct.product;
        const cancelledQuantity = cancelledProduct.quantity;

        const product = await Product.findById(cancelledProductId);
        product.quantity += cancelledQuantity;
        await product.save();

        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});
