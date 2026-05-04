import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const MINUTE_STEP = 5;
const pad = (n: number) => n.toString().padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => pad(i * MINUTE_STEP));

const snapMinute = (mm: string) => {
  const minute = parseInt(mm, 10);
  const snapped = Math.round(minute / MINUTE_STEP) * MINUTE_STEP;
  return pad(snapped % 60);
};

export function DateTimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const date = parseISO(value);

  const emit = (next: Date) => onChange(next.toISOString());

  const setDay = (day: Date | undefined) => {
    if (!day) return;
    const next = new Date(day);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    emit(next);
  };

  const setTime = (hours: number, minutes: number) => {
    const next = new Date(date);
    next.setHours(hours, minutes, 0, 0);
    emit(next);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 min-w-[140px] flex-1 justify-start gap-2 px-3 text-left text-[13px] font-normal text-ink-1"
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
            <span className="truncate">{format(date, "d MMM yyyy", { locale: pl })}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDay}
            initialFocus
            locale={pl}
            className="pointer-events-auto p-3"
          />
        </PopoverContent>
      </Popover>

      <div className="flex h-9 shrink-0 items-center gap-0.5 rounded-md border border-border bg-surface px-2">
        <Clock className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
        <Select value={pad(date.getHours())} onValueChange={(h) => setTime(parseInt(h, 10), date.getMinutes())}>
          <SelectTrigger
            aria-label="Godzina"
            className="tnum h-7 w-[44px] border-0 bg-transparent px-1 text-[13px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[240px] min-w-0">
            {HOURS.map((h) => (
              <SelectItem key={h} value={h} className="tnum">{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-ink-3" aria-hidden>:</span>
        <Select value={snapMinute(pad(date.getMinutes()))} onValueChange={(m) => setTime(date.getHours(), parseInt(m, 10))}>
          <SelectTrigger
            aria-label="Minuty"
            className="tnum h-7 w-[44px] border-0 bg-transparent px-1 text-[13px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[240px] min-w-0">
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m} className="tnum">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
