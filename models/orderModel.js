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
    city: {
        type: String,
        required: true,
    },
    zip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
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
});

module.exports = mongoose.model("Order", orderSchema);
