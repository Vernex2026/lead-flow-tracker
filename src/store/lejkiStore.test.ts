import { describe, expect, it } from "vitest";
import { deriveCurrentScore, deriveCurrentStatus } from "./lejkiStore";
import type { StatusCode, TimelineEvent, User } from "@/data/types";

const user: User = { id: "u1", name: "Anna Kowal" };

function makeStatusEvent(
  to: StatusCode,
  occurredAt: string,
  reason = "Test",
): TimelineEvent {
  return {
    id: `s_${occurredAt}`,
    type: "status_change",
    occurredAt,
    createdAt: occurredAt,
    actor: user,
    payload: { kind: "status_change", from: "new", to, reason },
    edits: [],
  };
}

function makeScoreEvent(
  delta: number,
  to: number,
  occurredAt: string,
): TimelineEvent {
  return {
    id: `sc_${occurredAt}`,
    type: "score_change",
    occurredAt,
    createdAt: occurredAt,
    actor: user,
    payload: { kind: "score_change", delta, from: to - delta, to },
    edits: [],
  };
}

describe("deriveCurrentStatus", () => {
  it("zwraca 'new' gdy nie ma żadnego status_change", () => {
    const result = deriveCurrentStatus([]);
    expect(result.code).toBe("new");
    expect(result.reason).toBeUndefined();
    expect(result.at).toBeUndefined();
  });

  it("zwraca status z najnowszego status_change po occurredAt", () => {
    const events = [
      makeStatusEvent("qualified", "2026-05-01T10:00:00Z", "Demo"),
      makeStatusEvent("won", "2026-05-03T10:00:00Z", "Umowa"),
      makeStatusEvent("opportunity", "2026-05-02T10:00:00Z", "Oferta"),
    ];
    const result = deriveCurrentStatus(events);
    expect(result.code).toBe("won");
    expect(result.reason).toBe("Umowa");
    expect(result.by).toBe("Anna Kowal");
  });

  it("ignoruje eventy innych typów (note, score_change)", () => {
    const events: TimelineEvent[] = [
      makeStatusEvent("qualified", "2026-05-01T10:00:00Z"),
      makeScoreEvent(10, 50, "2026-05-05T10:00:00Z"),
      {
        id: "n1",
        type: "note",
        occurredAt: "2026-05-05T10:00:00Z",
        createdAt: "2026-05-05T10:00:00Z",
        actor: user,
        payload: { kind: "note", text: "Coś" },
        edits: [],
      },
    ];
    expect(deriveCurrentStatus(events).code).toBe("qualified");
  });
});

describe("deriveCurrentScore", () => {
  const dayMs = 86_400_000;
  const today = new Date().toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * dayMs).toISOString();
  const tenDaysAgo = new Date(Date.now() - 10 * dayMs).toISOString();

  it("zwraca score=0 i delta=0 dla pustej listy", () => {
    const result = deriveCurrentScore([]);
    expect(result).toEqual({ score: 0, delta: 0 });
  });

  it("zwraca score z ostatniego score_change (sortowane po occurredAt)", () => {
    const events = [
      makeScoreEvent(20, 20, tenDaysAgo),
      makeScoreEvent(15, 35, threeDaysAgo),
      makeScoreEvent(10, 45, today),
    ];
    expect(deriveCurrentScore(events).score).toBe(45);
  });

  it("delta sumuje tylko score_change z ostatnich 7 dni", () => {
    const events = [
      makeScoreEvent(20, 20, tenDaysAgo), // poza oknem
      makeScoreEvent(15, 35, threeDaysAgo), // w oknie
      makeScoreEvent(10, 45, today), // w oknie
    ];
    expect(deriveCurrentScore(events).delta).toBe(25);
  });

  it("delta = 0 gdy wszystkie score_change są starsze niż 7 dni", () => {
    const events = [makeScoreEvent(20, 20, tenDaysAgo)];
    expect(deriveCurrentScore(events).delta).toBe(0);
  });
});
