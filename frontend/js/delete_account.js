document.addEventListener("DOMContentLoaded", () => {
    requireLogin();
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if(confirmBtn) {
        confirmBtn.addEventListener('click', deleteAccount);
    }
});

async function deleteAccount() {
    const token = getAuthToken(); 
    if (!token) return;

    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch("http://localhost:5000/api/user/delete-account/", {
            method: 'DELETE',
            headers: { 
                'Authorization': token 
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete account.");
        }
        
        alert("Your account has been successfully deleted.");
        logout();

    } catch (err) {
        messageDiv.textContent = err.message;
        messageDiv.className = 'error';
    }
}