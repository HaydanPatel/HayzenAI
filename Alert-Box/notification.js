/**
 * Hayzen AI - Beautiful Notification System ✨ (Version 2)
 * This improved version adds a close button and has cleaner logic!
 */

function showNotification(message, type = 'info', duration = 4000) {
    // Get the containers, or create them if they don't exist yet!
    const toastContainer = getOrCreateContainer('toast-container');
    const messageBoxContainer = getOrCreateContainer('message-box-container');

    // For errors, we use the big, important message box!
    if (type === 'error') {
        createMessageBox(messageBoxContainer, message, type, duration);
    } else {
        // For success and info, we use the friendly little toast!
        createToast(toastContainer, message, type, duration);
    }
}

// A helper function to keep our code clean!
function getOrCreateContainer(id) {
    let container = document.getElementById(id);
    if (!container) {
        container = document.createElement('div');
        container.id = id;
        document.body.appendChild(container);
    }
    return container;
}

// This function creates the big, centered message box for errors.
function createMessageBox(container, message, type, duration) {
    const box = document.createElement('div');
    box.className = `message-box ${type}`;
    box.innerHTML = `
        <p>${message}</p>
        <div class="message-box-close">&times;</div>
    `;
    container.appendChild(box);

    const closeButton = box.querySelector('.message-box-close');
    const removeBox = () => {
        box.classList.add('fade-out');
        box.addEventListener('transitionend', () => box.remove());
    };
    
    closeButton.addEventListener('click', removeBox);
    setTimeout(removeBox, duration);
}

// This function creates the friendly toast notification.
function createToast(container, message, type, duration) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'bxs-check-circle',
        info: 'bxs-info-circle'
    };
    const icon = icons[type] || 'bxs-info-circle';

    toast.innerHTML = `
        <i class='bx ${icon} toast-icon'></i>
        <p class="toast-message">${message}</p>
        <div class="toast-close">&times;</div>
    `;
    container.appendChild(toast);

    // This makes the slide-in animation work!
    setTimeout(() => toast.classList.add('show'), 100);

    const closeButton = toast.querySelector('.toast-close');
    const removeToast = () => {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    };

    closeButton.addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
}
