import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Bell, FileText, Pencil, UserCog, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AutoTextarea } from "@/components/primitives/AutoTextarea";
import { DateTimePicker } from "@/components/primitives/DateTimePicker";
import { cn } from "@/lib/utils";
import { fmtDateTime, fmtTime } from "@/lib/format";
import { currentUser } from "@/data/fixtures";
import { STATUS_LABEL, type EditEntry, type TimelineEvent as TEvent } from "@/data/types";
import { useLejkiStore } from "@/store/lejkiStore";

const TOAST_DURATION_MS = 5_000;

const FIELD_LABEL: Record<EditEntry["field"], string> = {
  occurredAt: "Data",
  comment: "Komentarz",
  reason: "Powód",
  text: "Treść",
};

interface DotStyle {
  Icon: LucideIcon | null;
  className: string;
}

const dotStyleFor = (event: TEvent): DotStyle => {
  switch (event.payload.kind) {
    case "status_change":
      return { Icon: null, className: "bg-info" };
    case "score_change": {
      const positive = event.payload.delta >= 0;
      return { Icon: positive ? ArrowUp : ArrowDown, className: positive ? "bg-success" : "bg-warn" };
    }
    case "owner_change":
      return { Icon: UserCog, className: "bg-ink-3" };
    case "note":
      return { Icon: FileText, className: "bg-ink-3" };
    case "system":
      return { Icon: Bell, className: "bg-ink-4" };
  }
};

const renderTitle = (event: TEvent) => {
  const { payload } = event;
  switch (payload.kind) {
    case "status_change":
      return (
        <>
          Status: <span className="text-ink-3">{STATUS_LABEL[payload.from]}</span> →{" "}
          <span className="text-ink-1">{STATUS_LABEL[payload.to]}</span>
        </>
      );
    case "score_change": {
      const sign = payload.delta > 0 ? "+" : "";
      return (
        <>
          Punktacja <span className="tnum">{sign}{payload.delta}</span>{" "}
          <span className="tnum text-ink-3">({payload.from} → {payload.to})</span>
        </>
      );
    }
    case "owner_change":
      return <>Opiekun: {payload.from.name} → {payload.to.name}</>;
    case "note":
      return <>Notatka</>;
    case "system":
      return <>{payload.text}</>;
  }
};

const renderDetail = (event: TEvent) => {
  const { payload } = event;
  if (payload.kind === "status_change") {
    return (
      <>
        {payload.reason && <div className="text-ink-2">Powód: {payload.reason}</div>}
        {payload.comment && <div className="text-ink-3">„{payload.comment}”</div>}
      </>
    );
  }
  if (payload.kind === "score_change" && payload.comment) {
    return <div className="text-ink-3">„{payload.comment}”</div>;
  }
  if (payload.kind === "note") {
    return <div className="text-ink-2">{payload.text}</div>;
  }
  return null;
};

const isEditable = (event: TEvent): boolean =>
  event.payload.kind === "status_change" ||
  event.payload.kind === "score_change" ||
  event.payload.kind === "note";

const editableTextOf = (event: TEvent): string => {
  if (event.payload.kind === "note") return event.payload.text;
  if (event.payload.kind === "status_change") return event.payload.comment ?? "";
  if (event.payload.kind === "score_change") return event.payload.comment ?? "";
  return "";
};

const actorNameOf = (event: TEvent): string =>
  "system" in event.actor ? "System" : event.actor.name;

export function TimelineEvent({ event }: { event: TEvent }) {
  const updateEvent = useLejkiStore((s) => s.updateEvent);
  const replaceEvent = useLejkiStore((s) => s.replaceEvent);

  const [open, setOpen] = useState(false);
  const [occurredAt, setOccurredAt] = useState(event.occurredAt);
  const [text, setText] = useState(() => editableTextOf(event));

  const { Icon, className: dotClassName } = dotStyleFor(event);
  const isNote = event.payload.kind === "note";
  const editable = isEditable(event);

  const save = () => {
    const newEdits: EditEntry[] = [];
    const now = new Date().toISOString();

    if (occurredAt !== event.occurredAt) {
      newEdits.push({
        editedAt: now,
        editedBy: currentUser,
        field: "occurredAt",
        previousValue: event.occurredAt,
        newValue: occurredAt,
      });
    }

    const previousText = editableTextOf(event);
    if (text !== previousText) {
      newEdits.push({
        editedAt: now,
        editedBy: currentUser,
        field: isNote ? "text" : "comment",
        previousValue: previousText,
        newValue: text,
      });
    }

    if (newEdits.length === 0) {
      setOpen(false);
      return;
    }

    const snapshot: TEvent = {
      ...event,
      edits: [...event.edits],
      payload: { ...event.payload },
    };

    updateEvent(
      event.id,
      {
        occurredAt,
        comment: isNote ? undefined : text,
        text: isNote ? text : undefined,
      },
      newEdits,
    );

    setOpen(false);
    toast.success("Wpis zaktualizowany", {
      action: { label: "Cofnij", onClick: () => replaceEvent(event.id, snapshot) },
      duration: TOAST_DURATION_MS,
    });
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="group relative -mx-2 flex gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2"
    >
      <div className="relative z-[1] flex w-4 justify-center pt-1.5">
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-surface",
            dotClassName,
          )}
        >
          {Icon && <Icon className="h-2.5 w-2.5 text-white" />}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink-1">{renderTitle(event)}</div>
        <div className="mt-0.5 space-y-0.5 text-[13px]">{renderDetail(event)}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
          <span>{actorNameOf(event)}</span>
          <span>·</span>
          <time dateTime={event.occurredAt}>{fmtTime(event.occurredAt)}</time>
          {event.edits.length > 0 && <EditedBadge edits={event.edits} />}
        </div>
      </div>

      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
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
              <DateTimePicker value={occurredAt} onChange={setOccurredAt} />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-ink-2">
                {isNote ? "Treść" : "Komentarz"}
              </label>
              <AutoTextarea value={text} onChange={(e) => setText(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Anuluj</Button>
              <Button size="sm" onClick={save}>Zapisz</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </motion.li>
  );
}

function EditedBadge({ edits }: { edits: EditEntry[] }) {
  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        <button className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-3 hover:text-ink-1">
          edytowano
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          Historia edycji
        </div>
        <ul className="space-y-2 text-xs">
          {edits.map((edit, index) => (
            <li key={index}>
              <div className="text-ink-2">
                {fmtDateTime(edit.editedAt)} · {edit.editedBy.name}
              </div>
              <div className="text-ink-3">{FIELD_LABEL[edit.field]}: zmieniono</div>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}
