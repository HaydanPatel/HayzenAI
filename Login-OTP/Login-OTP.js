// 📁 Login-OTP/Login-OTP.js (Upgraded & Fixed!)

document.addEventListener("DOMContentLoaded", () => {
    const otpForm = document.querySelector("#otp-form");
    const otpInputs = document.querySelectorAll(".otp-inputs input");
    const email = localStorage.getItem("login_email");

    // Assuming showMessage is defined globally or imported
    // If not, replace with console.log or your custom notification system
    const showMessage = (msg, type) => {
        console.log(`Message (${type}): ${msg}`);
        // Example: if you have a global showNotification function
        if (typeof showNotification !== 'undefined') {
            showNotification(msg, type);
        }
    };


    if (!email) {
        showMessage("Session expired. Please log in again.", "error");
        setTimeout(() => { window.location.href = "../Log-In/Login.html"; }, 2000);
        return;
    }

    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    otpForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        let otpValue = "";
        for (let input of otpInputs) {
            if (input.value.trim() === "") return showMessage("OTP ERROR: All 6 digits are required", "error");
            otpValue += input.value.trim();
        }
        try {
            const response = await fetch("http://localhost:3000/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email, otp: otpValue, type: "login" })
            });
            const result = await response.json();
            if (result.success) {
                showMessage("OTP Verified! Logging you in...", "success");
                if (result.token) {
                    localStorage.setItem("token", result.token);
                    // This is crucial: Save user email here as well, as this is the final login step
                    localStorage.setItem("userEmail", email); // <<< ADDED LINE
                }
                localStorage.removeItem("login_email"); // Clear temporary email used for OTP flow
                setTimeout(() => { window.location.href = "../dashboard/dashboard.html"; }, 1500);
            } else {
                showMessage(result.message || "Invalid OTP. Try again.", "error");
            }
        } catch (err) {
            console.error("OTP Verification Error:", err);
            showMessage("Server error. Please try again later.", "error");
        }
    });

    const resendLink = document.getElementById("resend-link");
    resendLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/resend-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, type: "login" })
            });
            const result = await response.json();
            if (result.success) {
                showMessage("New OTP sent to your email!", "success");
            } else {
                showMessage(result.message || "Failed to resend OTP.", "error");
            }
        } catch (err) {
            console.error("Resend OTP Error:", err);
            showMessage("Server error during resend.", "error");
        }
    });
});