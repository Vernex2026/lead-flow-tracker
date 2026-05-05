import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilteredEvents } from "./useFilteredEvents";
import { EMPTY_FILTERS } from "@/components/lejki/historyFilter.types";
import type { TimelineEvent, User } from "@/data/types";

const user: User = { id: "u1", name: "Anna" };

const baseDate = "2026-05-04T10:00:00Z";
const dayMs = 86_400_000;

function statusEvent(occurredAt: string, to: "qualified" | "won" = "qualified"): TimelineEvent {
  return {
    id: `s_${occurredAt}`,
    type: "status_change",
    occurredAt,
    createdAt: occurredAt,
    actor: user,
    payload: { kind: "status_change", from: "new", to, reason: "test" },
    edits: [],
  };
}

function scoreEvent(occurredAt: string, delta: number): TimelineEvent {
  return {
    id: `sc_${occurredAt}`,
    type: "score_change",
    occurredAt,
    createdAt: occurredAt,
    actor: user,
    payload: { kind: "score_change", delta, from: 0, to: delta },
    edits: [],
  };
}

function noteEvent(occurredAt: string, text: string): TimelineEvent {
  return {
    id: `n_${occurredAt}`,
    type: "note",
    occurredAt,
    createdAt: occurredAt,
    actor: user,
    payload: { kind: "note", text },
    edits: [],
  };
}

describe("useFilteredEvents", () => {
  const events: TimelineEvent[] = [
    statusEvent(baseDate, "qualified"),
    scoreEvent("2026-05-04T11:00:00Z", 10),
    noteEvent("2026-05-04T12:00:00Z", "Klient dzwonił po polsku"),
    statusEvent("2026-05-03T10:00:00Z", "won"),
  ];

  it("filter='all' zwraca wszystkie eventy posortowane DESC po occurredAt", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "all",
        query: "",
        sortDesc: true,
        advanced: EMPTY_FILTERS,
      })
    );
    expect(result.current.filtered).toHaveLength(4);
    expect(result.current.filtered[0].occurredAt).toBe("2026-05-04T12:00:00Z");
  });

  it("filter='status' zwraca tylko status_change", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "status",
        query: "",
        sortDesc: true,
        advanced: EMPTY_FILTERS,
      })
    );
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every((e) => e.payload.kind === "status_change")).toBe(true);
  });

  it("query filtruje po polsku case-insensitive", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "all",
        query: "POLSKU",
        sortDesc: true,
        advanced: EMPTY_FILTERS,
      })
    );
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].payload.kind).toBe("note");
  });

  it("sortDesc=false zwraca posortowane ASC", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "all",
        query: "",
        sortDesc: false,
        advanced: EMPTY_FILTERS,
      })
    );
    expect(result.current.filtered[0].occurredAt).toBe("2026-05-03T10:00:00Z");
  });

  it("advanced.statuses filtruje po konkretnym statusie", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "all",
        query: "",
        sortDesc: true,
        advanced: { ...EMPTY_FILTERS, statuses: ["won"] },
      })
    );
    expect(result.current.filtered).toHaveLength(1);
    expect(
      result.current.filtered[0].payload.kind === "status_change" &&
        result.current.filtered[0].payload.to
    ).toBe("won");
  });

  it("advanced.period='7d' filtruje stare eventy", () => {
    const oldEvent = statusEvent(new Date(Date.now() - 30 * dayMs).toISOString());
    const recentEvent = statusEvent(new Date(Date.now() - 1 * dayMs).toISOString());
    const { result } = renderHook(() =>
      useFilteredEvents([oldEvent, recentEvent], {
        filter: "all",
        query: "",
        sortDesc: true,
        advanced: { ...EMPTY_FILTERS, period: "7d" },
      })
    );
    expect(result.current.filtered).toHaveLength(1);
  });

  it("groups grupuje eventy po dniu", () => {
    const { result } = renderHook(() =>
      useFilteredEvents(events, {
        filter: "all",
        query: "",
        sortDesc: true,
        advanced: EMPTY_FILTERS,
      })
    );
    // 2 dni = 2 grupy: 2026-05-04 (3 eventy) + 2026-05-03 (1)
    expect(result.current.groups).toHaveLength(2);
    expect(result.current.groups[0][1]).toHaveLength(3);
    expect(result.current.groups[1][1]).toHaveLength(1);
  });
});
