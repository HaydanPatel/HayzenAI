// ✅ Select the signup form
const form = document.querySelector("#signUp_Form");

// ✅ Attach form submission
form.addEventListener("submit", checkData);

// ✅ Validation and submission function
function checkData(event) {
  event.preventDefault();

  const fullName = document.querySelector("#fullName").value.trim();
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();
  const confirmPassword = document.querySelector("#confirm_Password").value.trim();

  // ✅ Full Name check
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!fullName) return showNotification("FULLNAME ERROR: Full Name is Mandatory!", "error");
  if (!nameRegex.test(fullName)) return showNotification("FULLNAME ERROR: Only letters and spaces allowed.", "error");
  showNotification("FULLNAME OK ✅", "info");

  // ✅ Email check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) return showNotification("EMAIL ERROR: Email is required.", "error");
  if (!emailRegex.test(email)) return showNotification("EMAIL ERROR: Invalid format.", "error");
  showNotification("EMAIL OK ✅", "info");

  // ✅ Password check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.@#$%^&*!])[A-Za-z\d.@#$%^&*!]{8,}$/;
  if (!password) return showNotification("PASSWORD ERROR: Required.", "error");
  if (!passwordRegex.test(password)) {
    return showNotification("PASSWORD ERROR: Must have uppercase, lowercase, number, special char, and be 8+ chars.", "error");
  }
  showNotification("PASSWORD OK ✅", "info");

  // ✅ Confirm password match
  if (!confirmPassword) return showNotification("CONFIRM PASSWORD ERROR: Required.", "error");
  if (confirmPassword !== password) return showNotification("ERROR: Passwords do not match.", "error");

  // ✅ All valid
  showNotification("🎉 All checks passed! Submitting...", "success");

  const data = { fullName, email, password };

  // ✅ Send to backend
  fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        showNotification("✅ Server: " + result.message, "success");
        localStorage.setItem("signup_email", email);
        setTimeout(() => {
          window.location.href = "../Signup-OTP/Signup-OTP.html";
        }, 2000);
      } else {
        showNotification("❌ " + result.message, "error");
      }
    })
    .catch(err => {
  console.error("⚠️ FETCH ERROR:", err);
  showNotification("❌ Connection failed. Try again.", "error");
    });
}

// ✅ Toggle password visibility
document.getElementById("togglePassword").addEventListener("click", function () {
  const pwd = document.getElementById("password");
  this.textContent = pwd.type === "password" ? "visibility_off" : "visibility";
  pwd.type = pwd.type === "password" ? "text" : "password";
});

document.getElementById("toggleConfirm").addEventListener("click", function () {
  const cpwd = document.getElementById("confirm_Password");
  this.textContent = cpwd.type === "password" ? "visibility_off" : "visibility";
  cpwd.type = cpwd.type === "password" ? "text" : "password";
});
