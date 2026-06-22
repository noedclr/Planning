import { defaultTasks, phases, statuses } from "./planningData.js";
import {
  calculateKpis,
  daysBetweenInclusive,
  enumerateDays,
  formatIso,
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
  search: document.querySelector("#search"),
  phaseFilter: document.querySelector("#phase-filter"),
  statusFilter: document.querySelector("#status-filter"),
  density: document.querySelector("#density"),
  statusSummary: document.querySelector("#status-summary"),
  taskTable: document.querySelector("#task-table"),
  timeline: document.querySelector("#timeline"),
  timelineScroll: document.querySelector("#timeline-scroll"),
  selectedSummary: document.querySelector("#selected-summary"),
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
  density: "compact"
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
  let syncingScroll = false;

  els.timelineScroll.addEventListener("scroll", () => {
    if (syncingScroll) {
      return;
    }

    syncingScroll = true;
    els.taskTable.scrollTop = els.timelineScroll.scrollTop;
    syncingScroll = false;
  });

  els.taskTable.addEventListener("scroll", () => {
    if (syncingScroll) {
      return;
    }

    syncingScroll = true;
    els.timelineScroll.scrollTop = els.taskTable.scrollTop;
    syncingScroll = false;
  });

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
  const markerDate = getMarkerDate(bounds, timelineTasks);

  if (!visibleTasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = visibleTasks[0]?.id ?? tasks[0]?.id ?? null;
  }

  renderStatusSummary(visibleTasks);
  renderTaskTable(grouped);
  renderTimeline(grouped, days, bounds.start, markerDate);
  renderSelectedSummary();
}

function renderStatusSummary(visibleTasks) {
  const kpis = calculateKpis(visibleTasks);

  els.statusSummary.innerHTML = `
    <strong>${kpis.total}</strong> taches
    <span></span>
    <strong>${kpis.averageProgress}%</strong> avancement moyen
    <span></span>
    <strong>${kpis.critical}</strong> critiques
    <span></span>
    <strong>${kpis.risk}</strong> a risque
  `;
}

function renderTaskTable(grouped) {
  const count = grouped.reduce((sum, group) => sum + group.tasks.length, 0);

  if (!count) {
    els.taskTable.innerHTML = `<p class="empty-state">Aucune tache ne correspond aux filtres.</p>`;
    return;
  }

  els.taskTable.innerHTML = grouped
    .map(
      (group) => `
        <section class="task-group">
          <div class="phase-row" style="--phase-color: ${group.accent}">
            <span class="subject-cell phase-subject">
              <span class="chevron">⌄</span>
              <strong>${group.name}</strong>
            </span>
            <span class="type-badge type-phase">PHASE</span>
            <span class="status-cell"><i></i>En cours</span>
            <span class="priority-cell">Normal</span>
            <span class="assignee-cell">${group.tasks.length} taches</span>
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
  const priority = getPriority(task.status);
  const isSelected = task.id === selectedTaskId ? "is-selected" : "";

  return `
    <button class="task-row ${isSelected}" data-task-id="${task.id}" type="button">
      <span class="subject-cell task-subject">
        <span class="tree-spacer"></span>
        <span class="subject-text">
          <strong>${task.name}</strong>
          <small>${task.lot}</small>
        </span>
      </span>
      <span class="type-badge type-task">TACHE</span>
      <span class="status-cell" style="--status-color: ${status.color}">
        <i></i>${status.label}
      </span>
      <span class="priority-cell priority-${priority.key}">${priority.label}</span>
      <span class="assignee-cell">
        <span class="avatar">${getInitials(task.company)}</span>
        <span>${task.company}</span>
      </span>
    </button>
  `;
}

function renderTimeline(grouped, days, timelineStart, markerDate) {
  const weekSegments = buildWeekSegments(days);
  const totalRows = Math.max(
    grouped.reduce((sum, group) => sum + group.tasks.length + 1, 0),
    1
  );

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
              <span>${day.weekday.slice(0, 2)}</span>
              <strong>${day.dayNumber}</strong>
            </div>
          `
        )
        .join("")}
    </div>
    <div class="timeline-body">
      ${renderTimelineRows(grouped, days, timelineStart)}
      ${renderTodayLine(markerDate, timelineStart)}
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
      const phaseRow = renderTimelinePhaseRow(group, rowIndex, days, timelineStart);

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

function renderTimelinePhaseRow(group, row, days, timelineStart) {
  const phaseStart = group.tasks
    .map((task) => task.start)
    .sort((a, b) => a.localeCompare(b))[0];
  const phaseEnd = group.tasks
    .map((task) => task.end)
    .sort((a, b) => b.localeCompare(a))[0];
  const position = getTaskGridPosition(
    {
      start: phaseStart,
      end: phaseEnd
    },
    timelineStart
  );

  return `
    <div class="timeline-row phase-timeline-row" style="--row: ${row}; --phase-color: ${group.accent}">
      ${renderGridSquares(days)}
      <div
        class="phase-bar"
        style="grid-column: ${position.columnStart} / span ${position.columnSpan}"
      >
        ${group.name}
      </div>
    </div>
  `;
}

function renderTimelineTaskRow(task, row, days, timelineStart) {
  const position = getTaskGridPosition(task, timelineStart);
  const status = statuses[task.status];
  const isSelected = task.id === selectedTaskId ? "is-selected" : "";

  return `
    <div class="timeline-row" style="--row: ${row}">
      ${renderGridSquares(days)}
      <button
        class="task-bar ${isSelected}"
        data-task-id="${task.id}"
        type="button"
        title="${task.name}"
        style="
          --bar-color: ${status.color};
          grid-column: ${position.columnStart} / span ${position.columnSpan};
        "
      >
        <span class="task-bar-progress" style="width: ${task.progress}%"></span>
        <span class="task-bar-label">${task.name}</span>
      </button>
    </div>
  `;
}

function renderGridSquares(days) {
  return days
    .map(
      (day) => `<span class="grid-square ${day.isWeekend ? "is-weekend" : ""}"></span>`
    )
    .join("");
}

function renderTodayLine(markerDate, timelineStart) {
  if (!markerDate) {
    return "";
  }

  const column = daysBetweenInclusive(timelineStart, markerDate);

  return `<div class="today-line" style="grid-column: ${column};"></div>`;
}

function renderSelectedSummary() {
  const task = tasks.find((item) => item.id === selectedTaskId);

  if (!task) {
    els.selectedSummary.textContent = "Selectionnez une tache pour afficher ses details.";
    return;
  }

  const phase = getPhaseById(phases, task.phaseId);
  const status = statuses[task.status];

  els.selectedSummary.innerHTML = `
    <strong>${task.lot}</strong>
    ${task.name}
    <span>${phase.name}</span>
    <span>${task.company}</span>
    <span>${formatShortDate(task.start)} - ${formatShortDate(task.end)}</span>
    <span>${status.label}</span>
    <span>${task.owner}</span>
    <span>${task.notes}</span>
  `;
}

function selectTask(taskId) {
  selectedTaskId = taskId;
  render();
}

function getMarkerDate(bounds, timelineTasks) {
  const today = formatIso(new Date());

  if (today >= bounds.start && today <= bounds.end) {
    return today;
  }

  return timelineTasks
    .map((task) => task.start)
    .sort((a, b) => a.localeCompare(b))[0];
}

function getPriority(status) {
  if (status === "critical") {
    return {
      key: "urgent",
      label: "Urgent"
    };
  }

  if (status === "risk") {
    return {
      key: "high",
      label: "Haute"
    };
  }

  return {
    key: "normal",
    label: "Normal"
  };
}

function getInitials(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
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
