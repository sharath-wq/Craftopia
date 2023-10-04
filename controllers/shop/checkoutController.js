const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongodbId");
const Address = require("../../models/addressModel");
const User = require("../../models/userModel");
const Cart = require("../../models/cartModeal");
const Order = require("../../models/orderModel");
const OrderItems = require("../../models/orderItemModel");
const Product = require("../../models/productModel");
const { generateUniqueOrderID } = require("../../utils/generateUniqueId");

/**
 * Checkout Page Route
 * Method POST
 */
exports.checkoutpage = asyncHandler(async (req, res) => {
    try {
        const userid = req.user._id;
        const user = await User.findById(userid).populate("address");
        const cartItmes = await Cart.findOne({ user: userid }).populate("products.product");
        const cartData = await Cart.findOne({ user: userid });
        if (cartItmes) {
            let subtotal = 0;
            for (const product of cartItmes.products) {
                const productTotal = parseFloat(product.product.salePrice) * product.quantity;
                subtotal += productTotal;
            }
            const tax = (subtotal * 12) / 100;
            if (subtotal > 2000) {
                shippingFee = 0;
            }

            const total = subtotal + tax;

            res.render("shop/pages/user/checkout", {
                title: "Checkout",
                page: "checkout",
                address: user.address,
                product: cartItmes.products,
                total,
                subtotal,
                tax,
                cartData,
            });
        }
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Checkout Page Route
 * Method GET
 */
exports.placeOrder = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the user's cart and populate the products
        const cartItems = await Cart.findOne({ user: userId }).populate("products.product");

        if (!cartItems) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const orders = [];
        let total = 0;

        for (const cartItem of cartItems.products) {
            const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
            const tax = (productTotal * 12) / 100;
            let shippingFee = 60;

            if (productTotal > 2000) {
                shippingFee = 0;
            }

            total += productTotal + tax + shippingFee;

            const item = await OrderItems.create({
                quantity: cartItem.quantity,
                price: cartItem.product.salePrice,
                product: cartItem.product._id,
            });

            orders.push(item);

            // Update product quantities and sold counts if needed
            const updateProduct = await Product.findById(cartItem.product._id);
            updateProduct.quantity -= cartItem.quantity;
            updateProduct.sold += cartItem.quantity;
            await updateProduct.save();
        }

        const address = await Address.findById(req.body.addressId);

        const existingOrderIds = await Order.find().select("orderId");
        // Create the order
        const order = await Order.create({
            orderId: "OD" + generateUniqueOrderID(existingOrderIds),
            user: userId,
            orderItems: orders,
            shippingAddress: address.title,
            city: address.city,
            street: address.street,
            state: address.state,
            zip: address.pincode,
            phone: address.mobile,
            totalPrice: total,
            payment_method: req.body.payment_method,
        });

        // Remove the items from the cart (uncomment when needed)
        await Cart.findOneAndDelete({ user: userId });

        res.redirect(`/checkout/order-placed/${order._id}`);
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Get Cart Data
 */
exports.getCartData = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const cartData = await Cart.findOne({ user: userId });

        // Debug: Log the cartData to see its contents
        console.log("Cart Data:", cartData);

        res.json(cartData);
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Order Placed
 * Method GET
 */
exports.orderPlaced = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        // Populate the order details, including product details
        const order = await Order.findById(orderId).populate({
            path: "orderItems",
            populate: {
                path: "product",
            },
        });
        // Render the order placed page with orderDetails
        res.render("shop/pages/user/order-placed.ejs", {
            title: "Order Placed",
            page: "Order Placed",
            order: order,
        });
    } catch (error) {
        throw new Error(error);
    }
});
