import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const time = format(date, "HH:mm");

  const setDate = (d: Date | undefined) => {
    if (!d) return;
    const merged = new Date(d);
    merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(merged.toISOString());
  };

  const setTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const merged = new Date(date);
    merged.setHours(h, m, 0, 0);
    onChange(merged.toISOString());
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 flex-1 justify-start gap-2 px-3 text-left font-normal text-ink-1"
          >
            <CalendarIcon className="h-4 w-4 text-ink-3" />
            {format(date, "d MMM yyyy", { locale: pl })}
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
      <Input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="tnum h-9 w-[110px]"
      />
    </div>
  );
}
