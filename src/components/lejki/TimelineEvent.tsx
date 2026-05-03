import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Bell, FileText, Pencil, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AutoTextarea } from "@/components/primitives/AutoTextarea";
import { cn } from "@/lib/utils";
import { fmtTime, fmtDateTime } from "@/lib/format";
import { STATUS_LABEL, type EditEntry, type TimelineEvent as TEvent } from "@/data/types";
import { DateTimePicker } from "@/components/primitives/DateTimePicker";
import { useLejkiStore } from "@/store/lejkiStore";
import { currentUser } from "@/data/fixtures";
import { toast } from "sonner";

function dotFor(e: TEvent) {
  if (e.payload.kind === "status_change") return { Icon: null, cls: "bg-info" };
  if (e.payload.kind === "score_change")
    return { Icon: e.payload.delta >= 0 ? ArrowUp : ArrowDown, cls: e.payload.delta >= 0 ? "bg-success" : "bg-warn" };
  if (e.payload.kind === "owner_change") return { Icon: UserCog, cls: "bg-ink-3" };
  if (e.payload.kind === "note") return { Icon: FileText, cls: "bg-ink-3" };
  return { Icon: Bell, cls: "bg-ink-4" };
}

function title(e: TEvent) {
  const p = e.payload;
  if (p.kind === "status_change")
    return (
      <>
        Status: <span className="text-ink-3">{STATUS_LABEL[p.from]}</span> → <span className="text-ink-1">{STATUS_LABEL[p.to]}</span>
      </>
    );
  if (p.kind === "score_change") {
    const sign = p.delta > 0 ? "+" : "";
    return (
      <>
        Punktacja <span className="tnum">{sign}{p.delta}</span>{" "}
        <span className="text-ink-3 tnum">({p.from} → {p.to})</span>
      </>
    );
  }
  if (p.kind === "owner_change") return <>Opiekun: {p.from.name} → {p.to.name}</>;
  if (p.kind === "note") return <>Notatka</>;
  return <>{p.text}</>;
}

function detail(e: TEvent) {
  const p = e.payload;
  if (p.kind === "status_change") {
    return (
      <>
        {p.reason && <div className="text-ink-2">Powód: {p.reason}</div>}
        {p.comment && <div className="text-ink-3">„{p.comment}”</div>}
      </>
    );
  }
  if (p.kind === "score_change" && p.comment) return <div className="text-ink-3">„{p.comment}”</div>;
  if (p.kind === "note") return <div className="text-ink-2">{p.text}</div>;
  return null;
}

export function TimelineEvent({ event }: { event: TEvent }) {
  const { Icon, cls } = dotFor(event);
  const editable =
    event.payload.kind === "status_change" ||
    event.payload.kind === "score_change" ||
    event.payload.kind === "note";
  const actorName = "system" in event.actor ? "System" : event.actor.name;
  const updateEvent = useLejkiStore((s) => s.updateEvent);
  const replaceEvent = useLejkiStore((s) => s.replaceEvent);

  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(event.occurredAt);
  const [comment, setComment] = useState(
    event.payload.kind === "status_change" || event.payload.kind === "score_change"
      ? event.payload.comment ?? ""
      : event.payload.kind === "note"
      ? event.payload.text
      : "",
  );

  const save = () => {
    const prev = { ...event, edits: [...event.edits], payload: { ...event.payload } };
    const newEdits: EditEntry[] = [];
    if (when !== event.occurredAt) {
      newEdits.push({
        editedAt: new Date().toISOString(),
        editedBy: currentUser,
        field: "occurredAt",
        previousValue: event.occurredAt,
        newValue: when,
      });
    }
    const oldComment =
      event.payload.kind === "note"
        ? event.payload.text
        : "comment" in event.payload
        ? event.payload.comment ?? ""
        : "";
    if (comment !== oldComment) {
      newEdits.push({
        editedAt: new Date().toISOString(),
        editedBy: currentUser,
        field: event.payload.kind === "note" ? "text" : "comment",
        previousValue: oldComment,
        newValue: comment,
      });
    }
    if (newEdits.length === 0) {
      setOpen(false);
      return;
    }
    updateEvent(
      event.id,
      {
        occurredAt: when,
        comment: event.payload.kind === "note" ? undefined : comment,
        text: event.payload.kind === "note" ? comment : undefined,
      },
      newEdits,
    );
    setOpen(false);
    toast.success("Wpis zaktualizowany", {
      action: { label: "Cofnij", onClick: () => replaceEvent(event.id, prev) },
      duration: 5000,
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
        <span className={cn("flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-surface", cls)}>
          {Icon ? <Icon className="h-2.5 w-2.5 text-white" /> : null}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink-1">{title(event)}</div>
        <div className="mt-0.5 space-y-0.5 text-[13px]">{detail(event)}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
          <span>{actorName}</span>
          <span>·</span>
          <time dateTime={event.occurredAt}>{fmtTime(event.occurredAt)}</time>
          {event.edits.length > 0 && (
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
                  {event.edits.map((ed, i) => (
                    <li key={i}>
                      <div className="text-ink-2">
                        {fmtDateTime(ed.editedAt)} · {ed.editedBy.name}
                      </div>
                      <div className="text-ink-3">
                        {ed.field === "occurredAt" ? "Data" : ed.field === "comment" ? "Komentarz" : ed.field}: zmieniono
                      </div>
                    </li>
                  ))}
                </ul>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </div>
      {editable && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 self-start opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">Edytuj wpis</div>
            <div>
              <label className="mb-1 block text-[11px] text-ink-3">Data</label>
              <DateTimePicker value={when} onChange={setWhen} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-ink-3">
                {event.payload.kind === "note" ? "Treść" : "Komentarz"}
              </label>
              <AutoTextarea value={comment} onChange={(e) => setComment(e.target.value)} />
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
