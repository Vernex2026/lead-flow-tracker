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
import { useLejkiStore, useCurrentEvents, deriveCurrentStatus } from "@/store/lejkiStore";
import { currentUser } from "@/data/fixtures";
import type { TimelineEvent } from "@/data/types";
import { STATUS_LABEL, STATUS_REASONS, type StatusCode } from "@/data/types";

const STATUS_ORDER: StatusCode[] = ["new", "qualified", "opportunity", "won", "lost"];
const TOAST_DURATION_MS = 5_000;

interface StatusChangeInput {
  from: StatusCode;
  to: StatusCode;
  reason: string;
  comment: string;
  occurredAt: string;
}

const buildStatusEvent = (input: StatusChangeInput): TimelineEvent => ({
  id: `e_${Date.now()}`,
  type: "status_change",
  occurredAt: input.occurredAt,
  createdAt: new Date().toISOString(),
  actor: currentUser,
  payload: { kind: "status_change", ...input },
  edits: [],
});

export function StatusCard({
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
  const current = deriveCurrentStatus(events);

  const [next, setNext] = useState<StatusCode>(current.code);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString());

  const stage = STATUS_ORDER.indexOf(current.code) + 1;
  const canSave = next !== current.code && reason.length > 0;

  const startEdit = () => {
    setNext(current.code);
    setReason("");
    setComment("");
    setOccurredAt(new Date().toISOString());
    onEditStart();
  };

  const save = () => {
    const event = buildStatusEvent({ from: current.code, to: next, reason, comment, occurredAt });
    addEvent(event);
    onClose();
    toast.success(`Status: ${STATUS_LABEL[next]}`, {
      action: { label: "Cofnij", onClick: () => removeEvent(event.id) },
      duration: TOAST_DURATION_MS,
    });
  };

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Status</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="-mr-1.5 h-7 gap-1 px-2 text-ink-2"
            onClick={startEdit}
          >
            <Pencil className="h-3.5 w-3.5" /> Edytuj
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {!isEditing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <StatusChip code={current.code} size="lg" />
            <dl className="mt-4 space-y-2 text-[13px]">
              {current.reason && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="shrink-0 text-ink-3">Powód</dt>
                  <dd className="min-w-0 flex-1 text-ink-1">{current.reason}</dd>
                </div>
              )}
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="shrink-0 text-ink-3">Etap</dt>
                <dd className="tnum text-ink-1">
                  {stage} <span className="text-ink-3">z {STATUS_ORDER.length}</span>
                </dd>
              </div>
              {current.at && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="shrink-0 text-ink-3">Zmieniono</dt>
                  <dd className="min-w-0 flex-1 text-ink-1">
                    <RelativeTime iso={current.at} />{" "}
                    <span className="text-ink-3">· {current.by}</span>
                  </dd>
                </div>
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
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
                Nowy status
              </label>
              <Select
                value={next}
                onValueChange={(v) => {
                  setNext(v as StatusCode);
                  setReason("");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
                Powód
              </label>
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
