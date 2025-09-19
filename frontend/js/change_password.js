document.addEventListener("DOMContentLoaded", () => {
    console.log("profile.js loaded");
    requireLogin(); // From app.js
    const user = getUser(); // From app.js
    if (user) {
        document.getElementById('profile-username').textContent = user.username;
        document.getElementById('profile-email').textContent = user.email;
    }
    document.getElementById('changePasswordForm').addEventListener('submit', changePassword);
});

async function changePassword(event) {
    event.preventDefault();
    console.log("Change password function triggered");

    // This token comes from the corrected app.js and already includes "Bearer "
    const token = getAuthToken();
    if (!token) {
        displayMessage("You are not logged in.", "error");
        return;
    }

    const old_password = document.getElementById('old_password').value.trim();
    const new_password = document.getElementById('new_password').value.trim();

    if (!old_password || !new_password) {
        displayMessage("Please fill in both password fields.", "error");
        return;
    }

    if (old_password === new_password) {
        displayMessage("New password cannot be the same as the current password.", "error");
        return;
    }

    try {
        // ❗ FIX 1: Added a trailing slash to the URL
        const response = await fetch("http://localhost:5000/api/user/change-password/", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // ❗ FIX 2: Use the token directly from getAuthToken()
                'Authorization': token
            },
            body: JSON.stringify({ old_password, new_password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to update password.");
        }

        displayMessage(data.message || "Password updated successfully.", "success");
        document.getElementById('changePasswordForm').reset();

    } catch (err) {
        console.error("Error updating password:", err);
        displayMessage(err.message, "error");
    }
}

// Helper function to show messages to the user
function displayMessage(message, type) {
    const messageDiv = document.getElementById('profile-message');
    messageDiv.textContent = message;
    messageDiv.className = type; // 'success' or 'error'
}