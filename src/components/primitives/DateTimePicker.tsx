import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";

export function DateTimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  className?: string;
}) {
  const local = format(parseISO(value), "yyyy-MM-dd'T'HH:mm");
  return (
    <Input
      type="datetime-local"
      value={local}
      onChange={(e) => {
        const v = e.target.value;
        if (v) onChange(new Date(v).toISOString());
      }}
      className={className}
    />
  );
}
