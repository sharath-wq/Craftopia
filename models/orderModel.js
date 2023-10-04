const mongoose = require("mongoose");
const { generateUniqueOrderID } = require("../utils/generateUniqueId");

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        requried: true,
        default: "OD" + generateUniqueOrderID(),
    },
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
            required: true,
        },
    ],
    shippingAddress: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    },
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    orderedDate: {
        type: Date,
        default: Date.now(),
    },
    shippedDate: {
        type: Date,
    },
    deliveredDate: {
        type: Date,
    },
    payment_method: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Order", orderSchema);
