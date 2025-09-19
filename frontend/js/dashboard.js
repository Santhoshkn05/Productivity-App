const API_TODOS_URL = "http://localhost:5000/api/todos/";
const API_STATS_URL = "http://localhost:5000/api/dashboard/stats/";

function getAuthToken() {
  return localStorage.getItem("token");
}
function getUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "logout.html";
}
function requireLogin() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "login.html";
  }
}
async function loadDashboardStats() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(API_STATS_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Could not fetch stats.");
    const stats = await response.json();

    document.getElementById("total-projects").textContent = stats.total_projects ?? 0;
    document.getElementById("completed-tasks").textContent = stats.completed_tasks ?? 0;
    document.getElementById("habits-tracked").textContent = stats.habits_tracked ?? 0;
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}
async function loadTodos() {
  const token = getAuthToken();
  if (!token) return;

  try {
    const response = await fetch(API_TODOS_URL, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Could not fetch todos.");
    const todos = await response.json();

    const list = document.getElementById("todoList");
    list.innerHTML = "";
    todos.forEach(renderTodo);
  } catch (err) {
    console.error("Error loading todos:", err);
  }
}

function renderTodo(todo) {
  const list = document.getElementById("todoList");
  const item = document.createElement("li");
  item.classList.add("todo-item");
  item.dataset.id = todo.id;

  const createdDate = todo.created_at
    ? new Date(todo.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "--";

  const completedDate = (todo.is_completed && todo.completed_at)
    ? new Date(todo.completed_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "--";

  item.innerHTML = `
    <div class="todo-left">
      <input type="checkbox" ${todo.is_completed ? "checked" : ""}>
    </div>
    <div class="todo-center">
      <span class="todo-task">${todo.content}</span>
      <span class="todo-meta">Created: ${createdDate}</span>
      <span class="todo-meta">Completed: ${completedDate}</span>
    </div>
    <div class="todo-right">
      <button class="delete-btn">Delete</button>
    </div>
  `;

  item.querySelector("input").addEventListener("change", e => {
    toggleTodoStatus(todo.id, e.target.checked);
  });
  item.querySelector(".delete-btn").addEventListener("click", () => {
    deleteTodo(todo.id);
  });

  list.appendChild(item);
}

async function addTodo(e) {
  e.preventDefault();
  const token = getAuthToken();
  const input = document.getElementById("todoInput");
  const content = input.value.trim();
  if (!content || !token) return;

  try {
    const response = await fetch(API_TODOS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error("Failed to add todo.");
    input.value = "";
    loadTodos();
  } catch (err) {
    console.error("Error adding todo:", err);
  }
}

async function toggleTodoStatus(id, isCompleted) {
  const token = getAuthToken();
  if (!token) return;
  try {
    await fetch(`${API_TODOS_URL}${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ is_completed: isCompleted })
    });
    loadTodos();
  } catch (err) {
    console.error("Error updating todo:", err);
  }
}

async function deleteTodo(id) {
  const token = getAuthToken();
  if (!token) return;
  try {
    await fetch(`${API_TODOS_URL}${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });
    loadTodos();
  } catch (err) {
    console.error("Error deleting todo:", err);
  }
}

function setupUserDropdown() {
  const usernameWrapper = document.querySelector(".nav-username");
  const tooltip = usernameWrapper.querySelector(".user-tooltip");

  usernameWrapper.addEventListener("click", (e) => {
    e.stopPropagation();
    tooltip.classList.toggle("active");
    usernameWrapper.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!usernameWrapper.contains(e.target)) {
      tooltip.classList.remove("active");
      usernameWrapper.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  requireLogin();

  const user = getUser();
  if (user) {

    document.getElementById("username").textContent =
      user.username || user.name || "User";

    document.querySelector(".user-name").textContent =
      user.name || user.username || "N/A";
    document.querySelector(".user-email").textContent =
      user.email || "N/A";
    document.querySelector(".user-role").textContent =
      user.role || "User";
  }

  document.querySelector(".logout-btn").addEventListener("click", logout);

  const todoForm = document.getElementById("todoForm");
  if (todoForm) todoForm.addEventListener("submit", addTodo);

  const changePassBtn = document.querySelector(".change-pass");
  if (changePassBtn) {
    changePassBtn.addEventListener("click", () => {
      window.location.href = "change-password.html";
    });
  }

  const deleteAccBtn = document.querySelector(".delete-acc");
  if (deleteAccBtn) {
    deleteAccBtn.addEventListener("click", () => {
      window.location.href = "delete-account.html";
    });
  }

  setupUserDropdown();
  loadDashboardStats();
  loadTodos();
});

