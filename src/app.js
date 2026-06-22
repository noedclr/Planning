import { defaultTasks, phases, statuses } from "./planningData.js";
import {
  calculateKpis,
  enumerateDays,
  getPhaseById,
  getTaskGridPosition,
  getTimelineBounds,
  getWeekKey,
  getWeekLabel,
  groupTasksByPhase,
  normalizeTask,
  taskMatchesFilters
} from "./schedule.js";

const STORAGE_KEY = "planning-chantier-tasks";

const els = {
  body: document.body,
  kpiGrid: document.querySelector("#kpi-grid"),
  search: document.querySelector("#search"),
  phaseFilter: document.querySelector("#phase-filter"),
  statusFilter: document.querySelector("#status-filter"),
  density: document.querySelector("#density"),
  taskTable: document.querySelector("#task-table"),
  taskCount: document.querySelector("#task-count"),
  timeline: document.querySelector("#timeline"),
  detailsTitle: document.querySelector("#details-title"),
  detailsMeta: document.querySelector("#details-meta"),
  detailsGrid: document.querySelector("#details-grid"),
  taskDialog: document.querySelector("#task-dialog"),
  openTaskForm: document.querySelector("#open-task-form"),
  taskForm: document.querySelector("#task-form"),
  formPhase: document.querySelector("#form-phase"),
  formStatus: document.querySelector("#form-status"),
  formError: document.querySelector("#form-error"),
  resetDemo: document.querySelector("#reset-demo")
};

let tasks = loadTasks();
let selectedTaskId = tasks[0]?.id ?? null;

const filters = {
  search: "",
  phaseId: "all",
  status: "all",
  density: "standard"
};

init();

function init() {
  populateSelects();
  bindEvents();
  render();
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : structuredClone(defaultTasks);
  } catch {
    return structuredClone(defaultTasks);
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function populateSelects() {
  els.phaseFilter.innerHTML = [
    `<option value="all">Toutes les phases</option>`,
    ...phases.map((phase) => `<option value="${phase.id}">${phase.name}</option>`)
  ].join("");

  els.statusFilter.innerHTML = [
    `<option value="all">Tous les statuts</option>`,
    ...Object.entries(statuses).map(
      ([key, status]) => `<option value="${key}">${status.label}</option>`
    )
  ].join("");

  els.formPhase.innerHTML = phases
    .map((phase) => `<option value="${phase.id}">${phase.name}</option>`)
    .join("");

  els.formStatus.innerHTML = Object.entries(statuses)
    .map(([key, status]) => `<option value="${key}">${status.label}</option>`)
    .join("");
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    filters.search = event.target.value;
    render();
  });

  els.phaseFilter.addEventListener("change", (event) => {
    filters.phaseId = event.target.value;
    render();
  });

  els.statusFilter.addEventListener("change", (event) => {
    filters.status = event.target.value;
    render();
  });

  els.density.addEventListener("change", (event) => {
    filters.density = event.target.value;
    render();
  });

  els.openTaskForm.addEventListener("click", () => {
    els.formError.textContent = "";
    els.taskDialog.showModal();
  });

  els.taskForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;

    if (submitter === "cancel") {
      return;
    }

    event.preventDefault();
    addTask(new FormData(els.taskForm));
  });

  els.resetDemo.addEventListener("click", () => {
    tasks = structuredClone(defaultTasks);
    selectedTaskId = tasks[0]?.id ?? null;
    saveTasks();
    render();
  });
}

function addTask(formData) {
  try {
    const task = normalizeTask({
      id: `task-${Date.now()}`,
      phaseId: formData.get("phaseId"),
      status: formData.get("status"),
      lot: formData.get("lot"),
      company: formData.get("company"),
      name: formData.get("name"),
      start: formData.get("start"),
      end: formData.get("end"),
      progress: formData.get("progress"),
      owner: formData.get("owner"),
      notes: formData.get("notes")
    });

    tasks = [...tasks, task].sort((a, b) => a.start.localeCompare(b.start));
    selectedTaskId = task.id;
    saveTasks();
    els.taskDialog.close();
    els.taskForm.reset();
    render();
  } catch (error) {
    els.formError.textContent = error.message;
  }
}

function render() {
  els.body.dataset.density = filters.density;

  const visibleTasks = tasks.filter((task) => taskMatchesFilters(task, filters));
  const timelineTasks = visibleTasks.length ? visibleTasks : tasks;
  const bounds = getTimelineBounds(timelineTasks);
  const days = enumerateDays(bounds.start, bounds.end);
  const grouped = groupTasksByPhase(visibleTasks, phases);

  if (!visibleTasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = visibleTasks[0]?.id ?? tasks[0]?.id ?? null;
  }

  renderKpis(visibleTasks);
  renderTaskTable(grouped);
  renderTimeline(grouped, days, bounds.start);
  renderDetails();
}

function renderKpis(visibleTasks) {
  const kpis = calculateKpis(visibleTasks);
  const items = [
    ["Taches", kpis.total],
    ["Avancement moyen", `${kpis.averageProgress}%`],
    ["Critiques", kpis.critical],
    ["A risque", kpis.risk]
  ];

  els.kpiGrid.innerHTML = items
    .map(
      ([label, value]) => `
        <article class="kpi-card">
          <strong>${value}</strong>
          <span>${label}</span>
        </article>
      `
    )
    .join("");
}

