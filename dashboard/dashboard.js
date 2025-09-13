/**
 * Hayzen AI - Fully Functional Dashboard Script
 * This script contains the complete logic for a working dashboard, including:
 * - Security check to ensure only logged-in users can view the page.
 * - View management to switch between Chat, History, and Settings panels.
 * - A working History panel that fetches and displays past conversations.
 * - A working Settings panel with a functional Dark Mode toggle.
 * - A functional Logout button.
 * - NEW: Change Password functionality.
 * - NEW: Enable 2FA toggle functionality using email OTP.
 * - NEW: "Send on Enter" functionality for chat input.
 * - NEW: Language Switcher functionality.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Startup notification
    showNotification('Dashboard script loaded!', 'info');
    // Predeclare settings-related variables to avoid TDZ ReferenceErrors
    let darkModeToggle, enable2FAToggle, logoutBtn, changePasswordBtn;
    let changePasswordModal, changePasswordCloseBtn, changePasswordForm;
    let currentPasswordInput, newPasswordInput, confirmNewPasswordInput;
    let passwordMatchError, changePasswordMessage;
    let twoFactorModal, twoFactorModalTitle, twoFactorCloseBtn, twoFactorForm;
    let twoFactorOtpInput, twoFactorStatusMessage, pending2FAAction = null;

    // (Removed event listeners and handlers for unused settings)

    // --- 1. SECURITY GUARD! 👮‍♂️ ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../Log-In/Login.html';
        return;
    }

    // --- 2. SELECT ALL ELEMENTS ---
    const API_BASE_URL = "http://localhost:3000"; // Your backend server URL

    const body = document.body;
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const newChatBtn = document.querySelector('.new-chat-btn');
    
    // Links that switch views
    const exploreLink = document.getElementById('explore-link');
    const historyLink = document.getElementById('history-link');
    const settingsLink = document.getElementById('settings-link');
    
    // Views (Panels)
    const chatView = document.getElementById('chat-view');
    const historyView = document.getElementById('history-view');
    const settingsView = document.getElementById('settings-view');
    const allViews = document.querySelectorAll('.view');

    // Chat View Elements
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const initialChatContent = document.getElementById('initial-chat-content');


    // History Panel Elements
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const historyLoadingMessage = historyList.querySelector('.loading-message');
    const historyErrorMessage = historyList.querySelector('.error-message');
    const historyNoHistoryMessage = historyList.querySelector('.no-history-message');


    // Settings Panel Elements (only the elements we keep) - assign to predeclared variables
    darkModeToggle = document.getElementById('dark-mode-toggle');
    enable2FAToggle = document.getElementById('enable-2fa-toggle');
    logoutBtn = document.getElementById('logout-btn');
    changePasswordBtn = document.getElementById('change-password-btn');

    // Change Password Modal Elements
    changePasswordModal = document.getElementById('change-password-modal');
    changePasswordCloseBtn = changePasswordModal.querySelector('.modal-close-btn');
    changePasswordForm = document.getElementById('change-password-form');
    currentPasswordInput = document.getElementById('current-password');
    newPasswordInput = document.getElementById('new-password');
    confirmNewPasswordInput = document.getElementById('confirm-new-password');
    passwordMatchError = document.getElementById('password-match-error');
    changePasswordMessage = document.getElementById('change-password-message');

    // 2FA OTP Verification Modal Elements
    twoFactorModal = document.getElementById('two-factor-modal');
    twoFactorModalTitle = document.getElementById('two-factor-modal-title');
    twoFactorCloseBtn = twoFactorModal.querySelector('.modal-close-btn');
    twoFactorForm = document.getElementById('two-factor-form');
    twoFactorOtpInput = document.getElementById('two-factor-otp');
    twoFactorStatusMessage = document.getElementById('two-factor-status-message');


    // --- 3. VIEW MANAGEMENT ---
    const setActiveLink = (activeLink) => {
        document.querySelectorAll('.sidebar-menu a, .sidebar-footer a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    };

    const showView = (viewToShow, linkToActivate) => {
        allViews.forEach(view => view.classList.remove('active-view'));
        viewToShow.classList.add('active-view');
        setActiveLink(linkToActivate);
    };

    exploreLink.addEventListener('click', (e) => { e.preventDefault(); showView(chatView, exploreLink); });
    historyLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        showView(historyView, historyLink); 
        fetchAndDisplayHistory();
    });
    settingsLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Settings link clicked');
        showNotification('Settings link clicked', 'info');
        // Fallback: forcibly show settings panel
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
        settingsView.classList.add('active-view');
        settingsLink.classList.add('active');
    });

    // --- New Chat Button Functionality ---
    newChatBtn.addEventListener('click', () => {
    chatMessagesContainer.innerHTML = '';
    initialChatContent.classList.remove('hidden');
    showView(chatView, exploreLink);
    showNotification('Started a new chat.', 'info');
    });

    // --- Add Chat Message to Display ---
    function addMessageToChat(sender, message) {
        if (!initialChatContent.classList.contains('hidden')) {
            initialChatContent.classList.add('hidden');
        }

        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.innerHTML = escapeHTML(message);
        chatMessagesContainer.appendChild(messageElement);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // --- Handle Suggestion Button Clicks ---
    document.querySelectorAll('.suggestion-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const prompt = e.currentTarget.dataset.prompt;
            chatInput.value = prompt;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // --- 4. HISTORY PANEL FUNCTIONALITY ---
    async function fetchAndDisplayHistory() {
        const dynamicListItems = historyList.querySelectorAll('li:not(.history-message)');
        dynamicListItems.forEach(item => item.remove());

        historyLoadingMessage.classList.remove('hidden');
        historyErrorMessage.classList.add('hidden');
        historyNoHistoryMessage.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/get-history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            historyLoadingMessage.classList.add('hidden');

            if (data.success && data.history.length > 0) {
                data.history.forEach(item => {
                    const li = document.createElement('li');
                    
                    const date = new Date(item.createdAt);
                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                    });

                    li.innerHTML = `
                        <p class="prompt"><b>You:</b> ${escapeHTML(item.prompt)}</p>
                        <p class="reply"><b>Hayzen:</b> ${escapeHTML(item.reply)}</p>
                        <span class="timestamp">${formattedDate}</span>
                    `;
                    historyList.appendChild(li);
                });
            } else {
                historyNoHistoryMessage.classList.remove('hidden');
            }
        } catch (error) {
            console.error('History Fetch Error:', error);
            historyLoadingMessage.classList.add('hidden');
            historyErrorMessage.textContent = `Error: ${error.message}`;
            historyErrorMessage.classList.remove('hidden');
            // showNotification('Could not load chat history.', 'error');
        }
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }


    clearHistoryBtn.addEventListener('click', () => {
        // Try to call backend endpoint for clearing history
        fetch(`${API_BASE_URL}/clear-history`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showNotification('Chat history cleared!', 'success');
                fetchAndDisplayHistory();
            } else {
                showNotification(data.message || 'Failed to clear history.', 'error');
            }
        })
        .catch(err => {
            showNotification('Clear history feature is not yet connected to the backend.', 'info');
        });
    });


    // --- 5. SETTINGS PANEL FUNCTIONALITY ---
    
    // Dark Mode
    darkModeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkModeToggle.checked);
    showNotification('Theme updated!', 'success');
    });

    // (Language switcher removed)


    // Logout
    logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('darkMode');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('appLanguage');
    showNotification('You have been logged out.', 'success');
    setTimeout(() => { window.location.href = '../Log-In/Login.html'; }, 1500);
    });
    
    // Load saved settings (only dark mode and 2FA)
    async function loadSettings() {
        // Dark Mode
        if (localStorage.getItem('darkMode') === 'true') {
            darkModeToggle.checked = true;
            body.classList.add('dark-mode');
        } else {
            darkModeToggle.checked = false;
            body.classList.remove('dark-mode');
        }

        // Fetch and set initial 2FA toggle state from backend
        try {
            const response = await fetch(`${API_BASE_URL}/get-user-status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.userStatus) {
                    enable2FAToggle.checked = !!data.userStatus.is2FAEnabled;
                }
            }
        } catch (error) {
            console.error('Network error fetching user status:', error);
        }
    }
    loadSettings();

    // Change Password Modal Logic
    changePasswordBtn.addEventListener('click', () => {
        changePasswordModal.classList.remove('hidden');
        changePasswordMessage.textContent = '';
        changePasswordMessage.classList.remove('error-text');
        passwordMatchError.classList.add('hidden');
        changePasswordForm.reset();
    });

    changePasswordCloseBtn.addEventListener('click', () => {
        changePasswordModal.classList.add('hidden');
    });

    changePasswordModal.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.classList.add('hidden');
        }
    });

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        changePasswordMessage.textContent = '';
        changePasswordMessage.classList.remove('error-text');
        passwordMatchError.classList.add('hidden');

        if (newPassword !== confirmNewPassword) {
            passwordMatchError.classList.remove('hidden');
            changePasswordMessage.textContent = 'New passwords do not match!';
            changePasswordMessage.classList.add('error-text');
            showNotification('New passwords do not match!', 'error');
            return;
        }

        if (newPassword.length < 6) {
            changePasswordMessage.textContent = 'New password must be at least 6 characters long.';
            changePasswordMessage.classList.add('error-text');
            showNotification('New password must be at least 6 characters long.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                changePasswordMessage.textContent = data.message;
                changePasswordMessage.style.color = 'green';
                changePasswordForm.reset();
                showNotification('Password changed successfully!', 'success');
                setTimeout(() => {
                    changePasswordModal.classList.add('hidden');
                    changePasswordMessage.textContent = '';
                }, 2000);
            } else {
                changePasswordMessage.textContent = data.message || 'Failed to change password.';
                changePasswordMessage.classList.add('error-text');
            }
        } catch (error) {
            console.error('Change password network error:', error);
            changePasswordMessage.textContent = 'An error occurred. Please try again.';
            changePasswordMessage.classList.add('error-text');
        }
    });

    // 2FA Toggle and OTP Verification Logic
    enable2FAToggle.addEventListener('change', async () => {
        const enable = enable2FAToggle.checked;
        twoFactorStatusMessage.textContent = '';
        twoFactorStatusMessage.classList.remove('error-text');
        twoFactorOtpInput.value = '';

        try {
            const response = await fetch(`${API_BASE_URL}/toggle-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ enable })
            });

            const data = await response.json();

            if (data.success) {
                pending2FAAction = enable ? 'enable2fa' : 'disable2fa';
                twoFactorModalTitle.textContent = `Confirm 2FA ${enable ? 'Enable' : 'Disable'}`;
                twoFactorStatusMessage.textContent = data.message;
                twoFactorStatusMessage.style.color = 'green';
                twoFactorModal.classList.remove('hidden');
            } else {
                twoFactorStatusMessage.textContent = data.message || 'Failed to send OTP for 2FA toggle.';
                twoFactorStatusMessage.classList.add('error-text');
                enable2FAToggle.checked = !enable;
            }
        } catch (error) {
            console.error('Toggle 2FA network error:', error);
            twoFactorStatusMessage.textContent = 'An error occurred. Please try again.';
            twoFactorStatusMessage.classList.add('error-text');
            enable2FAToggle.checked = !enable;
        }
    });

    twoFactorCloseBtn.addEventListener('click', () => {
        twoFactorModal.classList.add('hidden');
        twoFactorStatusMessage.textContent = '';
        twoFactorOtpInput.value = '';
        if (pending2FAAction) {
            enable2FAToggle.checked = (pending2FAAction === 'disable2fa');
            pending2FAAction = null;
        }
    });

    twoFactorModal.addEventListener('click', (e) => {
        if (e.target === twoFactorModal) {
            twoFactorModal.classList.add('hidden');
            twoFactorStatusMessage.textContent = '';
            twoFactorOtpInput.value = '';
            if (pending2FAAction) {
                enable2FAToggle.checked = (pending2FAAction === 'disable2fa');
                pending2FAAction = null;
            }
        }
    });

    twoFactorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpCode = twoFactorOtpInput.value.trim();
        twoFactorStatusMessage.textContent = '';
        twoFactorStatusMessage.classList.remove('error-text');

        if (!otpCode) {
            twoFactorStatusMessage.textContent = 'Please enter the OTP.';
            twoFactorStatusMessage.classList.add('error-text');
            return;
        }

        const userEmail = localStorage.getItem('userEmail');

        if (!userEmail) {
            twoFactorStatusMessage.textContent = 'User email not found. Please log in again.';
            twoFactorStatusMessage.classList.add('error-text');
            console.error('User email not found in localStorage for 2FA verification.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: userEmail, otp: otpCode, type: pending2FAAction })
            });

            const data = await response.json();

            if (data.success) {
                twoFactorStatusMessage.textContent = data.message;
                twoFactorStatusMessage.style.color = 'green';
                twoFactorOtpInput.value = '';
                pending2FAAction = null;
                enable2FAToggle.checked = data.is2FAEnabled;
                showNotification('2FA status updated!', 'success');
                setTimeout(() => {
                    twoFactorModal.classList.add('hidden');
                    twoFactorStatusMessage.textContent = '';
                }, 2000);
            } else {
                twoFactorStatusMessage.textContent = data.message || 'OTP verification failed.';
                twoFactorStatusMessage.classList.add('error-text');
                enable2FAToggle.checked = !enable2FAToggle.checked;
            }
        } catch (error) {
            console.error('2FA OTP verification network error:', error);
            twoFactorStatusMessage.textContent = 'An error occurred during verification. Please try again.';
            twoFactorStatusMessage.classList.add('error-text');
            enable2FAToggle.checked = !enable2FAToggle.checked;
        }
    });


    // --- 6. CORE CHAT FUNCTIONALITY ---
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage) {
            addMessageToChat('user', userMessage);
            chatInput.value = '';

            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('chat-message', 'ai', 'typing');
            typingIndicator.innerHTML = 'Hayzen is typing...';
            chatMessagesContainer.appendChild(typingIndicator);
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

            try {
                const response = await fetch(`${API_BASE_URL}/askAI`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ prompt: userMessage })
                });
                const data = await response.json();

                typingIndicator.remove(); 

                if(data.success) {
                    console.log("AI Reply:", data.reply);
                    addMessageToChat('ai', data.reply);
                    showNotification('AI replied!', 'success');
                } else {
                    addMessageToChat('ai', `Error: ${data.message || 'An unknown error occurred.'}`);
                    showNotification(data.message || 'An unknown error occurred.', 'error');
                }
            } catch (error) {
                typingIndicator.remove();
                addMessageToChat('ai', `Error: Failed to connect to the AI: ${error.message}`);
                showNotification('Failed to connect to the AI.', 'error');
            }
        }
    });

    // Handle initial view
    showView(chatView, exploreLink);
});