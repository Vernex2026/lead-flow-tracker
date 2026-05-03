import { useEffect, useState } from "react";
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
import { useLejkiStore, deriveCurrentScore } from "@/store/lejkiStore";
import { currentUser } from "@/data/fixtures";

function useCountUp(target: number, duration = 400) {
  const [v, setV] = useState(target);
  useEffect(() => {
    const start = v;
    const diff = target - start;
    if (diff === 0) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

export function ScoringCard() {
  const events = useLejkiStore((s) => s.events);
  const addEvent = useLejkiStore((s) => s.addEvent);
  const removeEvent = useLejkiStore((s) => s.removeEvent);
  const { score, delta } = deriveCurrentScore(events);
  const animScore = useCountUp(score);

  const [editing, setEditing] = useState(false);
  const [pts, setPts] = useState(5);
  const [comment, setComment] = useState("");
  const [when, setWhen] = useState(new Date().toISOString());

  const sparkValues = (() => {
    const sorted = [...events]
      .filter((e) => e.payload.kind === "score_change")
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    return sorted.map((e) => (e.payload.kind === "score_change" ? e.payload.to : 0));
  })();

  const save = () => {
    const newScore = Math.max(0, Math.min(100, score + pts));
    const id = `e_${Date.now()}`;
    const ev = {
      id,
      type: "score_change" as const,
      occurredAt: when,
      createdAt: new Date().toISOString(),
      actor: currentUser,
      payload: { kind: "score_change" as const, delta: newScore - score, from: score, to: newScore, comment },
      edits: [],
    };
    addEvent(ev);
    setEditing(false);
    setPts(5);
    setComment("");
    toast.success(`Punktacja: ${newScore}`, {
      action: { label: "Cofnij", onClick: () => removeEvent(id) },
      duration: 5000,
    });
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Punktacja</h3>
        {!editing && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-ink-2" onClick={() => setEditing(true)}>
            <Plus className="h-3.5 w-3.5" /> Dodaj punkty
          </Button>
        )}
      </header>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="tnum text-[28px] font-semibold leading-none text-ink-1">{animScore}</span>
          <span className="tnum text-sm text-ink-3">/ 100</span>
        </div>
        <TrendPill delta={delta} />
      </div>
      <ScoreBar value={animScore} />

      <div className="mt-5 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-ink-3">Trend (historia)</span>
        <Sparkline values={sparkValues.length ? sparkValues : [0, 0]} />
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setPts(pts - 1)}>
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Input
                  type="number"
                  value={pts}
                  onChange={(e) => setPts(parseInt(e.target.value) || 0)}
                  className="tnum text-center"
                />
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setPts(pts + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <DateTimePicker value={when} onChange={setWhen} />
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Komentarz (opcjonalnie)…" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="mr-1 h-3.5 w-3.5" />Anuluj
                </Button>
                <Button size="sm" onClick={save} disabled={pts === 0}>
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
