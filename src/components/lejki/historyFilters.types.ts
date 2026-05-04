import type { StatusCode } from "@/data/types";

export type FilterKind = "all" | "status" | "score" | "note" | "system";
export type ScoreDirection = "up" | "down" | "big" | null;
export type Period = "7d" | "30d" | "90d" | null;

export interface AdvancedFilters {
  statuses: StatusCode[];
  scoreDir: ScoreDirection;
  period: Period;
}

export const EMPTY_FILTERS: AdvancedFilters = {
  statuses: [],
  scoreDir: null,
  period: null,
};

export const countActive = (filters: AdvancedFilters): number =>
  filters.statuses.length + (filters.scoreDir ? 1 : 0) + (filters.period ? 1 : 0);
