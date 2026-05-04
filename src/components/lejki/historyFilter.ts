import type { TimelineEvent } from "@/data/types";
import { DAY_MS } from "@/lib/time";
import type { AdvancedFilters, FilterKind, Period } from "./historyFilters.types";

const PERIOD_DAYS: Record<Exclude<Period, null>, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

const matchesPrimary = (event: TimelineEvent, filter: FilterKind): boolean => {
  switch (filter) {
    case "all":
      return true;
    case "status":
      return event.payload.kind === "status_change";
    case "score":
      return event.payload.kind === "score_change";
    case "note":
      return event.payload.kind === "note";
    case "system":
      return event.payload.kind === "system";
  }
};

const matchesAdvanced = (event: TimelineEvent, advanced: AdvancedFilters, now: number): boolean => {
  if (advanced.statuses.length > 0) {
    if (event.payload.kind !== "status_change") return false;
    if (!advanced.statuses.includes(event.payload.to)) return false;
  }

  if (advanced.scoreDir) {
    if (event.payload.kind !== "score_change") return false;
    const { delta } = event.payload;
    if (advanced.scoreDir === "up" && delta <= 0) return false;
    if (advanced.scoreDir === "down" && delta >= 0) return false;
    if (advanced.scoreDir === "big" && delta < 10) return false;
  }

  if (advanced.period) {
    const cutoff = now - PERIOD_DAYS[advanced.period] * DAY_MS;
    if (new Date(event.occurredAt).getTime() < cutoff) return false;
  }

  return true;
};

const matchesQuery = (event: TimelineEvent, query: string): boolean => {
  if (!query) return true;
  const haystack = (
    JSON.stringify(event.payload) +
    ("system" in event.actor ? "system" : event.actor.name)
  ).toLowerCase();
  return haystack.includes(query);
};

export interface FilterParams {
  filter: FilterKind;
  advanced: AdvancedFilters;
  query: string;
  sortDesc: boolean;
  now?: number;
}

export const filterEvents = (
  events: TimelineEvent[],
  { filter, advanced, query, sortDesc, now = Date.now() }: FilterParams,
): TimelineEvent[] => {
  const normalizedQuery = query.trim().toLowerCase();
  return events
    .filter(
      (event) =>
        matchesPrimary(event, filter) &&
        matchesAdvanced(event, advanced, now) &&
        matchesQuery(event, normalizedQuery),
    )
    .sort((a, b) =>
      sortDesc
        ? b.occurredAt.localeCompare(a.occurredAt)
        : a.occurredAt.localeCompare(b.occurredAt),
    );
};

export const groupByDay = <T extends { occurredAt: string }>(
  events: T[],
  keyOf: (event: T) => string,
): [string, T[]][] => {
  const groups = new Map<string, T[]>();
  for (const event of events) {
    const key = keyOf(event);
    const existing = groups.get(key);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(key, [event]);
    }
  }
  return [...groups.entries()];
};
