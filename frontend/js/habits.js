const API_HABITS_URL = "http://localhost:5000/api/habits/";
let progressChart; 

function getAuthToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Authentication token not found. Please log in.");
        window.location.href = "login.html";
        return null;
    }
    return `Bearer ${token}`;
}

function renderHabits(habits) {
    const pendingHabits = habits.filter(h => h.status === 'pending');
    const completedHabits = habits.filter(h => h.status === 'completed');

    document.querySelectorAll('.habit-card .habit-list').forEach(list => list.innerHTML = "");
    const categoryContainers = {};
    document.querySelectorAll('.habit-card').forEach(card => {
        const categoryTitle = card.querySelector('h3').textContent.trim();
        categoryContainers[categoryTitle] = card.querySelector('.habit-list');
    });

    pendingHabits.forEach(habit => {
        let found = false;
        document.querySelectorAll('.habit-card').forEach(card => {
            if (found) return;
            const options = Array.from(card.querySelectorAll('select option'));
            if (options.some(opt => opt.value === habit.name)) {
                const container = categoryContainers[card.querySelector('h3').textContent.trim()];
                if (container) {
                    createHabitItem(habit, container);
                    found = true;
                }
            }
        });
    });
    
    const completedListContainer = document.getElementById("completed-habits-list");
    completedListContainer.innerHTML = "";

    if (completedHabits.length === 0) {
        completedListContainer.innerHTML = "<p>No habits have been completed yet.</p>";
    } else {
        completedHabits.forEach(habit => {
            createHabitItem(habit, completedListContainer);
        });
    }
}

function createHabitItem(habit, container) {
    const habitItem = document.createElement("div");
    habitItem.className = "habit-item";
    habitItem.dataset.id = habit.id;
    if (habit.status === 'completed') {
        habitItem.classList.add('completed');
    }
    
    let descriptionHtml = habit.description ? `<p class="habit-description">${habit.description}</p>` : '';
    let completedAtHtml = '';

    if (habit.status === 'completed' && habit.completed_at) {
        const date = new Date(habit.completed_at);
        const formattedDate = date.toLocaleString('en-IN', { 
            day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'
        });
        completedAtHtml = `<p class="completed-time">Completed: ${formattedDate}</p>`;
    }

    habitItem.innerHTML = `
        <input type="checkbox" class="habit-status-checkbox" ${habit.status === 'completed' ? 'checked' : ''}>
        <div class="habit-content">
            <span>${habit.name}</span>
            ${descriptionHtml}
            ${completedAtHtml}
        </div>
        <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
    `;
    
    habitItem.querySelector('.delete-btn').addEventListener('click', () => deleteHabit(habit.id));
    habitItem.querySelector('.habit-status-checkbox').addEventListener('change', (e) => {
        updateHabitStatus(habit.id, e.target.checked);
    });

    container.appendChild(habitItem);
}

function updateChart(habits) {
    const today = new Date();
    const labels = [];
    const data = Array(7).fill(0);

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    habits.forEach(habit => {
        if (habit.status === 'completed' && habit.completed_at) {
            const completedDate = new Date(habit.completed_at);
            const diffDays = Math.floor((new Date().setHours(0,0,0,0) - completedDate.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
                data[6 - diffDays]++;
            }
        }
    });

    progressChart.data.labels = labels;
    progressChart.data.datasets[0].data = data;
    progressChart.update();
}

async function loadHabits() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(API_HABITS_URL, { headers: { "Authorization": token } });
        if (response.status === 401) {
            logout();
            return;
        }
        if (!response.ok) throw new Error("Could not fetch habits.");
        const habits = await response.json();
        renderHabits(habits);
        updateChart(habits);
    } catch (err) {
        console.error("Failed to load habits:", err);
    }
}

async function saveHabit(button) {
    const token = getAuthToken();
    if (!token) return;

    const card = button.closest(".habit-card");
    const select = card.querySelector("select");
    const textarea = card.querySelector("textarea");
    const name = select.value;
    const description = textarea.value.trim();

    if (!name) {
        alert("Please select a habit.");
        return;
    }

    try {
        const response = await fetch(API_HABITS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": token },
            body: JSON.stringify({ name, description })
        });
        if (!response.ok) throw new Error("Failed to save habit.");
        
        alert("Habit saved!");
        select.value = "";
        textarea.value = "";
        card.querySelector('.description-box').style.display = 'none';
        loadHabits();
    } catch (err) {
        console.error("Error saving habit:", err);
    }
}

async function updateHabitStatus(habitId, isCompleted) {
    const token = getAuthToken();
    if (!token) return;

    const newStatus = isCompleted ? 'completed' : 'pending';

    try {
        await fetch(`${API_HABITS_URL}${habitId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ status: newStatus })
        });
        loadHabits();
    } catch (err) {
        console.error("Error updating habit status:", err);
    }
}

async function deleteHabit(habitId) {
    if (!confirm("Are you sure you want to delete this habit?")) return;

    const token = getAuthToken();
    if (!token) return;

    try {
        await fetch(`${API_HABITS_URL}${habitId}`, {
            method: "DELETE",
            headers: { "Authorization": token }
        });
        loadHabits();
    } catch (err) {
        console.error("Error deleting habit:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Completed Habits',
                data: [],
                backgroundColor: '#00c6ff',
                borderRadius: 5,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#aaa', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#aaa' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            }
        }
    });

    loadHabits();

    document.querySelectorAll('.habit-card select').forEach(select => {
        select.addEventListener('change', event => {
            const card = event.target.closest('.habit-card');
            card.querySelector('.description-box').style.display = event.target.value ? 'block' : 'none';
        });
    });

    document.querySelectorAll('.description-box button').forEach(button => {
        button.addEventListener('click', () => saveHabit(button));
    });
});