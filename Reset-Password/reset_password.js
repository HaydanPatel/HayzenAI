// -------------------------------------
// Hayzen - Reset Password Validation
// -------------------------------------

// 1️⃣ Get form and password fields by ID
const resetForm = document.querySelector("#reset-form");
const password = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmNewPassword");

// 2️⃣ Attach submit event listener to form
resetForm.addEventListener("submit", checkResetForm);

// 3️⃣ Function to validate reset password fields
function checkResetForm(event) {
    // 🚫 Prevent form from submitting
    event.preventDefault();

    // 🔐 Get trimmed values from inputs
    const newPassword = password.value.trim();
    const confirmNewPassword = confirmPassword.value.trim();

    // ❗ Empty check
    if (newPassword === "" || confirmNewPassword === "") {
        return showNotification("❌ ERROR: Please fill in both password fields.", "error");
    }

    // ❌ Check if passwords match
    if (newPassword !== confirmNewPassword) {
        return showNotification("❌ ERROR: Passwords do not match.", "error");
    }

    // ✅ Regex for strong password:
    // - Minimum 8 characters
    // - At least 1 uppercase letter
    // - At least 1 lowercase letter
    // - At least 1 number
    // - At least 1 special character (including .)
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@$!%*?#&])[A-Za-z\d.@$!%*?#&]{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
        return showNotification(
            "❌ ERROR: Weak Password! Use at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.",
            "error"
        );
    }

    // ✅ All validations passed
    showNotification("ℹ️ INFO: Password is strong and matched. Verifying...", "info");

    // 🕐 Simulate API response and redirect
    setTimeout(() => {
        showNotification("✅ SUCCESS: Your password has been reset!", "success");

        // 🧹 Clean up any temp data
        localStorage.removeItem("forgot_email");

        // ⏳ Redirect to login page after 2s
        setTimeout(() => {
            window.location.href = "../Log-In/Login.html";  // ✅ Relative path
        }, 2000);
    }, 2000);
}
