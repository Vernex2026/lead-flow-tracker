import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "flat";

const STYLE_BY_DIRECTION: Record<Direction, { className: string; Icon: typeof Minus }> = {
  up: { className: "text-success bg-success/10", Icon: ArrowUpRight },
  down: { className: "text-warn bg-warn/10", Icon: ArrowDownRight },
  flat: { className: "text-ink-3 bg-surface-2", Icon: Minus },
};

const directionOf = (delta: number): Direction =>
  delta > 0 ? "up" : delta < 0 ? "down" : "flat";

export function TrendPill({
  delta,
  suffix,
  title,
}: {
  delta: number;
  suffix?: string;
  title?: string;
}) {
  const { className, Icon } = STYLE_BY_DIRECTION[directionOf(delta)];
  const sign = delta > 0 ? "+" : "";
  const tooltip = title ?? (suffix ? `${sign}${delta} ${suffix}` : undefined);

  return (
    <span
      title={tooltip}
      className={cn(
        "tnum inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      <span>{sign}{delta}</span>
      {suffix && <span className="hidden sm:inline">{suffix}</span>}
    </span>
  );
}
