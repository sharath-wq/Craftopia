function addToCart(id) {
    const productId = id;
    const url = `/cart/add/${productId}`;
    const cartCount = document.getElementById("cartCount");
    const cartMessage = document.getElementById("cart-message");

    fetch(url, {
        method: "GET",
    })
        .then((response) => {
            if (response.ok) {
                return response.json(); // Assuming server sends JSON
            } else {
                console.error("Failed");
            }
        })
        .then((data) => {
            if (data) {
                console.log(data["message"]);

                // Check if 'count' and 'message' properties exist in data
                if (data.count && data.message) {
                    cartCount.innerText = data.count;
                    cartMessage.innerHTML = data.message;

                    cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
                    cartMessage.style.display = "block";

                    setTimeout(function () {
                        cartMessage.style.display = "none";
                    }, 3000);
                } else {
                    console.error("Unexpected data format");
                }
            }
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
}
