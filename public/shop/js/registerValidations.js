document.addEventListener("DOMContentLoaded", function () {
    const registrationForm = document.getElementById("registrationForm");
    const firstNameInput = document.querySelector('input[name="firstName"]');
    const lastNameInput = document.querySelector('input[name="lastName"]');
    const emailInput = document.querySelector('input[name="email"]');
    const mobileInput = document.querySelector('input[name="mobile"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirm-password"]');
    const registerButton = document.getElementById("registerButton");
    const firstNameError = document.getElementById("firstNameError");
    const lastNameError = document.getElementById("lastNameError");
    const emailError = document.getElementById("emailError");
    const mobileError = document.getElementById("mobileError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");
    const formErrorMessage = document.getElementById("formErrorMessage");

    // Regular expressions for validation
    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^\d{10}$/;

    // Function to validate first name
    function validateFirstName() {
        const firstNameValue = firstNameInput.value.trim(); // Remove leading/trailing whitespace
        if (firstNameValue === "") {
            firstNameError.textContent = "First name is required";
            return false;
        } else if (!nameRegex.test(firstNameValue)) {
            firstNameError.textContent = "First name can only contain alphabets";
            return false;
        }
        firstNameError.textContent = "";
        return true;
    }

    // Function to validate last name
    function validateLastName() {
        const lastNameValue = lastNameInput.value.trim(); // Remove leading/trailing whitespace
        if (lastNameValue === "") {
            lastNameError.textContent = "Last name is required";
            return false;
        } else if (!nameRegex.test(lastNameValue)) {
            lastNameError.textContent = "Last name can only contain alphabets";
            return false;
        }
        lastNameError.textContent = "";
        return true;
    }

    // Function to validate email
    function validateEmail() {
        if (!emailRegex.test(emailInput.value)) {
            emailError.textContent = "Invalid email address";
            return false;
        }
        emailError.textContent = "";
        return true;
    }

    // Function to validate phone number
    function validateMobile() {
        if (!phoneRegex.test(mobileInput.value)) {
            mobileError.textContent = "Invalid mobile number (10 digits required)";
            return false;
        }
        mobileError.textContent = "";
        return true;
    }

    // Function to validate password
    function validatePassword() {
        if (passwordInput.value.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters long";
            return false;
        }
        passwordError.textContent = "";
        return true;
    }

    // Function to validate confirm password
    function validateConfirmPassword() {
        if (confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordError.textContent = "Passwords do not match";
            return false;
        }
        confirmPasswordError.textContent = "";
        return true;
    }

    // Function to handle form submission
    function handleSubmit(event) {
        event.preventDefault();

        if (
            validateFirstName() &&
            validateLastName() &&
            validateEmail() &&
            validateMobile() &&
            validatePassword() &&
            validateConfirmPassword()
        ) {
            // All fields are valid, you can submit the form
            formErrorMessage.textContent = "";
            registrationForm.submit();
        } else {
            // Some fields are invalid, display an error message
            formErrorMessage.textContent = "Please correct the errors in the form.";
        }
    }

    // Attach event listeners for input fields
    firstNameInput.addEventListener("blur", validateFirstName);
    lastNameInput.addEventListener("blur", validateLastName);
    emailInput.addEventListener("blur", validateEmail);
    mobileInput.addEventListener("blur", validateMobile);
    passwordInput.addEventListener("blur", validatePassword);
    confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

    // Attach event listener for form submission
    registrationForm.addEventListener("submit", handleSubmit);
});
