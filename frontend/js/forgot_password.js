document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgotPasswordForm');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const confirm_password = form.confirm_password.value.trim();

        if (!email || !password || !confirm_password) {
            displayMessage('Please fill out all fields.', 'error');
            return;
        }

        if (password !== confirm_password) {
            displayMessage('Passwords do not match.', 'error');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/reset-password/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                displayMessage(result.message, 'success');
                form.reset();
            } else {
                throw new Error(result.message || `Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            displayMessage(error.message, 'error');
        }
    });

    function displayMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
    }
});