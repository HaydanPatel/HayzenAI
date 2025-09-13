Project README Template (Example for Hayzen AI)
# Hayzen AI — Full-Stack AI Chatbot

Hayzen AI is a full-stack chatbot application featuring a secure, multi-factor user authentication system and integration with large language models for dynamic conversation.

---

### **Live Demo**

[Link to your live project if you have one - e.g., on Vercel, Netlify, or Heroku]

### **Screenshots**

*Include screenshots of your application here. Show the login page, the main chat interface, etc.*

![Login Page](link-to-your-screenshot.png)
![Chat Interface](link-to-your-screenshot.png)

---

### **Features**

* **Secure User Authentication:** JWT, bcrypt hashing, and OTP email verification via Nodemailer.
* **Real-Time Chat:** A responsive chat interface built with vanilla JavaScript.
* **Dynamic AI Responses:** Integrated with OpenRouter and Gemini API.
* **MySQL Database:** Manages all user data, including credentials and chat history.

---

### **Tech Stack**

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Authentication:** JSON Web Tokens (JWT), bcrypt
* **APIs:** Gemini API, OpenRouter

---

### **Setup and Installation**

Instructions for another developer to run your project locally.

1.  Clone the repository:
    ```bash
    git clone https://github.com/[YOUR_USERNAME]/[YOUR-REPO-NAME].git
    ```
2.  Navigate to the project directory:
    ```bash
    cd [YOUR-REPO-NAME]
    ```
3.  Install backend dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the root and add the following environment variables:
    ```
    DB_HOST='localhost'
    DB_USER='root'
    DB_PASSWORD='your_database_password'
    JWT_SECRET='your_jwt_secret'
    GEMINI_API_KEY='your_api_key'
    ```
5.  Start the server:
    ```bash
    npm start
    ```
