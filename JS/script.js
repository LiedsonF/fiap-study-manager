/* =========================
   DADOS
========================= */

let tasks = JSON.parse(localStorage.getItem("fiapTasks")) || [];

let settings = JSON.parse(localStorage.getItem("fiapSettings")) || {
    name: "Liedson",
    weeklyGoal: 18
};


/* =========================
   ELEMENTOS
========================= */

const taskModal = document.getElementById("taskModal");

const taskForm = document.getElementById("taskForm");

const taskId = document.getElementById("taskId");

const taskTitle = document.getElementById("taskTitle");

const taskSubject = document.getElementById("taskSubject");

const taskDate = document.getElementById("taskDate");

const taskTime = document.getElementById("taskTime");

const taskPriority = document.getElementById("taskPriority");

const taskDuration = document.getElementById("taskDuration");


/* =========================
   SALVAR
========================= */

function saveTasks() {

    localStorage.setItem(
        "fiapTasks",
        JSON.stringify(tasks)
    );

}


function saveSettingsData() {

    localStorage.setItem(
        "fiapSettings",
        JSON.stringify(settings)
    );

}


/* =========================
   DATA
========================= */

function formatDate(date) {

    const parts = date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function getToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function daysUntil(dateString) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const target = new Date(dateString + "T00:00:00");

    const difference =
        target - today;

    return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

}


/* =========================
   MODAL
========================= */

function openModal(task = null) {

    taskModal.classList.add("show");

    if (task) {

        document.getElementById("modalTitle").textContent =
            "Editar tarefa";

        taskId.value = task.id;

        taskTitle.value = task.title;

        taskSubject.value = task.subject;

        taskDate.value = task.date;

        taskTime.value = task.time;

        taskPriority.value = task.priority;

        taskDuration.value = task.duration;

    } else {

        document.getElementById("modalTitle").textContent =
            "Nova tarefa";

        taskForm.reset();

        taskId.value = "";

        taskDate.value = getToday();

        taskTime.value = "18:00";

        taskDuration.value = "1";

    }

}


function closeModal() {

    taskModal.classList.remove("show");

}


document
    .getElementById("openTaskButton")
    .addEventListener("click", () => openModal());


document
    .getElementById("openTaskButton2")
    .addEventListener("click", () => openModal());


document
    .getElementById("closeModal")
    .addEventListener("click", closeModal);


document
    .getElementById("cancelTask")
    .addEventListener("click", closeModal);


/* =========================
   CRIAR / EDITAR TAREFA
========================= */

taskForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const id = taskId.value;


    const taskData = {

        id: id || Date.now().toString(),

        title: taskTitle.value,

        subject: taskSubject.value,

        date: taskDate.value,

        time: taskTime.value,

        priority: taskPriority.value,

        duration: Number(taskDuration.value),

        completed: false

    };


    if (id) {

        const existingTask =
            tasks.find(task => task.id === id);

        taskData.completed =
            existingTask.completed;

        tasks = tasks.map(task =>
            task.id === id
                ? taskData
                : task
        );

    } else {

        tasks.push(taskData);

    }


    saveTasks();

    closeModal();

    renderAll();

});


/* =========================
   CONCLUIR
========================= */

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: !task.completed
            };

        }

        return task;

    });


    saveTasks();

    renderAll();

}


/* =========================
   EXCLUIR
========================= */

function deleteTask(id) {

    const confirmed =
        confirm("Deseja realmente excluir esta tarefa?");

    if (!confirmed) return;


    tasks = tasks.filter(
        task => task.id !== id
    );


    saveTasks();

    renderAll();

}


/* =========================
   EDITAR
========================= */

function editTask(id) {

    const task =
        tasks.find(task => task.id === id);

    if (task) {

        openModal(task);

    }

}


/* =========================
   HTML DA TAREFA
========================= */

