const mongoose = require("mongoose");
const Product = require("./productModel");
const schedule = require("node-schedule");

const categorySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        image: {
            type: String,
        },
        isListed: {
            type: Boolean,
            default: true,
        },
        offer: {
            type: Number,
        },
        offerDescription: {
            type: String,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Define a pre-save middleware to trigger the updateProductPrices function
categorySchema.pre("save", async function (next) {
    try {
        await updateProductPrices(this);
        next();
    } catch (error) {
        console.error("Error in pre-save middleware:", error);
        next(error);
    }
});

const Category = mongoose.model("Category", categorySchema);

async function updateProductPrices(category) {
    const products = await Product.find({ category: category._id });
    const currentDate = new Date();
    if (category.offer && category.offer > 0 && category.startDate <= currentDate && currentDate <= category.endDate) {
        for (const product of products) {
            const newPrice = product.productPrice - (product.productPrice * category.offer) / 100;
            product.salePrice = Math.round(newPrice);
            await product.save();
        }
    } else {
        for (const product of products) {
            product.salePrice = product.productPrice;
            await product.save();
        }
    }
}

const dailyScheduleRule = new schedule.RecurrenceRule();
dailyScheduleRule.hour = 0;
dailyScheduleRule.minute = 0;

schedule.scheduleJob(dailyScheduleRule, async () => {
    const categories = await Category.find();

    for (const category of categories) {
        await updateProductPrices(category);
    }
});

module.exports = Category;
