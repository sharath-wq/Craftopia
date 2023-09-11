const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

const connectDatabase = asyncHandler(async () => {
    try {
        mongoose.connect(process.env.DATABASE_URL);
        console.log("Database Connected Successfully");
    } catch (error) {
        throw new Error();
    }
});

module.exports = connectDatabase;
