import { useMemo } from "react";
import { dayKey } from "@/lib/format";
import type { TimelineEvent } from "@/data/types";
import type { AdvancedFilters, FilterKind } from "@/components/lejki/historyFilter.types";

const DAY_MS = 86_400_000;

const PERIOD_TO_MS: Record<NonNullable<AdvancedFilters["period"]>, number> = {
  "7d": 7 * DAY_MS,
  "30d": 30 * DAY_MS,
  "90d": 90 * DAY_MS,
};

interface FilterParams {
  filter: FilterKind;
  query: string;
  sortDesc: boolean;
  advanced: AdvancedFilters;
}

interface FilteredResult {
  filtered: TimelineEvent[];
  groups: Array<[string, TimelineEvent[]]>;
}

/**
 * Filtruje i grupuje eventy timeline według kombinacji filtrów + query +
 * okresu + kierunku scoringu. Pure function w środku useMemo —
 * recompute tylko gdy któryś z deps się zmieni.
 */
export function useFilteredEvents(
  events: TimelineEvent[],
  { filter, query, sortDesc, advanced }: FilterParams
): FilteredResult {
  const filtered = useMemo<TimelineEvent[]>(() => {
    const q = query.trim().toLowerCase();
    const periodMs = advanced.period ? PERIOD_TO_MS[advanced.period] : null;
    const now = Date.now();

    return events
      .filter((e) => matchesEvent(e, { filter, advanced, q, periodMs, now }))
      .sort((a, b) =>
        sortDesc
          ? b.occurredAt.localeCompare(a.occurredAt)
          : a.occurredAt.localeCompare(b.occurredAt)
      );
  }, [events, filter, query, sortDesc, advanced]);

  const groups = useMemo<Array<[string, TimelineEvent[]]>>(() => {
    const m = new Map<string, TimelineEvent[]>();
    for (const e of filtered) {
      const k = dayKey(e.occurredAt);
      const bucket = m.get(k);
      if (bucket) {
        bucket.push(e);
      } else {
        m.set(k, [e]);
      }
    }
    return Array.from(m.entries());
  }, [filtered]);

  return { filtered, groups };
}

function matchesEvent(
  e: TimelineEvent,
  ctx: {
    filter: FilterKind;
    advanced: AdvancedFilters;
    q: string;
    periodMs: number | null;
    now: number;
  }
): boolean {
  const { filter, advanced, q, periodMs, now } = ctx;
  const k = e.payload.kind;

  if (filter === "status" && k !== "status_change") return false;
  if (filter === "score" && k !== "score_change") return false;
  if (filter === "note" && k !== "note") return false;
  if (filter === "system" && k !== "system") return false;

  if (advanced.statuses.length > 0) {
    if (e.payload.kind !== "status_change") return false;
    if (!advanced.statuses.includes(e.payload.to)) return false;
  }

  if (advanced.scoreDir) {
    if (e.payload.kind !== "score_change") return false;
    const d = e.payload.delta;
    if (advanced.scoreDir === "up" && d <= 0) return false;
    if (advanced.scoreDir === "down" && d >= 0) return false;
    if (advanced.scoreDir === "big" && d < 10) return false;
  }

  if (periodMs !== null && now - new Date(e.occurredAt).getTime() > periodMs) {
    return false;
  }

  if (q) {
    const actorPart = "system" in e.actor ? "system" : e.actor.name.toLowerCase();
    const hay = JSON.stringify(e.payload).toLowerCase() + actorPart;
    if (!hay.includes(q)) return false;
  }

  return true;
}
