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

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

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
  const hh = format(date, "HH");
  const mm = format(date, "mm");

  const setDate = (d: Date | undefined) => {
    if (!d) return;
    const merged = new Date(d);
    merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(merged.toISOString());
  };

  const setH = (h: string) => {
    const merged = new Date(date);
    merged.setHours(parseInt(h, 10), date.getMinutes(), 0, 0);
    onChange(merged.toISOString());
  };
  const setM = (m: string) => {
    const merged = new Date(date);
    merged.setHours(date.getHours(), parseInt(m, 10), 0, 0);
    onChange(merged.toISOString());
  };

  // Snap displayed minute to closest 5-minute step for the select value.
  const mmSnapped = MINUTES.includes(mm)
    ? mm
    : MINUTES.reduce((acc, cur) =>
        Math.abs(parseInt(cur) - parseInt(mm)) < Math.abs(parseInt(acc) - parseInt(mm)) ? cur : acc,
      );

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
            onSelect={setDate}
            initialFocus
            locale={pl}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      <div className="flex h-9 shrink-0 items-center gap-0.5 rounded-md border border-border bg-surface px-2">
        <Clock className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden />
        <Select value={hh} onValueChange={setH}>
          <SelectTrigger
            aria-label="Godzina"
            className="tnum h-7 w-[44px] border-0 bg-transparent px-1 text-[13px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[240px] min-w-0">
            {HOURS.map((h) => (
              <SelectItem key={h} value={h} className="tnum">
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-ink-3" aria-hidden>:</span>
        <Select value={mmSnapped} onValueChange={setM}>
          <SelectTrigger
            aria-label="Minuty"
            className="tnum h-7 w-[44px] border-0 bg-transparent px-1 text-[13px] focus:ring-0 focus:ring-offset-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[240px] min-w-0">
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m} className="tnum">
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
