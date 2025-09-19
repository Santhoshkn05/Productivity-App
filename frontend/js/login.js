async function loginUser() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Please enter username and password");
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);  
      alert("Login successful");
      loadProjects();  
    } else {
      alert(data.msg || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error during login");
  }
}

document.getElementById("loginBtn").addEventListener("click", loginUser);
