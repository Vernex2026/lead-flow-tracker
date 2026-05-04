import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentEvents } from "@/store/lejkiStore";
import { dayLabel } from "@/lib/format";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { TimelineEvent } from "./TimelineEvent";
import {
  HistoryFilters,
  EMPTY_FILTERS,
  type FilterKind,
  type AdvancedFilters,
} from "./HistoryFilters";

export function HistoryColumn({
  onSetStatus,
  onAddScore,
}: {
  onSetStatus?: () => void;
  onAddScore?: () => void;
}) {
  const events = useCurrentEvents();
  const hasHistory = events.length > 0;
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(EMPTY_FILTERS);

  const noteCount = useMemo(() => events.filter((e) => e.payload.kind === "note").length, [events]);

  const { filtered, groups } = useFilteredEvents(events, {
    filter,
    query,
    sortDesc,
    advanced,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-4">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        Historia aktywności
      </h2>
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface shadow-xs">
        {hasHistory && (
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
              noteCount={noteCount}
            />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
          {!hasHistory ? (
            <EmptyHistory onSetStatus={onSetStatus} onAddScore={onAddScore} />
          ) : filtered.length === 0 ? (
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

function EmptyHistory({
  onSetStatus,
  onAddScore,
}: {
  onSetStatus?: () => void;
  onAddScore?: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 py-12 text-center">
      <svg
        width="180"
        height="80"
        viewBox="0 0 180 80"
        fill="none"
        aria-hidden
        className="text-ink-4"
      >
        <line
          x1="20"
          y1="40"
          x2="160"
          y2="40"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <circle
          cx="40"
          cy="40"
          r="4"
          stroke="currentColor"
          strokeWidth="1"
          fill="hsl(var(--surface))"
        />
        <circle
          cx="90"
          cy="40"
          r="4"
          stroke="currentColor"
          strokeWidth="1"
          fill="hsl(var(--surface))"
        />
        <circle
          cx="140"
          cy="40"
          r="4"
          stroke="currentColor"
          strokeWidth="1"
          fill="hsl(var(--surface))"
        />
      </svg>
      <p className="text-[14px] text-ink-2">Ten lead nie ma jeszcze historii aktywności.</p>
      <p className="max-w-[280px] text-[13px] text-ink-3">
        Zacznij od ustawienia statusu lub dodania punktacji, aby śledzić postęp tego kontaktu.
      </p>
      <div className="mt-1 flex gap-2">
        <Button variant="outline" size="sm" onClick={onSetStatus}>
          + Ustaw status
        </Button>
        <Button variant="outline" size="sm" onClick={onAddScore}>
          + Dodaj punkty
        </Button>
      </div>
    </div>
  );
}
