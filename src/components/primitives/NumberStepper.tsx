import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export function NumberStepper({
  value,
  onChange,
  min = -100,
  max = 100,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const step = (delta: number) => onChange(clamp(value + delta, min, max));

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.trim();
    if (raw === "" || raw === "-") return;
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed)) onChange(clamp(parsed, min, max));
  };

  return (
    <div
      className={cn(
        "flex h-9 w-[120px] items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Zmniejsz"
        onClick={() => step(-1)}
        className="grid h-full w-8 place-items-center text-ink-3 hover:text-ink-1"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={onInputChange}
        className="tnum h-full w-full min-w-0 border-0 bg-transparent text-center text-sm font-medium text-ink-1 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        aria-label="Zwiększ"
        onClick={() => step(1)}
        className="grid h-full w-8 place-items-center text-ink-3 hover:text-ink-1"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
