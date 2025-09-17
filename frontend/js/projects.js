const API_PROJECTS_URL = "http://localhost:5000/api/projects/";

function getAuthToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return null;
    }
    return `Bearer ${token}`;
}

function renderProjects(projects) {
    const workingContainer = document.getElementById("workingProjectList");
    const completedContainer = document.getElementById("completedProjectList");

    workingContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    const workingProjects = projects.filter(p => p.status === 'working');
    const completedProjects = projects.filter(p => p.status === 'completed');

    if (workingProjects.length === 0) {
        workingContainer.innerHTML = "<p>No working projects found. Add one!</p>";
    } else {
        workingProjects.forEach(p => createProjectCard(p, workingContainer));
    }

    if (completedProjects.length === 0) {
        completedContainer.innerHTML = "<p>No projects have been completed yet.</p>";
    } else {
        completedProjects.forEach(p => createProjectCard(p, completedContainer));
    }
}

function createProjectCard(p, container) {
    const card = document.createElement("div");
    card.className = `project-card ${p.status}`;
    card.dataset.id = p.id;

    const isWorking = p.status === 'working';
    let completionInfoHtml = '';
    if (p.status === 'completed' && p.completed_at) {
        const date = new Date(p.completed_at);
        const formattedDate = date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        completionInfoHtml = `<p class="completion-info">Completed: ${formattedDate}</p>`;
    }

    card.innerHTML = `
        <div class="card-header">
            <div class="card-header-left">
                <div class="status-light ${p.status}"></div>
                <h3>${p.name}</h3>
            </div>
            <div>
                ${isWorking ? `
                    <button class="update-btn" onclick="editProject(${p.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                ` : ''}
                <button class="delete-btn" onclick="deleteProject(${p.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="card-body">
            <p>${p.description}</p>
            <p><strong>Language:</strong> ${p.language || 'N/A'}</p>
            <textarea readonly>${p.details || ''}</textarea>
            ${completionInfoHtml}
            <div class="status-toggle">
                <input type="checkbox" id="status-check-${p.id}" ${p.status === 'completed' ? 'checked' : ''} onchange="updateProjectStatus(${p.id}, this.checked)">
                <label for="status-check-${p.id}">Mark as Completed</label>
            </div>
        </div>
    `;
    container.appendChild(card);
}

async function loadProjects() {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(API_PROJECTS_URL, {
            headers: { "Authorization": token }
        });

        if (!response.ok) throw new Error("Failed to load projects");

        const projects = await response.json();
        window.loadedProjects = projects;
        renderProjects(projects);
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

async function addProject(event) {
    event.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDesc").value.trim();
    const languageSelect = document.getElementById("projectLang");
    const details = document.getElementById("projectDetails").value.trim();

    let language = languageSelect.value;
    if (language === "Other") {
        const otherLangInput = document.getElementById("otherLangInput").value.trim();
        if (otherLangInput) {
            language = otherLangInput;
        } else {
            alert("Please specify the language.");
            return;
        }
    }

    if (!name || !description) return alert("All fields are required.");

    try {
        const response = await fetch(API_PROJECTS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ name, description, language, details })
        });

        if (!response.ok) throw new Error("Failed to add project");

        alert("Project added successfully!");
        document.getElementById("project-form").reset();
        document.getElementById("otherLangInput").style.display = 'none';
        loadProjects();
    } catch (err) {
        console.error("Error adding project:", err);
    }
}

async function updateProjectStatus(id, isCompleted) {
    const token = getAuthToken();
    if (!token) return;

    const status = isCompleted ? "completed" : "working";

    try {
        const response = await fetch(`${API_PROJECTS_URL}${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error("Failed to update status");

        loadProjects();
    } catch (err) {
        console.error("Error updating status:", err);
    }
}

async function deleteProject(id) {
    const token = getAuthToken();
    if (!token) return;

    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
        const response = await fetch(`${API_PROJECTS_URL}${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": token
            }
        });

        if (!response.ok) throw new Error("Failed to delete project");

        loadProjects();
    } catch (err) {
        console.error("Error deleting project:", err);
    }
}

async function editProject(id) {
    const token = getAuthToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_PROJECTS_URL}${id}`, {
            headers: { "Authorization": token }
        });

        if (!response.ok) throw new Error("Project not found");

        const project = await response.json();

        document.getElementById("projectName").value = project.name;
        document.getElementById("projectDesc").value = project.description;

        const langSelect = document.getElementById("projectLang");
        const otherLangInput = document.getElementById("otherLangInput");

        const standardLanguages = ["Python", "Java", "JavaScript"];
        if (standardLanguages.includes(project.language)) {
            langSelect.value = project.language;
            otherLangInput.style.display = "none";
            otherLangInput.value = "";
        } else {
            langSelect.value = "Other";
            otherLangInput.style.display = "block";
            otherLangInput.value = project.language;
        }

        document.getElementById("projectDetails").value = project.details;

        const addBtn = document.getElementById("addProjectBtn");
        addBtn.innerHTML = `<i class="fa-solid fa-pen"></i> Update Project`;
        addBtn.onclick = async function (e) {
            e.preventDefault();

            const updatedProject = {
                name: document.getElementById("projectName").value.trim(),
                description: document.getElementById("projectDesc").value.trim(),
                language: langSelect.value === "Other"
                    ? otherLangInput.value.trim()
                    : langSelect.value,
                details: document.getElementById("projectDetails").value.trim()
            };

            try {
                const updateResponse = await fetch(`${API_PROJECTS_URL}${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token
                    },
                    body: JSON.stringify(updatedProject)
                });

                if (!updateResponse.ok) throw new Error("Failed to update project");

                alert("Project updated!");
                document.getElementById("project-form").reset();
                otherLangInput.style.display = 'none'; 

                addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Project`;
                addBtn.onclick = addProject;
                loadProjects();
            } catch (err) {
                console.error("Update failed:", err);
                alert("Failed to update project.");
            }
        };
    } catch (err) {
        console.error("Edit failed:", err);
        alert(`Update functionality for project ID ${id} failed.`);
    }
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    document.getElementById("project-form").addEventListener("submit", addProject);

    const languageSelect = document.getElementById("projectLang");
    const otherLangInput = document.getElementById("otherLangInput");

    languageSelect.addEventListener("change", () => {
        otherLangInput.style.display = languageSelect.value === "Other" ? "block" : "none";
    });
});
