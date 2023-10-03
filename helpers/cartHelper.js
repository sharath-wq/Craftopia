const Product = require("../models/productModel");
const Cart = require("../models/cartModeal");

function calculateCartTotals(products) {
    let subtotal = 0;
    for (const product of products) {
        const productTotal = parseFloat(product.product.salePrice) * product.quantity;
        subtotal += productTotal;
    }

    const tax = (subtotal * 12) / 100;

    const total = subtotal + tax;

    return { subtotal, total, tax };
}

const findCartItem = async (userId, productId) => {
    return await Cart.findOne({ user: userId, "products.product": productId });
};

const findProductById = async (productId) => {
    return await Product.findById(productId);
};

const incrementQuantity = async (userId, productId, res) => {
    const updatedProduct = await findCartItem(userId, productId);

    if (!updatedProduct) {
        return res.json({ message: "Product not found in cart", status: "error" });
    }

    const foundProduct = updatedProduct.products.find((cartProduct) => cartProduct.product.equals(productId));

    const product = await findProductById(productId);

    if (foundProduct.quantity < product.quantity) {
        foundProduct.quantity += 1;

        await updatedProduct.save();

        const productTotal = product.salePrice * foundProduct.quantity;
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total, tax } = calculateCartTotals(cart.products);

        res.json({
            message: "Quantity Increased",
            quantity: foundProduct.quantity,
            productTotal,
            status: "success",
            subtotal: subtotal,
            total: total,
            tax: tax,
        });
    } else {
        const productTotal = product.salePrice * foundProduct.quantity;
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total, tax } = calculateCartTotals(cart.products);
        res.json({
            message: "Out of Stock",
            status: "danger",
            quantity: foundProduct.quantity,
            productTotal,
            subtotal: subtotal,
            total: total,
            tax: tax,
        });
    }
};

const decrementQuantity = async (userId, productId, res) => {
    const updatedCart = await Cart.findOne({ user: userId });
    const productToDecrement = updatedCart.products.find((item) => item.product.equals(productId));

    if (productToDecrement) {
        productToDecrement.quantity -= 1;

        if (productToDecrement.quantity <= 0) {
            updatedCart.products = updatedCart.products.filter((item) => !item.product.equals(productId));
        }

        const product = await findProductById(productId);

        await updatedCart.save();

        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total, tax } = calculateCartTotals(cart.products);

        res.json({
            message: "Quantity Decreased",
            quantity: productToDecrement.quantity,
            status: "warning",
            productTotal: product.salePrice * productToDecrement.quantity,
            subtotal,
            total,
            tax,
        });
    } else {
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total, tax } = calculateCartTotals(cart.products);
        const product = await findProductById(productId);
        res.json({
            message: "Product not found in the cart.",
            status: "error",
            subtotal,
            total,
            tax,
            productTotal: product.salePrice * productToDecrement.quantity,
        });
    }
};

module.exports = { decrementQuantity, findCartItem, findProductById, incrementQuantity, calculateCartTotals };
