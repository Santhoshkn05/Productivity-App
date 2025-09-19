const API_TASKS_URL = "http://localhost:5000/api/tasks/";

function getAuthToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Authentication token not found. Please log in.");
        window.location.href = "login.html";
        return null;
    }
    return `Bearer ${token}`;
}

function renderTasks(tasks) {
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    document.querySelectorAll('.task-card .task-list').forEach(list => list.innerHTML = "");
    const categoryContainers = {};
    document.querySelectorAll('.task-card').forEach(card => {
        const categoryTitle = card.querySelector('h3').textContent.trim();
        categoryContainers[categoryTitle] = card.querySelector('.task-list');
    });

    pendingTasks.forEach(task => {
        let found = false;
        document.querySelectorAll('.task-card').forEach(card => {
            if (found) return;
            const options = Array.from(card.querySelectorAll('select option'));
            if (options.some(opt => opt.value === task.title)) {
                const container = categoryContainers[card.querySelector('h3').textContent.trim()];
                if (container) {
                    createTaskItem(task, container);
                    found = true;
                }
            }
        });
    });
    
    const completedListContainer = document.getElementById("completed-tasks-list");
    completedListContainer.innerHTML = "";

    if (completedTasks.length === 0) {
        completedListContainer.innerHTML = "<p>No tasks have been completed yet.</p>";
    } else {
        completedTasks.forEach(task => {
            createTaskItem(task, completedListContainer);
        });
    }
}

function createTaskItem(task, container) {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    taskItem.dataset.id = task.id;
    if (task.status === 'completed') {
        taskItem.classList.add('completed');
    }
    
    let descriptionHtml = task.description ? `<p class="task-description">${task.description}</p>` : '';
    let completedAtHtml = '';

    if (task.status === 'completed' && task.completed_at) {
        const date = new Date(task.completed_at);
        const formattedDate = date.toLocaleString('en-IN', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: 'numeric', minute: '2-digit', hour12: true
        });
        completedAtHtml = `<p class="completed-time">Completed: ${formattedDate}</p>`;
    }

    taskItem.innerHTML = `
        <input type="checkbox" class="task-status-checkbox" ${task.status === 'completed' ? 'checked' : ''}>
        <div class="task-content">
            <span>${task.title}</span>
            ${descriptionHtml}
            ${completedAtHtml}
        </div>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
    `;
    
    taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    taskItem.querySelector('.task-status-checkbox').addEventListener('change', (e) => {
        updateTaskStatus(task.id, e.target.checked);
    });

    container.appendChild(taskItem);
}

async function updateTaskStatus(taskId, isCompleted) {
    const token = getAuthToken();
    if (!token) return;
    const newStatus = isCompleted ? 'completed' : 'pending';

    try {
        const response = await fetch(`${API_TASKS_URL}${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error("Failed to update status.");
        loadTasks(); 
    } catch (err) {
        console.error("Error updating task status:", err);
    }
}

async function loadTasks() {
    const token = getAuthToken();
    if (!token) return;
    try {
        const response = await fetch(API_TASKS_URL, {
            headers: { "Authorization": token }
        });
        if (response.status === 401) {
            window.location.href = "login.html";
            return;
        }
        if (!response.ok) throw new Error("Could not fetch tasks.");
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (err) {
        console.error("Failed to load tasks:", err);
    }
}

async function saveTask(button) {
    const token = getAuthToken();
    if (!token) return;

    const card = button.closest(".task-card");
    const select = card.querySelector("select");
    const textarea = card.querySelector("textarea");
    const title = select.value;
    const description = textarea.value.trim();

    if (!title) {
        alert("Please select a task from the list.");
        return;
    }
    try {
        await fetch(API_TASKS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ title, description, status: 'pending' })
        });
        alert("Task saved successfully!");
        loadTasks();
        select.value = "";
        textarea.value = "";
        card.querySelector('.description-box').style.display = 'none';
    } catch (err) {
        console.error("Error saving task:", err);
    }
}

async function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    const token = getAuthToken();
    if (!token) return;

    try {
        await fetch(`${API_TASKS_URL}${taskId}`, {
            method: "DELETE",
            headers: { "Authorization": token }
        });
        loadTasks(); 
    } catch (err) {
        console.error("Error deleting task:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTasks();
    document.querySelectorAll('.task-card select').forEach(select => {
        select.addEventListener('change', event => {
            const card = event.target.closest('.task-card');
            const box = card.querySelector('.description-box');
            box.style.display = event.target.value ? 'block' : 'none';
        });
    });
    document.querySelectorAll('.description-box button').forEach(button => {
        button.addEventListener('click', () => saveTask(button));
    });
});