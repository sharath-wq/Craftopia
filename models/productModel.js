const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        productPrice: {
            type: Number,
            required: true,
        },
        salePrice: {
            type: Number,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        color: String,
        material: String,
        artForm: String,
        isListed: {
            type: Boolean,
            default: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        sold: {
            type: Number,
            default: 0,
        },
        images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }],
        ratings: [
            {
                star: Number,
                comment: String,
                postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            },
        ],
        totalrating: {
            type: String,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
