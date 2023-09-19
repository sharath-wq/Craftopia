const { default: mongoose } = require("mongoose");

const imageSchema = new mongoose.Schema({
    thumbnailUrl: String,
    productImageUrl: String,
});

module.exports = mongoose.model("Images", imageSchema);
