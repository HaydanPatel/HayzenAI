// 📁 Log-In/Login.js

// 🔧 BIND THE FORM TO THE FUNCTION
document.querySelector("#login_Form").addEventListener("submit", checkLogin);

async function checkLogin(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    // ✨ FIX: Using showNotification for all messages
    if (email === "") return showNotification("Email is required.", "error");
    const checkEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!checkEmail.test(email)) return showNotification("Invalid email format.", "error");
    if (password === "") return showNotification("Password is required.", "error");
    
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save userEmail to localStorage regardless of 2FA status
            // This is crucial for the dashboard's 2FA toggle to work correctly
            localStorage.setItem("userEmail", email); // <<< ADDED/UPDATED LINE

            if (data.requires2FA) {
                showNotification("Password correct! Please enter your OTP.", "info");
                localStorage.setItem("login_email", email); // This is for Login-OTP.html
                setTimeout(() => {
                    window.location.href = "../Login-OTP/Login-OTP.html";
                }, 1500);
            } else {
                showNotification("Login Successful! Redirecting...", "success");
                localStorage.setItem("token", data.token);
                setTimeout(() => {
                    window.location.href = "../dashboard/dashboard.html";
                }, 1500);
            }
        } else {
            showNotification(data.message || "Login failed.", "error");
        }
    } catch (err) {
        console.error("Login Fetch Error:", err);
        showNotification("Server error. Could not connect.", "error");
    }
}