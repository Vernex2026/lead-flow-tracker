import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type FilterKind = "all" | "status" | "score";

const FILTERS: { key: FilterKind; label: string }[] = [
  { key: "all", label: "Wszystko" },
  { key: "status", label: "Status" },
  { key: "score", label: "Scoring" },
];

export function HistoryFilters({
  filter,
  onFilter,
  query,
  onQuery,
}: {
  filter: FilterKind;
  onFilter: (f: FilterKind) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilter(f.key)}
            className={cn(
              "rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors",
              filter === f.key ? "bg-surface-2 text-ink-1" : "text-ink-3 hover:text-ink-1",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="relative ml-auto w-full max-w-[240px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-4" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Szukaj…"
          className="h-9 pl-8 text-sm"
        />
      </div>
    </div>
  );
}
