import { describe, expect, it } from "vitest";
import { filterEvents, groupByDay } from "./historyFilter";
import { EMPTY_FILTERS } from "./historyFilters.types";
import type { TimelineEvent, User } from "@/data/types";
import { DAY_MS } from "@/lib/time";

const user: User = { id: "u1", name: "Anna" };
const NOW = new Date("2026-05-10T12:00:00Z").getTime();

const status = (occurredAt: string, to: "new" | "qualified" | "won"): TimelineEvent => ({
  id: `st_${occurredAt}`,
  type: "status_change",
  occurredAt,
  createdAt: occurredAt,
  actor: user,
  payload: { kind: "status_change", from: "new", to, reason: "test" },
  edits: [],
});

const score = (occurredAt: string, delta: number): TimelineEvent => ({
  id: `sc_${occurredAt}`,
  type: "score_change",
  occurredAt,
  createdAt: occurredAt,
  actor: user,
  payload: { kind: "score_change", from: 0, to: delta, delta },
  edits: [],
});

const note = (occurredAt: string, text: string): TimelineEvent => ({
  id: `n_${occurredAt}`,
  type: "note",
  occurredAt,
  createdAt: occurredAt,
  actor: user,
  payload: { kind: "note", text },
  edits: [],
});

const eventsFixture: TimelineEvent[] = [
  status("2026-05-09T10:00:00", "qualified"),
  score("2026-05-08T10:00:00", 15),
  score("2026-05-07T10:00:00", -5),
  note("2026-05-06T10:00:00", "Pierwszy kontakt"),
  status("2026-04-01T10:00:00", "won"),
];

describe("filterEvents", () => {
  it("returns all events with default filters, sorted descending", () => {
    const result = filterEvents(eventsFixture, {
      filter: "all",
      advanced: EMPTY_FILTERS,
      query: "",
      sortDesc: true,
      now: NOW,
    });
    expect(result.map((e) => e.id)).toEqual(eventsFixture.map((e) => e.id));
  });

  it("respects the primary filter kind", () => {
    const result = filterEvents(eventsFixture, {
      filter: "score",
      advanced: EMPTY_FILTERS,
      query: "",
      sortDesc: true,
      now: NOW,
    });
    expect(result.every((e) => e.payload.kind === "score_change")).toBe(true);
  });

  it("filters score events by direction", () => {
    const result = filterEvents(eventsFixture, {
      filter: "all",
      advanced: { ...EMPTY_FILTERS, scoreDir: "down" },
      query: "",
      sortDesc: true,
      now: NOW,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sc_2026-05-07T10:00:00");
  });

  it("limits to events within the chosen period", () => {
    const result = filterEvents(eventsFixture, {
      filter: "all",
      advanced: { ...EMPTY_FILTERS, period: "7d" },
      query: "",
      sortDesc: true,
      now: NOW,
    });
    expect(result.map((e) => e.id)).not.toContain("st_2026-04-01T10:00:00");
    expect(result).toHaveLength(eventsFixture.length - 1);
  });

  it("matches the search query against payload and actor name", () => {
    const result = filterEvents(eventsFixture, {
      filter: "all",
      advanced: EMPTY_FILTERS,
      query: "pierwszy",
      sortDesc: true,
      now: NOW,
    });
    expect(result).toHaveLength(1);
    expect(result[0].payload.kind).toBe("note");
  });

  it("sorts ascending when sortDesc is false", () => {
    const result = filterEvents(eventsFixture, {
      filter: "all",
      advanced: EMPTY_FILTERS,
      query: "",
      sortDesc: false,
      now: NOW,
    });
    expect(result[0].occurredAt < result[result.length - 1].occurredAt).toBe(true);
  });
});

describe("groupByDay", () => {
  it("groups events sharing the same day key", () => {
    const events = [
      { id: "a", occurredAt: "2026-05-10T08:00:00" },
      { id: "b", occurredAt: "2026-05-10T18:00:00" },
      { id: "c", occurredAt: "2026-05-09T08:00:00" },
    ];
    const groups = groupByDay(events, (e) => e.occurredAt.slice(0, 10));
    expect(groups).toHaveLength(2);
    expect(groups[0][1].map((e) => e.id)).toEqual(["a", "b"]);
    expect(groups[1][1].map((e) => e.id)).toEqual(["c"]);
  });
});

describe("DAY_MS", () => {
  it("equals 24 hours of milliseconds", () => {
    expect(DAY_MS).toBe(86_400_000);
  });
});
