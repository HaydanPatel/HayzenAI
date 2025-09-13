// ----------------------------------------
// Hayzen - Forgot Password OTP Verification
// ----------------------------------------

const otpForm = document.querySelector("#otp-form");
const otpInputs = document.querySelectorAll(".otp-inputs input");
const userEmail = localStorage.getItem("forgot_email");

// 🔐 Session check
if (!userEmail) {
  showNotification("❌ SESSION EXPIRED: Please start again.", "error");
  setTimeout(() => {
    window.location.href = "../forgot-password/forgot_password.html";
  }, 2000);
}

// ✅ Auto focus first input
window.addEventListener("DOMContentLoaded", () => {
  otpInputs[0].focus();
});

// 🔄 Input navigation
otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const value = input.value.trim();
    if (value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && input.value === "" && index > 0) {
      otpInputs[index - 1].focus();
    }
  });
});

// ✅ Submit OTP
otpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  let otpValue = "";
  otpInputs.forEach((input) => {
    otpValue += input.value.trim();
  });

  if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
    return showNotification("❌ ERROR: Enter a valid 6-digit OTP.", "error");
  }

  try {
    const response = await fetch("http://localhost:3000/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        otp: otpValue,
        type: "forgot"
      }),
    });

    const data = await response.json();

    if (data.success) {
      showNotification("✅ OTP Verified! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "../reset-password/reset_password.html";
      }, 2000);
    } else {
      showNotification(`❌ OTP Failed: ${data.message}`, "error");

      // Optionally clear OTP boxes
      otpInputs.forEach((input) => input.value = "");
      otpInputs[0].focus();
    }

  } catch (err) {
    console.error("🔴 OTP VERIFY ERROR:", err);
    showNotification("❌ SERVER ERROR: Please try again", "error");
  }
});
