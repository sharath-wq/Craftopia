function toggleWishlist(id) {
    const productId = id;
    const url = `/wishlist/toggle/${productId}`;
    const wishlistButton = document.getElementById("wishlistButton");
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
                const iconClass = data.isInWishlist ? "text-danger" : "";
                wishlistButton.innerHTML = `<i class="pe-7s-like ${iconClass}"></i>`;
                cartMessage.innerHTML = data.message;
                cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
                cartMessage.style.display = "block";

                setTimeout(function () {
                    cartMessage.style.display = "none";
                }, 3000);
            } else {
                console.error("Unexpected data format");
            }
        })
        .catch((error) => {
            console.error("An error occurred:", error);
        });
}
