const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    price: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "Pending",
    },
    shippedDate: {
        type: Date,
    },
    deliveredDate: {
        type: Date,
    },
});

module.exports = mongoose.model("OrderItem", orderItemSchema);
