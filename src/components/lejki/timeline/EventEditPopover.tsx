import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AutoTextarea } from "@/components/primitives/AutoTextarea";
import { DateTimePicker } from "@/components/primitives/DateTimePicker";
import type { EditEntry, TimelineEvent } from "@/data/types";
import { useLejkiStore } from "@/store/lejkiStore";
import { currentUser } from "@/data/fixtures";

const TOAST_DURATION_MS = 5000;

interface EventEditPopoverProps {
  event: TimelineEvent;
}

/**
 * Popover edycji pojedynczego eventu w timeline. Pozwala zmienić datę
 * + komentarz/treść. Każda zmiana zapisywana jako audit entry w `edits[]`.
 *
 * Przycisk Pencil ukryty domyślnie na desktop, widoczny on-hover/focus.
 * Na mobile zawsze widoczny (touch nie ma hovera).
 */
export function EventEditPopover({ event }: EventEditPopoverProps) {
  const updateEvent = useLejkiStore((s) => s.updateEvent);
  const replaceEvent = useLejkiStore((s) => s.replaceEvent);

  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(event.occurredAt);
  const [comment, setComment] = useState(getInitialComment(event));

  const isNote = event.payload.kind === "note";

  const save = () => {
    const newEdits = buildEditEntries(event, { when, comment });
    if (newEdits.length === 0) {
      setOpen(false);
      return;
    }

    const prev = { ...event, edits: [...event.edits], payload: { ...event.payload } };
    updateEvent(
      event.id,
      {
        occurredAt: when,
        ...(isNote ? { text: comment } : { comment }),
      },
      newEdits
    );
    setOpen(false);
    toast.success("Wpis zaktualizowany", {
      action: { label: "Cofnij", onClick: () => replaceEvent(event.id, prev) },
      duration: TOAST_DURATION_MS,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Edytuj wpis timeline"
          className="h-7 gap-1.5 self-start text-ink-3 opacity-100 transition-opacity hover:bg-surface-2 hover:text-ink-1 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="text-[12px]">Edytuj</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          Edytuj wpis
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-ink-2">Data</label>
          <DateTimePicker value={when} onChange={setWhen} />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium text-ink-2">
            {isNote ? "Treść" : "Komentarz"}
          </label>
          <AutoTextarea value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button size="sm" onClick={save}>
            Zapisz
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getInitialComment(event: TimelineEvent): string {
  switch (event.payload.kind) {
    case "status_change":
    case "score_change":
      return event.payload.comment ?? "";
    case "note":
      return event.payload.text;
    default:
      return "";
  }
}

function getOldComment(event: TimelineEvent): string {
  switch (event.payload.kind) {
    case "note":
      return event.payload.text;
    case "status_change":
    case "score_change":
      return event.payload.comment ?? "";
    default:
      return "";
  }
}

function buildEditEntries(
  event: TimelineEvent,
  { when, comment }: { when: string; comment: string }
): EditEntry[] {
  const entries: EditEntry[] = [];
  const editedAt = new Date().toISOString();

  if (when !== event.occurredAt) {
    entries.push({
      editedAt,
      editedBy: currentUser,
      field: "occurredAt",
      previousValue: event.occurredAt,
      newValue: when,
    });
  }

  const oldComment = getOldComment(event);
  if (comment !== oldComment) {
    entries.push({
      editedAt,
      editedBy: currentUser,
      field: event.payload.kind === "note" ? "text" : "comment",
      previousValue: oldComment,
      newValue: comment,
    });
  }

  return entries;
}
