import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Bell, FileText, UserCog, type LucideIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { fmtTime, fmtDateTime } from "@/lib/format";
import { STATUS_LABEL, type TimelineEvent as TEvent } from "@/data/types";
import { useMotionConfig } from "@/hooks/useMotionConfig";
import { EventEditPopover } from "./timeline/EventEditPopover";

interface DotConfig {
  Icon: LucideIcon | null;
  cls: string;
}

function dotFor(e: TEvent): DotConfig {
  switch (e.payload.kind) {
    case "status_change":
      return { Icon: null, cls: "bg-info" };
    case "score_change":
      return e.payload.delta >= 0
        ? { Icon: ArrowUp, cls: "bg-success" }
        : { Icon: ArrowDown, cls: "bg-warn" };
    case "owner_change":
      return { Icon: UserCog, cls: "bg-ink-3" };
    case "note":
      return { Icon: FileText, cls: "bg-ink-3" };
    case "system":
      return { Icon: Bell, cls: "bg-ink-4" };
  }
}

function renderTitle(e: TEvent): ReactNode {
  const p = e.payload;
  switch (p.kind) {
    case "status_change":
      return (
        <>
          Status: <span className="text-ink-3">{STATUS_LABEL[p.from]}</span> →{" "}
          <span className="text-ink-1">{STATUS_LABEL[p.to]}</span>
        </>
      );
    case "score_change": {
      const sign = p.delta > 0 ? "+" : "";
      return (
        <>
          Punktacja{" "}
          <span className="tnum">
            {sign}
            {p.delta}
          </span>{" "}
          <span className="tnum text-ink-3">
            ({p.from} → {p.to})
          </span>
        </>
      );
    }
    case "owner_change":
      return (
        <>
          Opiekun: {p.from.name} → {p.to.name}
        </>
      );
    case "note":
      return <>Notatka</>;
    case "system":
      return <>{p.text}</>;
  }
}

function renderDetail(e: TEvent): ReactNode {
  const p = e.payload;
  switch (p.kind) {
    case "status_change":
      return (
        <>
          {p.reason && <div className="text-ink-2">Powód: {p.reason}</div>}
          {p.comment && <div className="text-ink-3">„{p.comment}”</div>}
        </>
      );
    case "score_change":
      return p.comment ? <div className="text-ink-3">„{p.comment}”</div> : null;
    case "note":
      return <div className="text-ink-2">{p.text}</div>;
    case "owner_change":
    case "system":
      return null;
  }
}

const FIELD_LABELS: Record<string, string> = {
  occurredAt: "Data",
  comment: "Komentarz",
  reason: "Powód",
  text: "Treść",
};

function isEditable(e: TEvent): boolean {
  return (
    e.payload.kind === "status_change" ||
    e.payload.kind === "score_change" ||
    e.payload.kind === "note"
  );
}

function TimelineEventComponent({ event }: { event: TEvent }) {
  const { base } = useMotionConfig();
  const { Icon, cls } = dotFor(event);
  const actorName = "system" in event.actor ? "System" : event.actor.name;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={base}
      className="group relative -mx-2 flex gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2"
    >
      <div className="relative z-[1] flex w-4 justify-center pt-1.5">
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full ring-2 ring-surface",
            cls
          )}
        >
          {Icon && <Icon className="h-2.5 w-2.5 text-white" aria-hidden />}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-ink-1">{renderTitle(event)}</div>
        <div className="mt-0.5 space-y-0.5 text-[13px]">{renderDetail(event)}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-3">
          <span>{actorName}</span>
          <span aria-hidden>·</span>
          <time dateTime={event.occurredAt}>{fmtTime(event.occurredAt)}</time>
          {event.edits.length > 0 && <EditedBadge event={event} />}
        </div>
      </div>

      {isEditable(event) && <EventEditPopover event={event} />}
    </motion.li>
  );
}

function EditedBadge({ event }: { event: TEvent }) {
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
          {event.edits.map((ed, i) => (
            <li key={i}>
              <div className="text-ink-2">
                {fmtDateTime(ed.editedAt)} · {ed.editedBy.name}
              </div>
              <div className="text-ink-3">{FIELD_LABELS[ed.field] ?? ed.field}: zmieniono</div>
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
}

export const TimelineEvent = memo(TimelineEventComponent);
TimelineEvent.displayName = "TimelineEvent";
