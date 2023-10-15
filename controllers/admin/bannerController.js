const asyncHandler = require("express-async-handler");
const { admin } = require("../../utils/firebase");
const Banner = require("../../models/bannerModel");
const path = require("path");
const fs = require("fs");

/**
 * Manage Banner Page Route
 * Method GET
 */
exports.bannerspage = asyncHandler(async (req, res) => {
    try {
        const banners = await Banner.find({ end_date: { $gt: Date.now() } });

        // res.json(availableBanners);
        res.render("admin/pages/banner/banners", { title: "Banners", banners });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Add Product Page Route
 * Method GET
 */
exports.addBannerpage = asyncHandler(async (req, res) => {
    try {
        res.render("admin/pages/banner/add-banner", { title: "Add Banners" });
    } catch (error) {
        throw new Error(error);
    }
});

/**
 * Create Banner
 * Method POST
 */
exports.createBanner = asyncHandler(async (req, res) => {
    const { title, description, link, startDate, endDate, active, croppedImage } = req.body;

    try {
        if (req.file) {
            const base64Image = req.body.croppedImage; // Assuming you have the base64 image in your request body
            const dataUrlParts = base64Image.split(";base64,");
            const contentType = dataUrlParts[0].split(":")[1];
            const data = Buffer.from(dataUrlParts[1], "base64");

            const bannerFileName = `banners/${Date.now()}.png`;
            await admin.storage().bucket().file(bannerFileName).save(data);
            const imageUrl = `${process.env.FIREBASE_URL}${bannerFileName}`;

            // Now, you can store the imageUrl in your database along with other banner details
            const bannerData = {
                title: title,
                description: description,
                link: link,
                start_date: startDate,
                end_date: endDate,
                active: active === "on" ? true : false,
                image_url: imageUrl, // Store the Firebase Storage URL
            };

            // Save the banner data to your database (e.g., Firestore)
            const newBanner = await Banner.create(bannerData);

            req.flash("success", "Banner created");
            res.redirect("/admin/banners");
        }
    } catch (error) {
        throw new Error(error);
    }
});
