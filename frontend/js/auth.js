const API_URL = "http://localhost:5000/api";

async function registerUser(username, email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, message: data.error || "Registration failed" };
    }
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: "Server is not responding. Please try again later." };
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
        return { success: false, message: data.error || "Login failed" };
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return { success: true };
  } catch (error) {
    return { success: false, message: "Server is not responding. Please try again later." };
  }
}

async function doRegister(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageDiv = document.getElementById("message");

  if (!username || !email || !password) {
    messageDiv.textContent = "Please fill in all fields.";
    messageDiv.style.color = "red";
    return;
  }
  
  const result = await registerUser(username, email, password);
  
  messageDiv.textContent = result.message;
  messageDiv.style.color = result.success ? "green" : "red";
  
  if (result.success) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}

async function doLogin(event) {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    const result = await loginUser(email, password);

    if (result.success) {
        window.location.href = "dashboard.html";
    } else {
        alert(result.message);
    }
}