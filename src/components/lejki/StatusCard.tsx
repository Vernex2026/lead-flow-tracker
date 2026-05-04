import { useState } from "react";
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
import { STATUS_LABEL, STATUS_REASONS, type StatusCode } from "@/data/types";
import { EditableCard } from "./EditableCard";

const STATUS_ORDER: StatusCode[] = ["new", "qualified", "opportunity", "won", "lost"];
const TOAST_DURATION_MS = 5000;

interface StatusCardProps {
  isEditing: boolean;
  onEditStart: () => void;
  onClose: () => void;
}

export function StatusCard({ isEditing, onEditStart, onClose }: StatusCardProps) {
  const events = useCurrentEvents();
  const addEvent = useLejkiStore((s) => s.addEvent);
  const removeEvent = useLejkiStore((s) => s.removeEvent);
  const cur = deriveCurrentStatus(events);

  const [next, setNext] = useState<StatusCode>(cur.code);
  const [reason, setReason] = useState<string>("");
  const [comment, setComment] = useState("");
  const [when, setWhen] = useState(new Date().toISOString());

  const open = () => {
    setNext(cur.code);
    setReason("");
    setComment("");
    setWhen(new Date().toISOString());
    onEditStart();
  };

  const canSave = next !== cur.code && reason.length > 0;
  const stage = STATUS_ORDER.indexOf(cur.code) + 1;

  const save = () => {
    const id = `e_${Date.now()}`;
    addEvent({
      id,
      type: "status_change",
      occurredAt: when,
      createdAt: new Date().toISOString(),
      actor: currentUser,
      payload: { kind: "status_change", from: cur.code, to: next, reason, comment },
      edits: [],
    });
    onClose();
    toast.success(`Status: ${STATUS_LABEL[next]}`, {
      action: { label: "Cofnij", onClick: () => removeEvent(id) },
      duration: TOAST_DURATION_MS,
    });
  };

  return (
    <EditableCard
      title="Status"
      editing={isEditing}
      onEditStart={open}
      editLabel="Edytuj"
      editIcon={Pencil}
      view={
        <>
          <StatusChip code={cur.code} size="lg" />
          <dl className="mt-4 space-y-2 text-[13px]">
            {cur.reason && (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="shrink-0 text-ink-3">Powód</dt>
                <dd className="min-w-0 flex-1 text-ink-1">{cur.reason}</dd>
              </div>
            )}
            <div className="flex flex-wrap items-baseline gap-x-2">
              <dt className="shrink-0 text-ink-3">Etap</dt>
              <dd className="tnum text-ink-1">
                {stage} <span className="text-ink-3">z {STATUS_ORDER.length}</span>
              </dd>
            </div>
            {cur.at && (
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="shrink-0 text-ink-3">Zmieniono</dt>
                <dd className="min-w-0 flex-1 text-ink-1">
                  <RelativeTime iso={cur.at} /> <span className="text-ink-3">· {cur.by}</span>
                </dd>
              </div>
            )}
          </dl>
        </>
      }
      edit={
        <div className="space-y-3">
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
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_ORDER.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
              Powód
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz powód…" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_REASONS[next].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-3">
              Data
            </label>
            <DateTimePicker value={when} onChange={setWhen} />
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
              <X className="mr-1 h-3.5 w-3.5" />
              Anuluj
            </Button>
            <Button size="sm" disabled={!canSave} onClick={save}>
              <Check className="mr-1 h-3.5 w-3.5" />
              Zapisz
            </Button>
          </div>
        </div>
      }
    />
  );
}
