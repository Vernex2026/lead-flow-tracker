import { useMemo } from "react";
import {
  Search,
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  X,
  Calendar as CalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATUS_LABEL, type StatusCode } from "@/data/types";

export type FilterKind = "all" | "status" | "score" | "note" | "system";
export type ScoreDir = "up" | "down" | "big" | null;
export type Period = "7d" | "30d" | "90d" | null;

export interface AdvancedFilters {
  statuses: StatusCode[];
  scoreDir: ScoreDir;
  period: Period;
}

export const EMPTY_FILTERS: AdvancedFilters = {
  statuses: [],
  scoreDir: null,
  period: null,
};

const PRIMARY: { key: FilterKind; label: string }[] = [
  { key: "all", label: "Wszystko" },
  { key: "status", label: "Status" },
  { key: "score", label: "Scoring" },
];

const STATUS_ALL: StatusCode[] = ["new", "qualified", "opportunity", "won", "lost"];
const STATUS_TONE: Record<StatusCode, string> = {
  new: "bg-status-new text-status-new-fg border-status-new",
  qualified: "bg-status-qualified text-status-qualified-fg border-status-qualified",
  opportunity: "bg-status-opportunity text-status-opportunity-fg border-status-opportunity",
  won: "bg-status-won text-status-won-fg border-status-won",
  lost: "bg-status-lost text-status-lost-fg border-status-lost",
};

const PERIODS: { key: Period; label: string }[] = [
  { key: "7d", label: "Ostatnie 7 dni" },
  { key: "30d", label: "Ostatnie 30 dni" },
  { key: "90d", label: "3 miesiące" },
];

function Chip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? (tone ?? "border-ink-1 bg-ink-1 text-white")
          : "border-border bg-surface text-ink-2 hover:bg-surface-2"
      )}
    >
      {children}
    </button>
  );
}

export function HistoryFilters({
  filter,
  onFilter,
  query,
  onQuery,
  sortDesc,
  onToggleSort,
  advanced,
  onAdvanced,
  noteCount = 0,
}: {
  filter: FilterKind;
  onFilter: (f: FilterKind) => void;
  query: string;
  onQuery: (q: string) => void;
  sortDesc: boolean;
  onToggleSort: () => void;
  advanced: AdvancedFilters;
  onAdvanced: (a: AdvancedFilters) => void;
  noteCount?: number;
}) {
  const activeCount = useMemo(() => {
    let c = 0;
    c += advanced.statuses.length;
    if (advanced.scoreDir) c += 1;
    if (advanced.period) c += 1;
    return c;
  }, [advanced]);

  const toggleStatus = (s: StatusCode) => {
    onAdvanced({
      ...advanced,
      statuses: advanced.statuses.includes(s)
        ? advanced.statuses.filter((x) => x !== s)
        : [...advanced.statuses, s],
    });
  };

  const setScoreDir = (d: ScoreDir) =>
    onAdvanced({ ...advanced, scoreDir: advanced.scoreDir === d ? null : d });

  const setPeriod = (p: Period) =>
    onAdvanced({ ...advanced, period: advanced.period === p ? null : p });

  const clearAll = () => onAdvanced(EMPTY_FILTERS);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
          {PRIMARY.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilter(f.key)}
              className={cn(
                "rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === f.key ? "bg-surface-2 text-ink-1" : "text-ink-3 hover:text-ink-1"
              )}
            >
              {f.label}
            </button>
          ))}
          {noteCount > 0 && (
            <button
              onClick={() => onFilter("note")}
              className={cn(
                "rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                filter === "note" ? "bg-surface-2 text-ink-1" : "text-ink-3 hover:text-ink-1"
              )}
            >
              Notatki <span className="tnum text-ink-4">({noteCount})</span>
            </button>
          )}
        </div>

        <div className="relative ml-1 min-w-[160px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-4" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Szukaj w historii…"
            className="h-9 pl-8 text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSort}
          className="h-9 gap-1.5 text-ink-2"
          title={sortDesc ? "Najnowsze pierwsze" : "Najstarsze pierwsze"}
        >
          {sortDesc ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
          Data
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-9 gap-1.5",
                activeCount > 0 ? "border-accent-500/40 bg-accent-50 text-accent-700" : "text-ink-2"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtry
              {activeCount > 0 && (
                <span className="tnum ml-0.5 rounded-full bg-accent-600 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[340px] space-y-4 p-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Status leada
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_ALL.map((s) => (
                  <Chip
                    key={s}
                    active={advanced.statuses.includes(s)}
                    onClick={() => toggleStatus(s)}
                    tone={advanced.statuses.includes(s) ? STATUS_TONE[s] : undefined}
                  >
                    {STATUS_LABEL[s]}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Zmiana punktacji
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={advanced.scoreDir === "up"} onClick={() => setScoreDir("up")}>
                  ↑ Wzrost
                </Chip>
                <Chip active={advanced.scoreDir === "down"} onClick={() => setScoreDir("down")}>
                  ↓ Spadek
                </Chip>
                <Chip active={advanced.scoreDir === "big"} onClick={() => setScoreDir("big")}>
                  ≥ +10 punktów
                </Chip>
              </div>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                Okres
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PERIODS.map((p) => (
                  <Chip
                    key={p.key}
                    active={advanced.period === p.key}
                    onClick={() => setPeriod(p.key)}
                  >
                    <CalIcon className="mr-1 inline h-3 w-3" />
                    {p.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                disabled={activeCount === 0}
                className="text-ink-3"
              >
                Wyczyść
              </Button>
              <span className="text-[11px] text-ink-3">
                {activeCount > 0 ? `${activeCount} aktywne` : "Brak filtrów"}
              </span>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(advanced.statuses.length > 0 || advanced.scoreDir || advanced.period) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {advanced.statuses.map((s) => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                STATUS_TONE[s]
              )}
            >
              {STATUS_LABEL[s]}
              <X className="h-2.5 w-2.5" />
            </button>
          ))}
          {advanced.scoreDir && (
            <button
              onClick={() => setScoreDir(advanced.scoreDir)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2"
            >
              {advanced.scoreDir === "up"
                ? "↑ Wzrost"
                : advanced.scoreDir === "down"
                  ? "↓ Spadek"
                  : "≥ +10 pkt"}
              <X className="h-2.5 w-2.5" />
            </button>
          )}
          {advanced.period && (
            <button
              onClick={() => setPeriod(advanced.period)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-2"
            >
              {PERIODS.find((p) => p.key === advanced.period)?.label}
              <X className="h-2.5 w-2.5" />
            </button>
          )}
          <button
            onClick={clearAll}
            className="ml-1 text-[11px] font-medium text-ink-3 hover:text-ink-1"
          >
            Wyczyść wszystkie
          </button>
        </div>
      )}
    </div>
  );
}
