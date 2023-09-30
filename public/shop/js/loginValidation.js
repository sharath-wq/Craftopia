// Get form and input elements
const form = document.getElementById("loginForm");
const emailInput = form.querySelector('input[name="email"]');
const passwordInput = form.querySelector('input[name="password"]');
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const submitButton = document.getElementById("submitButton");

// Regular expression for validating email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to check if an email is valid
function isValidEmail(email) {
    return emailRegex.test(email);
}

// Function to validate the form
function validateForm() {
    let valid = true;

    if (!isValidEmail(emailInput.value)) {
        emailError.textContent = "Please enter a valid email address.";
        valid = false;
    } else {
        emailError.textContent = "";
    }

    if (passwordInput.value.trim() === "") {
        passwordError.textContent = "Password is required.";
        valid = false;
    } else {
        passwordError.textContent = "";
    }

    // Enable or disable the submit button based on validity
    submitButton.disabled = !valid;

    return valid;
}

// Add blur event listeners for input fields
emailInput.addEventListener("blur", validateForm);
passwordInput.addEventListener("blur", validateForm);

// Add submit event listener to the form
form.addEventListener("submit", function (e) {
    if (!validateForm()) {
        e.preventDefault(); // Prevent form submission if it's invalid
    }
});
