// ------------------------------------
// Hayzen - Forgot Password Validation
// ------------------------------------

const forgotPassword = document.querySelector("#forgot-form");

forgotPassword.addEventListener("submit", checkForgotPassword);

async function checkForgotPassword(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();

    if (email === "") {
        return showNotification("EMAIL ERROR: Email is Mandatory", "error");
    }

    const checkEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!checkEmail.test(email)) {
        return showNotification("EMAIL ERROR: Please enter a valid email (e.g. john.doe@example.com)", "error");
    }

    // 🔃 Call backend to send OTP
    try {
        const response = await fetch("http://localhost:3000/forgot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();

        if (result.success) {
            // ✅ Save email for OTP verification page
            localStorage.setItem("forgot_email", email);
            showNotification("📧 OTP sent to your email!", "success");

            // ⏳ Redirect to OTP entry page
            setTimeout(() => {
                window.location.href = "../forgot-password-OTP/forgot_password_OTP.html";
            }, 1500);
        } else {
            showNotification(`❌ ERROR: ${result.message}`, "error");
        }
    } catch (err) {
        console.error("Forgot Password Error:", err);
    showNotification("❌ ERROR: Could not connect to server. Try again.", "error");
    }
}
