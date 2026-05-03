import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AutoTextarea } from "@/components/primitives/AutoTextarea";
import { StatusChip } from "@/components/primitives/StatusChip";
import { DateTimePicker } from "@/components/primitives/DateTimePicker";
import { RelativeTime } from "@/components/primitives/RelativeTime";
import { useLejkiStore, deriveCurrentStatus } from "@/store/lejkiStore";
import { currentUser } from "@/data/fixtures";
import { STATUS_LABEL, STATUS_REASONS, type StatusCode } from "@/data/types";

const STATUS_ORDER: StatusCode[] = ["new", "qualified", "opportunity", "won", "lost"];

export function StatusCard() {
  const events = useLejkiStore((s) => s.events);
  const addEvent = useLejkiStore((s) => s.addEvent);
  const removeEvent = useLejkiStore((s) => s.removeEvent);
  const cur = deriveCurrentStatus(events);
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState<StatusCode>(cur.code);
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [when, setWhen] = useState(new Date().toISOString());

  const open = () => {
    setNext(cur.code);
    setReason("");
    setComment("");
    setWhen(new Date().toISOString());
    setEditing(true);
  };

  const canSave = next !== cur.code && reason.length > 0;
  const stage = STATUS_ORDER.indexOf(cur.code) + 1;

  const save = () => {
    const id = `e_${Date.now()}`;
    const ev = {
      id,
      type: "status_change" as const,
      occurredAt: when,
      createdAt: new Date().toISOString(),
      actor: currentUser,
      payload: { kind: "status_change" as const, from: cur.code, to: next, reason, comment },
      edits: [],
    };
    addEvent(ev);
    setEditing(false);
    toast.success(`Status: ${STATUS_LABEL[next]}`, {
      action: { label: "Cofnij", onClick: () => removeEvent(id) },
      duration: 5000,
    });
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Status</h3>
        {!editing && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-ink-2" onClick={open}>
            <Pencil className="h-3.5 w-3.5" /> Edytuj
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <StatusChip code={cur.code} size="lg" />
            <dl className="mt-5 grid grid-cols-[88px_1fr] gap-y-2.5 text-sm">
              {cur.reason && (
                <>
                  <dt className="text-ink-3">Powód</dt>
                  <dd className="text-ink-1">{cur.reason}</dd>
                </>
              )}
              <dt className="text-ink-3">Etap</dt>
              <dd className="tnum text-ink-1">
                {stage} z {STATUS_ORDER.length}
              </dd>
              {cur.at && (
                <>
                  <dt className="text-ink-3">Zmieniono</dt>
                  <dd className="text-ink-1">
                    <RelativeTime iso={cur.at} /> · <span className="text-ink-3">{cur.by}</span>
                  </dd>
                </>
              )}
            </dl>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">
                Nowy status
              </label>
              <Select value={next} onValueChange={(v) => { setNext(v as StatusCode); setReason(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Powód</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue placeholder="Wybierz powód…" /></SelectTrigger>
                <SelectContent>
                  {STATUS_REASONS[next].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Data</label>
              <DateTimePicker value={when} onChange={setWhen} />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Komentarz</label>
              <AutoTextarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Opcjonalnie…" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="mr-1 h-3.5 w-3.5" />Anuluj
              </Button>
              <Button size="sm" disabled={!canSave} onClick={save}>
                <Check className="mr-1 h-3.5 w-3.5" />Zapisz
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
