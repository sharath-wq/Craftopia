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
    isPaid: {
        type: String,
        enum: ["paid", "cod", "pending"],
        default: "pending",
        required: true,
    },
    shippedDate: {
        type: Date,
    },
    deliveredDate: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

orderItemSchema.statics.updatePendingOrdersStatus = async function () {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.updateMany(
        {
            status: "Pending",
            createdAt: { $lte: oneDayAgo },
        },
        { $set: { status: "Cancelled" } }
    );
};

module.exports = mongoose.model("OrderItem", orderItemSchema);
