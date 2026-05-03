import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/primitives/ScoreBar";
import { TrendPill } from "@/components/primitives/TrendPill";
import { Sparkline } from "@/components/primitives/Sparkline";
import { DateTimePicker } from "@/components/primitives/DateTimePicker";
import { NumberStepper } from "@/components/primitives/NumberStepper";
import { AutoTextarea } from "@/components/primitives/AutoTextarea";
import { useLejkiStore, useCurrentEvents, deriveCurrentScore } from "@/store/lejkiStore";
import { useCountUp } from "@/hooks/use-count-up";
import { currentUser } from "@/data/fixtures";
import type { TimelineEvent } from "@/data/types";

const MIN_SCORE = 0;
const MAX_SCORE = 100;
const DEFAULT_POINTS = 5;
const TOAST_DURATION_MS = 5_000;

const clampScore = (score: number) => Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));

const sparklineFromEvents = (events: TimelineEvent[]): number[] =>
  events
    .filter((e) => e.payload.kind === "score_change")
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map((e) => (e.payload.kind === "score_change" ? e.payload.to : 0));

const buildScoreEvent = (
  from: number,
  to: number,
  comment: string,
  occurredAt: string,
): TimelineEvent => ({
  id: `e_${Date.now()}`,
  type: "score_change",
  occurredAt,
  createdAt: new Date().toISOString(),
  actor: currentUser,
  payload: { kind: "score_change", delta: to - from, from, to, comment },
  edits: [],
});

export function ScoringCard({
  isEditing,
  onEditStart,
  onClose,
}: {
  isEditing: boolean;
  onEditStart: () => void;
  onClose: () => void;
}) {
  const events = useCurrentEvents();
  const addEvent = useLejkiStore((s) => s.addEvent);
  const removeEvent = useLejkiStore((s) => s.removeEvent);
  const { score, delta } = deriveCurrentScore(events);
  const animatedScore = useCountUp(score);
  const sparkValues = useMemo(() => sparklineFromEvents(events), [events]);

  const [points, setPoints] = useState(DEFAULT_POINTS);
  const [comment, setComment] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString());

  const projectedScore = clampScore(score + points);
  const canSave = points !== 0;

  const save = () => {
    const event = buildScoreEvent(score, projectedScore, comment, occurredAt);
    addEvent(event);
    onClose();
    setPoints(DEFAULT_POINTS);
    setComment("");
    toast.success(`Punktacja: ${projectedScore}`, {
      action: { label: "Cofnij", onClick: () => removeEvent(event.id) },
      duration: TOAST_DURATION_MS,
    });
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
          Punktacja
        </h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="-mr-1.5 h-7 gap-1 px-2 text-ink-2"
            onClick={onEditStart}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Dodaj punkty</span>
            <span className="sm:hidden">Dodaj</span>
          </Button>
        )}
      </header>

      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className="tnum text-[28px] font-semibold leading-none text-ink-1">
          {animatedScore}
        </span>
        <span className="tnum text-sm text-ink-3">/ {MAX_SCORE}</span>
        <TrendPill delta={delta} suffix="vs. 7 dni" />
      </div>

      <ScoreBar value={animatedScore} />

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-ink-3">Trend</span>
        <Sparkline values={sparkValues.length > 0 ? sparkValues : [0, 0]} />
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
                  Punkty do dodania
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <NumberStepper value={points} onChange={setPoints} />
                  <span className="text-[12px] text-ink-3">
                    →{" "}
                    <span className="tnum font-medium text-ink-1">{projectedScore}</span>
                    <span className="text-ink-3"> / {MAX_SCORE}</span>
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
                  Data
                </label>
                <DateTimePicker value={occurredAt} onChange={setOccurredAt} />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
                  Komentarz
                </label>
                <AutoTextarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Opcjonalnie…"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="mr-1 h-3.5 w-3.5" />Anuluj
                </Button>
                <Button size="sm" onClick={save} disabled={!canSave}>
                  <Check className="mr-1 h-3.5 w-3.5" />Zapisz
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