function renderTaskTable(grouped) {
  const count = grouped.reduce((sum, group) => sum + group.tasks.length, 0);
  els.taskCount.textContent = `${count} ${count > 1 ? "taches" : "tache"}`;

  if (!count) {
    els.taskTable.innerHTML = `<p class="empty-state">Aucune tache ne correspond aux filtres.</p>`;
    return;
  }

  els.taskTable.innerHTML = grouped
    .map(
      (group) => `
        <section class="task-group">
          <div class="phase-row" style="--phase-color: ${group.accent}">
            <span>${group.name}</span>
            <strong>${group.tasks.length}</strong>
          </div>
          ${group.tasks.map(renderTaskRow).join("")}
        </section>
      `
    )
    .join("");

  els.taskTable.querySelectorAll("[data-task-id]").forEach((row) => {
    row.addEventListener("click", () => selectTask(row.dataset.taskId));
  });
}

function renderTaskRow(task) {
  const status = statuses[task.status];
  const isSelected = task.id === selectedTaskId ? "is-selected" : "";

  return `
    <button class="task-row ${isSelected}" data-task-id="${task.id}" type="button">
      <span class="lot">${task.lot}</span>
      <span class="task-name">${task.name}</span>
      <span class="company">${task.company}</span>
      <span class="dates">${formatShortDate(task.start)} - ${formatShortDate(task.end)}</span>
      <span class="status-pill" style="--status-color: ${status.color}">${status.label}</span>
    </button>
  `;
}

function renderTimeline(grouped, days, timelineStart) {
  const weekSegments = buildWeekSegments(days);
  const totalRows = grouped.reduce((sum, group) => sum + group.tasks.length + 1, 0);

  els.timeline.style.setProperty("--day-count", days.length);
  els.timeline.style.setProperty("--row-count", totalRows);

  els.timeline.innerHTML = `
    <div class="week-header">
      ${weekSegments
        .map(
          (week) => `
            <div class="week-cell" style="grid-column: span ${week.span}">
              ${getWeekLabel(week.key)}
            </div>
          `
        )
        .join("")}
    </div>
    <div class="day-header">
      ${days
        .map(
          (day) => `
            <div class="day-cell ${day.isWeekend ? "is-weekend" : ""}">
              <span>${day.weekday}</span>
              <strong>${day.dayNumber}</strong>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="timeline-body">
      ${renderTimelineRows(grouped, days, timelineStart)}
    </div>
  `;

  els.timeline.querySelectorAll("[data-task-id]").forEach((bar) => {
    bar.addEventListener("click", () => selectTask(bar.dataset.taskId));
  });
}

function renderTimelineRows(grouped, days, timelineStart) {
  let rowIndex = 1;

  return grouped
    .map((group) => {
      const phaseRow = `
        <div class="timeline-row phase-band" style="--row: ${rowIndex}; --phase-color: ${group.accent}">
          <span>${group.name}</span>
        </div>
      `;

      rowIndex += 1;

      const taskRows = group.tasks
        .map((task) => {
          const row = rowIndex;
          rowIndex += 1;
          return renderTimelineTaskRow(task, row, days, timelineStart);
        })
        .join("");

      return `${phaseRow}${taskRows}`;
    })
    .join("");
}

function renderTimelineTaskRow(task, row, days, timelineStart) {
  const position = getTaskGridPosition(task, timelineStart);
  const phase = getPhaseById(phases, task.phaseId);
  const status = statuses[task.status];
  const isSelected = task.id === selectedTaskId ? "is-selected" : "";

  return `
    <div class="timeline-row" style="--row: ${row}">
      ${days
        .map(
          (day) => `<span class="grid-square ${day.isWeekend ? "is-weekend" : ""}"></span>`
        )
        .join("")}
      <button
        class="task-bar ${isSelected}"
        data-task-id="${task.id}"
        type="button"
        title="${task.name}"
        style="
          --bar-color: ${status.color};
          --phase-color: ${phase.accent};
          grid-column: ${position.columnStart} / span ${position.columnSpan};
        "
      >
        <span class="task-bar-progress" style="width: ${task.progress}%"></span>
        <span class="task-bar-label">${task.lot}</span>
      </button>
    </div>
  `;
}

function renderDetails() {
  const task = tasks.find((item) => item.id === selectedTaskId);

  if (!task) {
    els.detailsTitle.textContent = "Selectionnez une tache";
    els.detailsMeta.textContent = "Aucune tache disponible.";
    els.detailsGrid.innerHTML = "";
    return;
  }

  const phase = getPhaseById(phases, task.phaseId);
  const status = statuses[task.status];

  els.detailsTitle.textContent = task.name;
  els.detailsMeta.textContent = `${task.lot} - ${task.company} - ${formatShortDate(
    task.start
  )} au ${formatShortDate(task.end)}`;

  els.detailsGrid.innerHTML = [
    ["Phase", phase.name],
    ["Statut", status.label],
    ["Responsable", task.owner],
    ["Avancement", `${task.progress}%`],
    ["Notes", task.notes]
  ]
    .map(
      ([label, value]) => `
        <article>
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function selectTask(taskId) {
  selectedTaskId = taskId;
  render();
}

function buildWeekSegments(days) {
  return days.reduce((segments, day) => {
    const key = getWeekKey(day.date);
    const last = segments.at(-1);

    if (last?.key === key) {
      last.span += 1;
    } else {
      segments.push({ key, span: 1 });
    }

    return segments;
  }, []);
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(new Date(`${value}T00:00:00`));
}
