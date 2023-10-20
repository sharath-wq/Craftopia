const asyncHandler = require("express-async-handler");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const { status } = require("../../utils/status");
const OrderItem = require("../../models/orderItemModel");
const Wallet = require("../../models/walletModel");
const WalletTransactoins = require("../../models/walletTransactionModel");
const Review = require("../../models/reviewModel");
const Coupon = require("../../models/couponModel");
const easyinvoice = require("easyinvoice");
const User = require("../../models/userModel");

module.exports = {
    getOrders: asyncHandler(async (userId) => {
        const orders = await Order.find({ user: userId })
            .populate({
                path: "orderItems",
                select: "product status _id",
                populate: {
                    path: "product",
                    select: "title images",
                    populate: {
                        path: "images",
                    },
                },
            })
            .select("orderId orderedDate shippingAddress city")
            .sort({ _id: -1 });

        return orders;
    }),

    getSingleOrder: asyncHandler(async (orderId) => {
        const order = await OrderItem.findById(orderId).populate({
            path: "product",
            model: "Product",
            populate: {
                path: "images",
                model: "Images",
            },
        });

        const orders = await Order.findOne({ orderItems: orderId }).select("shippingAddress city orderedDate");

        return { order, orders };
    }),

    cancelOrderById: asyncHandler(async (orderId) => {
        const order = await Order.findById(orderId).populate("orderItems");

        if (order.orderItems.every((item) => item.status === status.cancelled)) {
            return { message: "Order is already cancelled." };
        }

        if (
            order.payment_method === "online_payment" &&
            order.orderItems.every((item) => {
                return item.isPaid === "pending" ? false : true;
            })
        ) {
            // Update product quantities and sold counts for each order item
            for (const item of order.orderItems) {
                const orderItem = await OrderItem.findByIdAndUpdate(item._id, {
                    status: status.cancelled,
                });

                const cancelledProduct = await Product.findById(orderItem.product);
                cancelledProduct.quantity += orderItem.quantity;
                cancelledProduct.sold -= orderItem.quantity;
                await cancelledProduct.save();
            }

            // Update the order status
            order.status = status.cancelled;
            const updatedOrder = await order.save();

            return updatedOrder;
        } else if (order.payment_method === "cash_on_delivery") {
            // Update product quantities and sold counts for each order item
            for (const item of order.orderItems) {
                await OrderItem.findByIdAndUpdate(item._id, {
                    status: status.cancelled,
                });

                const cancelledProduct = await Product.findById(item.product);
                cancelledProduct.quantity += item.quantity;
                cancelledProduct.sold -= item.quantity;
                await cancelledProduct.save();
            }

            // Update the order status
            order.status = status.cancelled;
            await order.save();

            return "redirectBack";
        }
    }),

    cancelSingleOrder: asyncHandler(async (orderItemId, userId) => {
        const updatedOrder = await OrderItem.findByIdAndUpdate(orderItemId, {
            status: status.cancelled,
        });

        if (updatedOrder.isPaid !== "pending") {
            const cancelledProduct = await Product.findById(updatedOrder.product);
            cancelledProduct.quantity += updatedOrder.quantity;
            cancelledProduct.sold -= updatedOrder.quantity;
            await cancelledProduct.save();
        }

        const orders = await Order.findOne({ orderItems: orderItemId });
        if (
            (orders.payment_method === "online_payment" || orders.payment_method === "wallet_payment") &&
            updatedOrder.isPaid === "paid"
        ) {
            const wallet = await Wallet.findOne({ user: userId });
            const orderTotal = parseInt(updatedOrder.price) * updatedOrder.quantity;
            const order = await Order.findOne({ orderItems: orderItemId });
            const appliedCoupon = order.coupon;
            if (!wallet) {
                let amountToBeRefunded = 0;
                if (appliedCoupon.type === "fixedAmount") {
                    const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                    const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
                    amountToBeRefunded = returnAmount;
                } else if (appliedCoupon.type === "percentage") {
                    const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
                    amountToBeRefunded = returnAmount;
                }
                const newWallet = await Wallet.create({
                    balance: amountToBeRefunded,
                    user: orders.user,
                });
                const walletTransaction = await WalletTransactoins.create({
                    wallet: newWallet._id,
                    event: "Refund",
                    orderId: order.orderId,
                    amount: amountToBeRefunded,
                    type: "credit",
                });
            } else {
                let amountToBeRefunded = 0;
                if (appliedCoupon.type === "fixedAmount") {
                    const percentage = Math.round((orderTotal / (orders.totalPrice + orders.discount)) * 100);
                    const returnAmount = orderTotal - (appliedCoupon.value * percentage) / 100;
                    amountToBeRefunded = returnAmount;
                } else if (appliedCoupon.type === "percentage") {
                    const returnAmount = orderTotal - (orderTotal * appliedCoupon.value) / 100;
                    amountToBeRefunded = returnAmount;
                }
                const existingWallet = await Wallet.findOneAndUpdate({ user: userId });
                existingWallet.balance += amountToBeRefunded;
                existingWallet.save();

                const walletTransaction = await WalletTransactoins.create({
                    wallet: existingWallet._id,
                    amount: amountToBeRefunded,
                    event: "Refund",
                    orderId: order.orderId,
                    type: "credit",
                });
            }
        }
        return "redirectBack";
    }),

    returnOrder: asyncHandler(async (returnOrderId) => {
        const returnOrder = await OrderItem.findByIdAndUpdate(returnOrderId, {
            status: status.returnPending,
        });

        return "redirectBack";
    }),

    getReview: asyncHandler(async (userId, productId) => {
        const review = await Review.findOne({ user: userId, product: productId });
        if (review) {
            return review;
        } else {
            return {};
        }
    }),

    generateInvoice: asyncHandler(async (orderId) => {
        const order = await OrderItem.findById(orderId).populate("product");
        const orders = await Order.findOne({ orderItems: order._id });
        const user = await User.findById(orders.user);

        const data = {
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The logo on top of your invoice
                logo: "https://firebasestorage.googleapis.com/v0/b/craftopia-c8c47.appspot.com/o/logo%2Fcraftopia.png?alt=media&token=3cc6b45e-e956-4d95-b9fe-c09cdb11428f",
            },
            // Your own data
            sender: {
                company: "Craftopia Private Limited",
                address: "Vikas Nagar, Maradu",
                zip: "682020",
                city: "Maradu",
                country: "India",
            },
            // Your recipient
            client: {
                company: `${user.firstName} ${user.lastName}`,
                address: orders.street,
                zip: orders.zip,
                city: orders.city,
                country: "India",
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
            },
            information: {
                // Invoice number
                number: orders.phone,
                // Invoice data
                date: new Date(order.createdAt).toLocaleDateString("en-GB"),
                // Invoice due date
                deliveryDate: new Date(order.deliveredDate).toLocaleDateString("en-GB"),
            },
            // The products you would like to see on your invoice
            // Total values are being calculated automatically
            products: [
                {
                    quantity: order.quantity,
                    description: order.product.title,
                    "tax-rate": 0,
                    price: order.price,
                },
            ],
            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Thank You for Shopping with Us.",
            // Settings to customize your invoice
            settings: {
                currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                locale: "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
                "margin-top": 25, // Defaults to '25'
                "margin-right": 25, // Defaults to '25'
                "margin-left": 25, // Defaults to '25'
                "margin-bottom": 25, // Defaults to '25'
                format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                height: "1000px", // allowed units: mm, cm, in, px
                width: "500px", // allowed units: mm, cm, in, px
                orientation: "portrait", // portrait or landscape, defaults to portrait
            },
            // Translate your invoice to your preferred language
            translate: {
                // "invoice": "FACTUUR",  // Default to 'INVOICE'
                // "number": "Nummer", // Defaults to 'Number'
                // "date": "Datum", // Default to 'Date'
                // "due-date": "Verloopdatum", // Defaults to 'Due Date'
                // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
                // "products": "Producten", // Defaults to 'Products'
                // "quantity": "Aantal", // Default to 'Quantity'
                // "price": "Prijs", // Defaults to 'Price'
                // "product-total": "Totaal", // Defaults to 'Total'
                // "total": "Totaal", // Defaults to 'Total'
                // "vat": "btw" // Defaults to 'vat'
            },
        };

        return data;
    }),
};
