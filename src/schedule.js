const DAY_MS = 24 * 60 * 60 * 1000;

export function parseDate(value) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  return date;
}

export function formatIso(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function daysBetweenInclusive(start, end) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const diff = Math.round((endDate - startDate) / DAY_MS);

  return Math.max(diff + 1, 1);
}

export function enumerateDays(start, end) {
  const startDate = parseDate(start);
  const duration = daysBetweenInclusive(start, end);

  return Array.from({ length: duration }, (_, index) => {
    const date = addDays(startDate, index);

    return {
      date: formatIso(date),
      dayNumber: date.getDate(),
      weekday: date.toLocaleDateString("fr-FR", { weekday: "short" }),
      month: date.toLocaleDateString("fr-FR", { month: "short" }),
      isWeekend: [0, 6].includes(date.getDay())
    };
  });
}

export function getWeekKey(dateValue) {
  const date = parseDate(dateValue);
  const monday = addDays(date, date.getDay() === 0 ? -6 : 1 - date.getDay());

  return formatIso(monday);
}

export function getWeekLabel(dateValue) {
  const monday = parseDate(getWeekKey(dateValue));
  const sunday = addDays(monday, 6);

  return `${monday.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short"
  })} - ${sunday.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}`;
}

export function getTimelineBounds(tasks, paddingDays = 2) {
  if (!tasks.length) {
    const today = formatIso(new Date());

    return {
      start: today,
      end: formatIso(addDays(parseDate(today), 30))
    };
  }

  const starts = tasks.map((task) => parseDate(task.start).getTime());
  const ends = tasks.map((task) => parseDate(task.end).getTime());
  const min = new Date(Math.min(...starts));
  const max = new Date(Math.max(...ends));

  return {
    start: formatIso(addDays(min, -paddingDays)),
    end: formatIso(addDays(max, paddingDays))
  };
}

export function getTaskGridPosition(task, timelineStart) {
  return {
    columnStart: daysBetweenInclusive(timelineStart, task.start),
    columnSpan: daysBetweenInclusive(task.start, task.end)
  };
}

export function getPhaseById(phases, phaseId) {
  return phases.find((phase) => phase.id === phaseId) ?? {
    id: "unknown",
    name: "Sans phase",
    accent: "#64748b"
  };
}

export function groupTasksByPhase(tasks, phases) {
  return phases
    .map((phase) => ({
      ...phase,
      tasks: tasks.filter((task) => task.phaseId === phase.id)
    }))
    .filter((phase) => phase.tasks.length > 0);
}

export function taskMatchesFilters(task, filters) {
  const search = filters.search.trim().toLowerCase();
  const values = [
    task.name,
    task.company,
    task.lot,
    task.owner,
    task.notes
  ].join(" ").toLowerCase();

  return (
    (!search || values.includes(search)) &&
    (filters.status === "all" || task.status === filters.status) &&
    (filters.phaseId === "all" || task.phaseId === filters.phaseId)
  );
}

export function calculateKpis(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "done").length;
  const critical = tasks.filter((task) => task.status === "critical").length;
  const risk = tasks.filter((task) => task.status === "risk").length;
  const averageProgress = total
    ? Math.round(
        tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0) / total
      )
    : 0;

  return {
    total,
    completed,
    critical,
    risk,
    averageProgress
  };
}

export function normalizeTask(rawTask) {
  const task = {
    ...rawTask,
    name: rawTask.name.trim(),
    lot: rawTask.lot.trim(),
    company: rawTask.company.trim(),
    owner: rawTask.owner.trim(),
    notes: rawTask.notes.trim(),
    progress: Math.min(Math.max(Number(rawTask.progress || 0), 0), 100)
  };

  if (!task.name || !task.lot || !task.company || !task.owner) {
    throw new Error("Les champs lot, tache, entreprise et responsable sont obligatoires.");
  }

  if (parseDate(task.start) > parseDate(task.end)) {
    throw new Error("La date de fin doit etre posterieure ou egale a la date de debut.");
  }

  return task;
}
