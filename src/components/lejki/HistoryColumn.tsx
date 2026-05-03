import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useLejkiStore } from "@/store/lejkiStore";
import { dayKey, dayLabel } from "@/lib/format";
import { TimelineEvent } from "./TimelineEvent";
import { HistoryFilters, type FilterKind } from "./HistoryFilters";
import { Inbox } from "lucide-react";

export function HistoryColumn() {
  const events = useLejkiStore((s) => s.events);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => {
        if (filter === "status" && e.payload.kind !== "status_change") return false;
        if (filter === "score" && e.payload.kind !== "score_change") return false;
        if (q) {
          const hay = JSON.stringify(e.payload).toLowerCase() +
            ("system" in e.actor ? "system" : e.actor.name.toLowerCase());
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }, [events, filter, query]);

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
    <div className="space-y-4">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        Historia aktywności
      </h2>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-xs">
        <HistoryFilters filter={filter} onFilter={setFilter} query={query} onQuery={setQuery} />

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
            <div className="mt-5 space-y-6">
              <AnimatePresence initial={false}>
                {groups.map(([k, items]) => (
                  <motion.div
                    key={k}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="sticky top-0 z-10 -mx-5 mb-2 bg-surface/85 px-5 py-1.5 backdrop-blur-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        {dayLabel(items[0].occurredAt)}
                      </span>
                    </div>
                    <ul className="relative space-y-0">
                      <span className="absolute bottom-2 left-[7px] top-2 w-px bg-border" aria-hidden />
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
  );
}
