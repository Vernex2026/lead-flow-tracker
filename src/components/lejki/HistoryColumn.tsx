import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useCurrentEvents } from "@/store/lejkiStore";
import { dayKey, dayLabel } from "@/lib/format";
import { TimelineEvent } from "./TimelineEvent";
import {
  HistoryFilters,
  EMPTY_FILTERS,
  type FilterKind,
  type AdvancedFilters,
} from "./HistoryFilters";
import { Inbox } from "lucide-react";

export function HistoryColumn() {
  const events = useCurrentEvents();
  const hasHistory = events.length > 0;
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(EMPTY_FILTERS);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const periodMs =
      advanced.period === "7d"
        ? 7 * 86400_000
        : advanced.period === "30d"
        ? 30 * 86400_000
        : advanced.period === "90d"
        ? 90 * 86400_000
        : null;

    return events
      .filter((e) => {
        const k = e.payload.kind;
        if (filter === "status" && k !== "status_change") return false;
        if (filter === "score" && k !== "score_change") return false;
        if (filter === "note" && k !== "note") return false;
        if (filter === "system" && k !== "system") return false;

        if (advanced.statuses.length > 0) {
          if (k !== "status_change") return false;
          if (!advanced.statuses.includes(e.payload.to)) return false;
        }
        if (advanced.scoreDir) {
          if (k !== "score_change") return false;
          const d = e.payload.delta;
          if (advanced.scoreDir === "up" && d <= 0) return false;
          if (advanced.scoreDir === "down" && d >= 0) return false;
          if (advanced.scoreDir === "big" && d < 10) return false;
        }
        if (periodMs !== null) {
          if (now - new Date(e.occurredAt).getTime() > periodMs) return false;
        }
        if (q) {
          const hay =
            JSON.stringify(e.payload).toLowerCase() +
            ("system" in e.actor ? "system" : e.actor.name.toLowerCase());
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sortDesc
          ? b.occurredAt.localeCompare(a.occurredAt)
          : a.occurredAt.localeCompare(b.occurredAt),
      );
  }, [events, filter, query, sortDesc, advanced]);

  const groups = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const k = dayKey(e.occurredAt);
      if (!m.has(k)) m.set(k, [] as any);
      m.get(k)!.push(e);
    }
    return Array.from(m.entries());
  }, [filtered]);

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        Historia aktywności
      </h2>
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface shadow-xs">
        <div className="shrink-0 border-b border-border p-4">
          <HistoryFilters
            filter={filter}
            onFilter={setFilter}
            query={query}
            onQuery={setQuery}
            sortDesc={sortDesc}
            onToggleSort={() => setSortDesc((s) => !s)}
            advanced={advanced}
            onAdvanced={setAdvanced}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Inbox className="h-8 w-8 text-ink-4" />
              <div className="text-sm font-medium text-ink-2">Brak wyników</div>
              <p className="max-w-xs text-xs text-ink-3">
                Spróbuj zmienić filtr lub wyczyścić wyszukiwanie.
              </p>
            </div>
          ) : (
            <LayoutGroup>
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {groups.map(([k, items]) => (
                    <motion.div
                      key={k}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="sticky top-0 z-10 -mx-5 mb-2 border-b border-border bg-surface/90 px-5 py-1.5 backdrop-blur">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                          {dayLabel(items[0].occurredAt)}
                        </span>
                      </div>
                      <ul className="relative space-y-0">
                        <span
                          className="absolute bottom-2 left-[7px] top-2 w-px bg-border"
                          aria-hidden
                        />
                        <AnimatePresence initial={false}>
                          {items.map((e) => (
                            <TimelineEvent key={e.id} event={e} />
                          ))}
                        </AnimatePresence>
                      </ul>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          )}
        </div>
      </div>
    </div>
  );
}
