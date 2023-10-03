const usedOrderIDs = new Set();

function generateUniqueOrderID() {
    let orderID;
    do {
        orderID = generateRandomOrderID();
    } while (usedOrderIDs.has(orderID));

    usedOrderIDs.add(orderID);
    return orderID;
}

function generateRandomOrderID() {
    const min = 100000;
    const max = 999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min).padStart(6, "0");
}

module.exports = { generateUniqueOrderID };
