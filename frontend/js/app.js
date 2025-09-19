function getAuthToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }
    // ❗ FIX: This adds the required "Bearer " prefix.
    return `Bearer ${token}`;
}

function getUser() {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
        return JSON.parse(userData);
    } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        return null;
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "logout.html";
}

function requireLogin() {
    if (!getAuthToken()) {
        alert("You must be logged in to view this page. Please log in.");
        window.location.href = "login.html";
    }
}