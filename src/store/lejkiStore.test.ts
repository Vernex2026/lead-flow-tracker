import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { deriveCurrentScore, deriveCurrentStatus } from "./lejkiStore";
import type { TimelineEvent, User } from "@/data/types";
import { DAY_MS } from "@/lib/time";

const user: User = { id: "u1", name: "Anna" };
const SYSTEM = { system: true } as const;

const statusEvent = (
  occurredAt: string,
  to: TimelineEvent["payload"] extends infer P
    ? P extends { kind: "status_change"; to: infer T }
      ? T
      : never
    : never,
  reason?: string,
): TimelineEvent => ({
  id: `s_${occurredAt}`,
  type: "status_change",
  occurredAt,
  createdAt: occurredAt,
  actor: user,
  payload: { kind: "status_change", from: "new", to, reason },
  edits: [],
});

const scoreEvent = (occurredAt: string, from: number, to: number): TimelineEvent => ({
  id: `sc_${occurredAt}`,
  type: "score_change",
  occurredAt,
  createdAt: occurredAt,
  actor: SYSTEM,
  payload: { kind: "score_change", from, to, delta: to - from },
  edits: [],
});

describe("deriveCurrentStatus", () => {
  it("returns the default `new` status when no status events exist", () => {
    expect(deriveCurrentStatus([])).toEqual({ code: "new" });
  });

  it("returns the most recent status by occurredAt", () => {
    const events = [
      statusEvent("2026-05-01T10:00:00", "qualified", "Demo"),
      statusEvent("2026-05-03T10:00:00", "won", "Umowa"),
      statusEvent("2026-05-02T10:00:00", "opportunity"),
    ];
    expect(deriveCurrentStatus(events)).toEqual({
      code: "won",
      reason: "Umowa",
      at: "2026-05-03T10:00:00",
      by: "Anna",
    });
  });

  it("labels the system actor as `System`", () => {
    const event: TimelineEvent = {
      ...statusEvent("2026-05-01T00:00:00", "qualified"),
      actor: SYSTEM,
    };
    expect(deriveCurrentStatus([event]).by).toBe("System");
  });

  it("ignores non-status events", () => {
    const events = [scoreEvent("2026-05-04T00:00:00", 0, 10)];
    expect(deriveCurrentStatus(events)).toEqual({ code: "new" });
  });
});

describe("deriveCurrentScore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns score 0 when no score events exist", () => {
    expect(deriveCurrentScore([])).toEqual({ score: 0, delta: 0 });
  });

  it("returns the latest score and 7-day delta", () => {
    const now = new Date("2026-05-10T12:00:00Z").getTime();
    const events = [
      scoreEvent(new Date(now - 10 * DAY_MS).toISOString(), 0, 50),
      scoreEvent(new Date(now - 3 * DAY_MS).toISOString(), 50, 60),
      scoreEvent(new Date(now - 1 * DAY_MS).toISOString(), 60, 75),
    ];
    expect(deriveCurrentScore(events)).toEqual({ score: 75, delta: 25 });
  });

  it("excludes score events older than 7 days from the delta", () => {
    const now = new Date("2026-05-10T12:00:00Z").getTime();
    const events = [
      scoreEvent(new Date(now - 30 * DAY_MS).toISOString(), 0, 80),
      scoreEvent(new Date(now - 1 * DAY_MS).toISOString(), 80, 90),
    ];
    expect(deriveCurrentScore(events)).toEqual({ score: 90, delta: 10 });
  });
});
