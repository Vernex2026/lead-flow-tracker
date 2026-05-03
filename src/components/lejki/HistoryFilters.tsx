import { ArrowDown, ArrowUp, Calendar as CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATUS_LABEL, type StatusCode } from "@/data/types";
import {
  countActive,
  EMPTY_FILTERS,
  type AdvancedFilters,
  type FilterKind,
  type Period,
  type ScoreDirection,
} from "./historyFilters.types";

const PRIMARY_FILTERS: { key: FilterKind; label: string }[] = [
  { key: "all", label: "Wszystko" },
  { key: "status", label: "Status" },
  { key: "score", label: "Scoring" },
];

const ALL_STATUSES: StatusCode[] = ["new", "qualified", "opportunity", "won", "lost"];

const STATUS_TONE: Record<StatusCode, string> = {
  new: "bg-status-new text-status-new-fg border-status-new",
  qualified: "bg-status-qualified text-status-qualified-fg border-status-qualified",
  opportunity: "bg-status-opportunity text-status-opportunity-fg border-status-opportunity",
  won: "bg-status-won text-status-won-fg border-status-won",
  lost: "bg-status-lost text-status-lost-fg border-status-lost",
};

const PERIOD_OPTIONS: { key: Exclude<Period, null>; label: string }[] = [
  { key: "7d", label: "Ostatnie 7 dni" },
  { key: "30d", label: "Ostatnie 30 dni" },
  { key: "90d", label: "3 miesiące" },
];

const SCORE_DIR_LABEL: Record<Exclude<ScoreDirection, null>, string> = {
  up: "↑ Wzrost",
  down: "↓ Spadek",
  big: "≥ +10 pkt",
};

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: string;
}

function Chip({ active, onClick, children, tone }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? tone ?? "border-ink-1 bg-ink-1 text-white"
          : "border-border bg-surface text-ink-2 hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

interface HistoryFiltersProps {
  filter: FilterKind;
  onFilter: (filter: FilterKind) => void;
  query: string;
  onQuery: (query: string) => void;
  sortDesc: boolean;
  onToggleSort: () => void;
  advanced: AdvancedFilters;
  onAdvanced: (advanced: AdvancedFilters) => void;
  noteCount?: number;
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
}: HistoryFiltersProps) {
  const activeCount = countActive(advanced);

  const toggleStatus = (status: StatusCode) =>
    onAdvanced({
      ...advanced,
      statuses: advanced.statuses.includes(status)
        ? advanced.statuses.filter((s) => s !== status)
        : [...advanced.statuses, status],
    });

  const toggleScoreDir = (dir: Exclude<ScoreDirection, null>) =>
    onAdvanced({ ...advanced, scoreDir: advanced.scoreDir === dir ? null : dir });

  const togglePeriod = (period: Exclude<Period, null>) =>
    onAdvanced({ ...advanced, period: advanced.period === period ? null : period });

  const clearAll = () => onAdvanced(EMPTY_FILTERS);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
          {PRIMARY_FILTERS.map((option) => (
            <FilterTab
              key={option.key}
              active={filter === option.key}
              onClick={() => onFilter(option.key)}
            >
              {option.label}
            </FilterTab>
          ))}
          {noteCount > 0 && (
            <FilterTab active={filter === "note"} onClick={() => onFilter("note")}>
              Notatki <span className="tnum text-ink-4">({noteCount})</span>
            </FilterTab>
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
                activeCount > 0
                  ? "border-accent-500/40 bg-accent-50 text-accent-700"
                  : "text-ink-2",
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
            <FilterGroup label="Status leada">
              {ALL_STATUSES.map((status) => (
                <Chip
                  key={status}
                  active={advanced.statuses.includes(status)}
                  onClick={() => toggleStatus(status)}
                  tone={advanced.statuses.includes(status) ? STATUS_TONE[status] : undefined}
                >
                  {STATUS_LABEL[status]}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Zmiana punktacji">
              {(Object.keys(SCORE_DIR_LABEL) as Exclude<ScoreDirection, null>[]).map((dir) => (
                <Chip
                  key={dir}
                  active={advanced.scoreDir === dir}
                  onClick={() => toggleScoreDir(dir)}
                >
                  {SCORE_DIR_LABEL[dir]}
                </Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="Okres">
              {PERIOD_OPTIONS.map((option) => (
                <Chip
                  key={option.key}
                  active={advanced.period === option.key}
                  onClick={() => togglePeriod(option.key)}
                >
                  <CalendarIcon className="mr-1 inline h-3 w-3" />
                  {option.label}
                </Chip>
              ))}
            </FilterGroup>

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

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {advanced.statuses.map((status) => (
            <ActivePill key={status} onClear={() => toggleStatus(status)} className={STATUS_TONE[status]}>
              {STATUS_LABEL[status]}
            </ActivePill>
          ))}
          {advanced.scoreDir && (
            <ActivePill onClear={() => toggleScoreDir(advanced.scoreDir!)}>
              {SCORE_DIR_LABEL[advanced.scoreDir]}
            </ActivePill>
          )}
          {advanced.period && (
            <ActivePill onClear={() => togglePeriod(advanced.period!)}>
              {PERIOD_OPTIONS.find((p) => p.key === advanced.period)?.label}
            </ActivePill>
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

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[6px] px-2.5 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-surface-2 text-ink-1" : "text-ink-3 hover:text-ink-1",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ActivePill({
  children,
  onClear,
  className,
}: {
  children: React.ReactNode;
  onClear: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClear}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        className ?? "border-border bg-surface-2 text-ink-2",
      )}
    >
      {children}
      <X className="h-2.5 w-2.5" />
    </button>
  );
}
