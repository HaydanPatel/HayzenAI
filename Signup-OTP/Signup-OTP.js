// ✅ Wait until the whole HTML content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // 🔹 Select the OTP form
    const otpForm = document.querySelector("#otp-form");

    // 🔹 Select all 6 OTP input boxes
    const otpInputs = document.querySelectorAll(".otp-inputs input");

    // 🔹 Get the stored email from localStorage (set during signup)
    const email = localStorage.getItem("signup_email");

    // ❌ If no email is found in localStorage, treat it as expired session
    if (!email) {
    showNotification("Session expired. Please sign up again.", "error");

        // ⏳ Redirect user back to signup page after 2 seconds
        setTimeout(() => {
            window.location.href = "../Sign-Up/signup.html";
        }, 2000);
        return;
    }

    // 🔁 Auto-move to next input when a digit is entered
    otpInputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            // If a single digit is entered and it's not the last box, go to next
            if (input.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // 🔁 Support backward navigation with Backspace key
        input.addEventListener("keydown", (e) => {
            // If backspace is pressed on empty input, move to previous input
            if (e.key === "Backspace" && input.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // 🔐 Handle OTP form submission
    otpForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form refresh

        let otpValue = "";

        // 🧩 Collect all 6 digits into a single OTP string
        for (let input of otpInputs) {
            if (input.value.trim() === "") {
                showNotification("OTP ERROR: All 6 digits are required", "error");
                return;
            }
            otpValue += input.value.trim();
        }

        try {
            // 🌐 Send OTP and email to backend for verification
            const response = await fetch("http://localhost:3000/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,         // user email from localStorage
                    otp: otpValue,        // 6-digit OTP entered
                    type: "signup"        // specify it's a signup OTP
                })
            });

            const result = await response.json(); // Parse response JSON

            // ✅ If OTP verified successfully
            if (result.success) {
                showNotification("OTP Verified Successfully!", "success");

                // 🧹 Remove email from localStorage after successful verification
                localStorage.removeItem("signup_email");

                // ⏳ Redirect to dashboard or welcome page
                setTimeout(() => {
                    window.location.href = "../dashboard/dashboard.html"; // ✅ Updated to your actual path
                }, 2000);

            } else {
                // ❌ If backend returns error
                showNotification(result.message || "Invalid OTP. Please try again.", "error");
            }

        } catch (err) {
            // 🔥 Catch and show unexpected errors
            console.error("OTP verification error:", err);
            showNotification("Something went wrong. Try again later.", "error");
        }
    });
});
