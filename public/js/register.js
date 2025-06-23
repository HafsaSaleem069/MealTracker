document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("logout");
    const registerButton = document.getElementById("RegisterButton");
    const loginButton = document.getElementById("LoginButton");

    // Use optional chaining for safer event listener attachment
    registerButton?.addEventListener("click", (event) => {
        console.log("Register button clicked");
        register(event);
    });

    loginButton?.addEventListener("click", (event) => {
        console.log("Login button clicked");
        login(event);
    });

    logoutButton?.addEventListener("click", (event) => {
        console.log("Logout button clicked");
        logout(event);
    });

    // Initialize password validation if the input exists
    const passwordInput = document.getElementById("password");
    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            const password = passwordInput.value;

            const validations = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                special: /[@$!%*?&]/.test(password),
            };

            let validCount = 0;
            for (const key in validations) {
                const item = document.getElementById(key);
                if (item) { // Ensure the element exists before manipulating
                    if (validations[key]) {
                        item.classList.add("valid");
                        item.textContent = "✅ " + item.textContent.slice(2);
                        validCount++;
                    } else {
                        item.classList.remove("valid");
                        item.textContent = "❌ " + item.textContent.slice(2);
                    }
                }
            }

            // Update progress bar fill
            const fill = document.getElementById("progress-fill");
            if (fill) { // Ensure fill element exists
                const percent = (validCount / 5) * 100;
                fill.style.width = percent + "%";
            }
        });
    }
});


//--- Helper Validation Functions ---

/**
 * Validates an email address to ensure it's a valid format and ends with @gmail.com.
 * @param {string} email - The email string to validate.
 * @returns {boolean} - True if the email is valid and a Gmail address, false otherwise.
 */
function validateEmail(email) {
    // Regex for general email format followed by checking for @gmail.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.endsWith("@gmail.com");
}

/**
 * Validates a password to ensure it meets complexity requirements.
 * At least 8 characters, one uppercase, one lowercase, one number, one special character.
 * @param {string} password - The password string to validate.
 * @returns {boolean} - True if the password is valid, false otherwise.
 */
function validatePassword(password) {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Validates a phone number for Pakistani format (03xxxxxxxxx or +923xxxxxxxxx).
 * @param {string} phone - The phone number string to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
function validatePhone(phone) {
    const phoneRegex = /^(03\d{9}|\+923\d{9})$/;
    return phoneRegex.test(phone);
}

//--------------- Register Function ---------------
async function register(event) {
    event.preventDefault();
    console.log("Register function called.");

    const fullname = document.getElementById("fullname")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;
    const phone = document.getElementById("phone")?.value.trim();
    const address = document.getElementById("address")?.value.trim();

    console.log("Form data:", { fullname, email, password, phone, address });

    // Frontend Validations
    if (!fullname || !email || !password || !phone || !address) {
        alert("All fields are required. Please fill out the form completely.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Please enter a valid Gmail address (e.g., example@gmail.com).");
        return;
    }

    if (!validatePassword(password)) {
        alert(
            "Password must be at least 8 characters long, contain a mix of uppercase, lowercase, numbers, and special characters."
        );
        return;
    }

    if (!validatePhone(phone)) {
        alert("Please enter a valid Pakistani phone number (e.g., 03XXXXXXXXX or +923XXXXXXXXX).");
        return;
    }

    try {
        console.log("Sending POST request to /register/users...");
        const response = await fetch("http://localhost:3000/home/register/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullname, email, password, phone, address }),
        });

        console.log("Response received:", response);
        if (response.ok) {
            console.log("Registration successful. Clearing input fields.");
            alert("User registered successfully!");
            window.location.href = "http://localhost:3000/home/login";

            // Clear fields only after successful registration
            if (document.getElementById("fullname")) document.getElementById("fullname").value = "";
            if (document.getElementById("email")) document.getElementById("email").value = "";
            if (document.getElementById("password")) document.getElementById("password").value = "";
            if (document.getElementById("phone")) document.getElementById("phone").value = "";
            if (document.getElementById("address")) document.getElementById("address").value = "";

        } else {
            const errorMessage = await response.json();
            console.error("Server responded with an error:", errorMessage);
            alert(`Registration failed: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Error occurred during fetch:", error);
        alert("An error occurred while registering. Please try again.");
    }
}


//------------- Login Function -------------
async function login(event) {
    event.preventDefault();
    console.log("Login function called.");

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    console.log("Login form data:", { email, password });

    // Admin bypass (consider moving this to a more secure server-side check)
    if (email === "admin@gmail.com" && password === "admin") {
        window.location.href = "http://localhost:3000/admin";
        return;
    }

    // Frontend Validations
    if (!email || !password) {
        alert("Please fill out both email and password.");
        return;
    }

    // Use the updated validateEmail function
    if (!validateEmail(email)) {
        alert("Please enter a valid Gmail address (e.g., example@gmail.com).");
        return;
    }

    try {
        console.log("Sending POST request to /login/users...");
        const response = await fetch("http://localhost:3000/home/login/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log("Response received:", response);

        if (response.ok) {
            const responseData = await response.json();
            console.log("Login successful:", responseData);
            window.location.href = "http://localhost:3000/home";
        } else {
            const errorMessage = await response.json();
            console.error("Server responded with an error:", errorMessage);
            alert(`Login failed: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Error occurred during fetch:", error);
        alert("An error occurred while logging in. Please try again.");
    }
}

//------------- Google Login Function -------------
async function handleGoogleLogin(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    try {
        const serverResponse = await fetch("http://localhost:3000/home/google-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
        });

        if (serverResponse.ok) {
            const data = await serverResponse.json();
            console.log("Google login successful:", data);
            window.location.href = "http://localhost:3000/home";
        } else {
            const error = await serverResponse.json();
            alert("Google login failed: " + error.message);
        }
    } catch (err) {
        console.error("Google login error:", err);
        alert("Google login failed.");
    }
}

//------------- Reset Password Function -------------
async function resetPassword() {
    const email = document.getElementById("resetEmail")?.value.trim();

    if (!email || !validateEmail(email)) { // Use the updated validateEmail
        alert("Please enter a valid Gmail address (e.g., example@gmail.com) for password reset.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/home/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (response.ok) {
            alert("Reset link has been sent to your email.");
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error("Reset password error:", err);
        alert("An error occurred. Please try again later.");
    }
}

//------------- Logout Function -------------
async function logout(event) {
    event.preventDefault();

    try {
        console.log("Sending GET request to /logout...");
        const response = await fetch("http://localhost:3000/home/logout", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("Response received:", response);

        if (response.ok) {
            console.log("Logout successful.");
            window.location.href = "http://localhost:3000/home/login";
        } else {
            const errorMessage = await response.json();
            console.error("Server responded with an error:", errorMessage);
            alert(`Logout failed: ${errorMessage.message}`);
        }
    } catch (error) {
        console.error("Error occurred during fetch:", error);
        alert("An error occurred while logging out. Please try again.");
    }
}