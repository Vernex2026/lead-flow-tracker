import type { StatusCode } from "@/data/types";

export type FilterKind = "all" | "status" | "score" | "note" | "system";
export type ScoreDir = "up" | "down" | "big" | null;
export type Period = "7d" | "30d" | "90d" | null;

export interface AdvancedFilters {
  statuses: StatusCode[];
  scoreDir: ScoreDir;
  period: Period;
}

/**
 * Domyślny pusty stan filtrów — używaj `EMPTY_FILTERS` zamiast literału,
 * żeby reset/clear nie rozjechał się przy dodaniu nowego pola.
 */
export const EMPTY_FILTERS: AdvancedFilters = {
  statuses: [],
  scoreDir: null,
  period: null,
};
