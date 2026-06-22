import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateKpis,
  daysBetweenInclusive,
  enumerateDays,
  getTaskGridPosition,
  getTimelineBounds,
  normalizeTask,
  taskMatchesFilters
} from "../src/schedule.js";

describe("schedule utilities", () => {
  it("counts inclusive task durations", () => {
    assert.equal(daysBetweenInclusive("2026-06-22", "2026-06-22"), 1);
    assert.equal(daysBetweenInclusive("2026-06-22", "2026-06-26"), 5);
  });

  it("enumerates days and marks weekends", () => {
    const days = enumerateDays("2026-06-26", "2026-06-28");

    assert.deepEqual(
      days.map((day) => day.date),
      ["2026-06-26", "2026-06-27", "2026-06-28"]
    );
    assert.equal(days[0].isWeekend, false);
    assert.equal(days[1].isWeekend, true);
    assert.equal(days[2].isWeekend, true);
  });

  it("computes timeline bounds with padding", () => {
    const bounds = getTimelineBounds(
      [
        { start: "2026-07-10", end: "2026-07-12" },
        { start: "2026-07-01", end: "2026-07-03" }
      ],
      1
    );

    assert.deepEqual(bounds, {
      start: "2026-06-30",
      end: "2026-07-13"
    });
  });

  it("computes task grid positions from the timeline start", () => {
    assert.deepEqual(
      getTaskGridPosition(
        { start: "2026-07-03", end: "2026-07-05" },
        "2026-07-01"
      ),
      {
        columnStart: 3,
        columnSpan: 3
      }
    );
  });

  it("calculates project indicators", () => {
    const kpis = calculateKpis([
      { status: "done", progress: 100 },
      { status: "critical", progress: 20 },
      { status: "risk", progress: 40 }
    ]);

    assert.deepEqual(kpis, {
      total: 3,
      completed: 1,
      critical: 1,
      risk: 1,
      averageProgress: 53
    });
  });

  it("filters tasks by search, phase and status", () => {
    const task = {
      name: "Fondations",
      company: "Batim GC",
      lot: "LOT 02",
      owner: "Equipe GO",
      notes: "Coulage beton",
      status: "progress",
      phaseId: "gros-oeuvre"
    };

    assert.equal(
      taskMatchesFilters(task, {
        search: "beton",
        status: "progress",
        phaseId: "gros-oeuvre"
      }),
      true
    );
    assert.equal(
      taskMatchesFilters(task, {
        search: "charpente",
        status: "progress",
        phaseId: "gros-oeuvre"
      }),
      false
    );
  });

  it("normalizes and validates submitted tasks", () => {
    assert.deepEqual(
      normalizeTask({
        name: "  Pose portes  ",
        lot: " LOT 05 ",
        company: " Menuiserie ",
        owner: " Chef chantier ",
        notes: "  RAS ",
        start: "2026-09-01",
        end: "2026-09-03",
        progress: "120"
      }),
      {
        name: "Pose portes",
        lot: "LOT 05",
        company: "Menuiserie",
        owner: "Chef chantier",
        notes: "RAS",
        start: "2026-09-01",
        end: "2026-09-03",
        progress: 100
      }
    );

    assert.throws(() =>
      normalizeTask({
        name: "Erreur",
        lot: "LOT 01",
        company: "Entreprise",
        owner: "Chef chantier",
        notes: "",
        start: "2026-09-05",
        end: "2026-09-01",
        progress: 0
      })
    );
  });
});
