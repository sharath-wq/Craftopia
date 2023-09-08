const asyncHandler = require("express-async-handler");

exports.cartpage = asyncHandler(async (req, res) => {
    try {
        res.render("shop/pages/user/cart", { title: "Cart", page: "cart" });
    } catch (error) {
        throw new Error(error);
    }
});
