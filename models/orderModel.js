const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            const prefix = "ORDER-";
            return prefix + uuidv4();
        },
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    estimatedDelivery: {
        type: Date,
        required: true,
        default: function () {
            const deliveryDate = new Date(this.createdAt);
            deliveryDate.setDate(this.createdAt.getDate() + 5);
            return deliveryDate;
        },
    },
    paymentMethod: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Order", orderSchema);