function taskHTML(task) {

    return `

        <article class="task-item ${task.completed ? "completed-task" : ""}">

            <button
                class="task-check ${task.completed ? "completed" : ""}"
                onclick="toggleTask('${task.id}')"
                title="Concluir tarefa"
            ></button>


            <div class="task-info">

                <h3>
                    ${task.title}
                </h3>

                <p>
                    ${task.subject}
                    • ${formatDate(task.date)}
                    • ${task.time}
                </p>

            </div>


            <span class="priority ${task.priority}">
                ${priorityName(task.priority)}
            </span>


            <div class="task-actions">

                <button
                    onclick="editTask('${task.id}')"
                    title="Editar"
                >
                    ✎
                </button>

                <button
                    onclick="deleteTask('${task.id}')"
                    title="Excluir"
                >
                    ×
                </button>

            </div>

        </article>

    `;

}


function priorityName(priority) {

    const names = {

        alta: "● Alta",

        media: "● Média",

        baixa: "● Baixa"

    };

    return names[priority] || priority;

}


/* =========================
   TAREFAS DE HOJE
========================= */

function renderTodayTasks() {

    const container =
        document.getElementById("todayTasks");


    const today = getToday();


    const todayTasks =
        tasks
            .filter(task => task.date === today)
            .sort((a, b) =>
                a.time.localeCompare(b.time)
            );


    if (todayTasks.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    🎉 Nenhuma tarefa para hoje!
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        todayTasks.map(taskHTML).join("");


    const pending =
        todayTasks.filter(
            task => !task.completed
        ).length;


    document.getElementById("todayInfo").textContent =
        `${pending} pendentes • ${new Date().toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        )}`;

}


/* =========================
   TODOS OS PRAZOS
========================= */

function renderDeadlines() {

    const container =
        document.getElementById("deadlines");


    const upcoming =
        tasks
            .filter(task => !task.completed)
            .sort((a, b) => {

                const dateA =
                    new Date(`${a.date}T${a.time}`);

                const dateB =
                    new Date(`${b.date}T${b.time}`);

                return dateA - dateB;

            })
            .slice(0, 3);


    if (upcoming.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Nenhum prazo próximo.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        upcoming.map(task => {

            const days =
                daysUntil(task.date);


            let dayText;

            if (days < 0) {

                dayText = "atrasada";

            } else if (days === 0) {

                dayText = "hoje";

            } else if (days === 1) {

                dayText = "em 1 dia";

            } else {

                dayText = `em ${days} dias`;

            }


            return `

                <article class="deadline-item">

                    <div class="deadline-top">

                        <div>

                            <h3>
                                ${task.title}
                            </h3>

                            <p>
                                ${task.subject}
                            </p>

                        </div>

                        <span class="deadline-days">
                            ${dayText}
                        </span>

                    </div>


                    <p class="deadline-date">
                        Entrega: ${formatDate(task.date)}
                    </p>


                    <div class="deadline-progress">

                        <div class="deadline-progress-bar">

                            <div
                                style="width: ${
                                    task.completed ? 100 : 60
                                }%"
                            ></div>

                        </div>

                        <span>
                            ${task.completed ? 100 : 60}%
                        </span>

                    </div>

                </article>

            `;

        }).join("");

}


/* =========================
   TODOS OS TASKS
========================= */

function renderAllTasks() {

    const container =
        document.getElementById("allTasks");


    const search =
        document
            .getElementById("searchTask")
            .value
            .toLowerCase();


    const priority =
        document
            .getElementById("priorityFilter")
            .value;


    const filtered =
        tasks.filter(task => {

            const matchesSearch =
                task.title
                    .toLowerCase()
                    .includes(search) ||
                task.subject
                    .toLowerCase()
                    .includes(search);


            const matchesPriority =
                priority === "all" ||
                task.priority === priority;


            return matchesSearch &&
                matchesPriority;

        });


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <p>
                    Nenhuma tarefa encontrada.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(taskHTML).join("");

}


document
    .getElementById("searchTask")
    .addEventListener(
        "input",
        renderAllTasks
    );


document
    .getElementById("priorityFilter")
    .addEventListener(
        "change",
        renderAllTasks
    );


/* =========================
   RESUMO
========================= */

function updateSummary() {

    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const total =
        tasks.length;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    document.getElementById(
        "pendingCount"
    ).textContent = pending;


    document.getElementById(
        "completedCount"
    ).textContent = completed;


    document.getElementById(
        "progressPercent"
    ).textContent = `${percentage}%`;


    document.getElementById(
        "bigProgress"
    ).textContent = `${percentage}%`;


    document.getElementById(
        "bigProgressBar"
    ).style.width = `${percentage}%`;


    document.getElementById(
        "progressCompleted"
    ).textContent = completed;


    document.getElementById(
        "progressPending"
    ).textContent = pending;


    document.getElementById(
        "progressTotal"
    ).textContent = total;


    const next =
        tasks
            .filter(task => !task.completed)
            .sort((a, b) =>
                new Date(a.date) -
                new Date(b.date)
            )[0];


    if (next) {

        document.getElementById(
            "nextDeadline"
        ).textContent = next.title;


        document.getElementById(
            "nextDeadlineDate"
        ).textContent =
            formatDate(next.date);

    } else {

        document.getElementById(
            "nextDeadline"
        ).textContent = "—";


        document.getElementById(
            "nextDeadlineDate"
        ).textContent =
            "Nenhuma tarefa";

    }

}


/* =========================
   MATÉRIAS
========================= */

function renderSubjects() {

    const container =
        document.getElementById("subjectsGrid");


    const subjects = {};


    tasks.forEach(task => {

        if (!subjects[task.subject]) {

            subjects[task.subject] = {
                total: 0,
                completed: 0
            };

        }


        subjects[task.subject].total++;


        if (task.completed) {

            subjects[task.subject].completed++;

        }

    });


    const defaultSubjects = [
        "HTML",
        "CSS",
        "JavaScript",
        "Engenharia de Software",
        "Física",
        "Banco de Dados",
        "Python"
    ];


    defaultSubjects.forEach(subject => {

        if (!subjects[subject]) {

            subjects[subject] = {
                total: 0,
                completed: 0
            };

        }

    });


    container.innerHTML =
        Object.entries(subjects)
            .map(([name, data]) => `

                <article class="subject-card">

                    <h3>
                        ${name}
                    </h3>

                    <p>
                        ${data.total} tarefas
                        • ${data.completed} concluídas
                    </p>

                </article>

            `)
            .join("");

}


/* =========================
   CALENDÁRIO
========================= */

let currentCalendarDate = new Date();


function renderCalendar() {

    const year =
        currentCalendarDate.getFullYear();

    const month =
        currentCalendarDate.getMonth();


    const monthName =
        currentCalendarDate.toLocaleDateString(
            "pt-BR",
            {
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "calendarTitle"
    ).textContent =
        monthName.charAt(0).toUpperCase() +
        monthName.slice(1);


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const container =
        document.getElementById("calendarDays");


    container.innerHTML = "";


    for (let i = 0; i < firstDay; i++) {

        const empty =
            document.createElement("div");

        container.appendChild(empty);

    }


    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const dayElement =
            document.createElement("div");


        dayElement.className =
            "calendar-day";


        if (date === getToday()) {

            dayElement.classList.add("today");

        }


        dayElement.innerHTML =
            `<strong>${day}</strong>`;


        const dayTasks =
            tasks.filter(
                task => task.date === date
            );


        dayTasks.slice(0, 2).forEach(task => {

            const taskElement =
                document.createElement("div");

            taskElement.className =
                "calendar-task";

            taskElement.textContent =
                task.title;

            dayElement.appendChild(
                taskElement
            );

        });


        container.appendChild(
            dayElement
        );

    }

}


document
    .getElementById("previousMonth")
    .addEventListener("click", () => {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() - 1
        );

        renderCalendar();

    });


document
    .getElementById("nextMonth")
    .addEventListener("click", () => {

        currentCalendarDate.setMonth(
            currentCalendarDate.getMonth() + 1
        );

        renderCalendar();

    });


/* =========================
   METAS
========================= */

function updateGoal() {

    const totalHours =
        tasks
            .filter(task => task.completed)
            .reduce(
                (sum, task) =>
                    sum + Number(task.duration || 0),
                0
            );


    const percentage =
        Math.min(
            100,
            Math.round(
                (totalHours / settings.weeklyGoal) * 100
            )
        );


    document.getElementById(
        "goalPercent"
    ).textContent =
        `${percentage}%`;


    document.getElementById(
        "weeklyProgress"
    ).style.width =
        `${percentage}%`;


    document.getElementById(
        "progressPercent"
    ).title =
        `${totalHours}h estudadas`;

}


/* =========================
   NAVEGAÇÃO
========================= */

const navLinks =
    document.querySelectorAll(".nav-link");


const pages = {
    dashboard: "dashboardPage",
    tasks: "tasksPage",
    subjects: "subjectsPage",
    calendar: "calendarPage",
    progress: "progressPage",
    goals: "goalsPage",
    settings: "settingsPage"
};


navLinks.forEach(link => {

    link.addEventListener("click", event => {

        event.preventDefault();


        const page =
            link.dataset.page;


        navLinks.forEach(item =>
            item.classList.remove("active")
        );


        link.classList.add("active");


        document
            .querySelectorAll(".page")
            .forEach(pageElement =>
                pageElement.classList.remove(
                    "active-page"
                )
            );


        document
            .getElementById(pages[page])
            .classList.add(
                "active-page"
            );


        if (page === "calendar") {

            renderCalendar();

        }

        if (page === "tasks") {

            renderAllTasks();

        }

    });

});


/* =========================
   VER TODAS
========================= */

document
    .getElementById("seeAllTasks")
    .addEventListener("click", () => {

        document
            .querySelector('[data-page="tasks"]')
            .click();

    });


/* =========================
   CONFIGURAÇÕES
========================= */

document
    .getElementById("settingsButton")
    .addEventListener("click", () => {

        document
            .querySelector('[data-page="settings"]')
            .click();

    });


document.getElementById(
    "saveSettings"
).addEventListener("click", () => {

    settings.name =
        document.getElementById(
            "userName"
        ).value || "Liedson";


    settings.weeklyGoal =
        Number(
            document.getElementById(
                "weeklyGoalInput"
            ).value
        ) || 18;


    saveSettingsData();

    updateUserName();

    updateGoal();

    alert("Configurações salvas!");

});


function updateUserName() {

    document.querySelector(
        ".top-header h1"
    ).innerHTML =
        `Olá, ${settings.name}! 👋`;

}


document.getElementById(
    "userName"
).value = settings.name;


document.getElementById(
    "weeklyGoalInput"
).value = settings.weeklyGoal;


/* =========================
   APAGAR DADOS
========================= */

document
    .getElementById("clearData")
    .addEventListener("click", () => {

        const confirmed =
            confirm(
                "Isso vai apagar TODAS as tarefas. Deseja continuar?"
            );


        if (!confirmed) return;


        tasks = [];

        saveTasks();

        renderAll();

    });


/* =========================
   RENDERIZAÇÃO GERAL
========================= */

function renderAll() {

    renderTodayTasks();

    renderDeadlines();

    renderAllTasks();

    renderSubjects();

    updateSummary();

    updateGoal();

    renderCalendar();

    updateUserName();

}


/* =========================
   EXEMPLOS INICIAIS
========================= */

if (tasks.length === 0) {

    const today = getToday();


    tasks = [

        {
            id: "1",
            title: "Estudar HTML — Capítulo 3",
            subject: "HTML",
            date: today,
            time: "09:00",
            priority: "alta",
            duration: 2,
            completed: false
        },

        {
            id: "2",
            title: "Fazer exercícios de CSS",
            subject: "CSS",
            date: today,
            time: "11:30",
            priority: "media",
            duration: 1,
            completed: false
        },

        {
            id: "3",
            title: "Revisar Flexbox",
            subject: "CSS",
            date: today,
            time: "14:00",
            priority: "baixa",
            duration: 1,
            completed: false
        },

        {
            id: "4",
            title: "Assistir aula de JavaScript",
            subject: "JavaScript",
            date: today,
            time: "19:30",
            priority: "alta",
            duration: 2,
            completed: false
        },

        {
            id: "5",
            title: "Projeto FIAP — Fase 1",
            subject: "Engenharia de Software",
            date: "2026-09-13",
            time: "23:59",
            priority: "alta",
            duration: 4,
            completed: false
        },

        {
            id: "6",
            title: "Atividade HTML",
            subject: "HTML",
            date: "2026-09-20",
            time: "23:59",
            priority: "media",
            duration: 2,
            completed: false
        }

    ];


    saveTasks();

}


/* =========================
   INICIAR
========================= */

renderAll();