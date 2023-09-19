const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            default: "Default",
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
        pincode: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
