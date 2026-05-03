import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function NumberStepper({
  value,
  onChange,
  min = -100,
  max = 100,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div
      className={cn(
        "flex h-9 w-[120px] items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Zmniejsz"
        onClick={() => onChange(clamp(value - 1))}
        className="grid h-full w-8 place-items-center text-ink-3 hover:text-ink-1"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value) || 0))}
        className="tnum h-full w-full min-w-0 border-0 bg-transparent text-center text-sm font-medium text-ink-1 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Zwiększ"
        onClick={() => onChange(clamp(value + 1))}
        className="grid h-full w-8 place-items-center text-ink-3 hover:text-ink-1"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
