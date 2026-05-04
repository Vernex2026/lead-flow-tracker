import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendPill({
  delta,
  suffix,
  title,
}: {
  delta: number;
  suffix?: string;
  title?: string;
}) {
  const dir = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const cls =
    dir === "up"
      ? "text-success bg-success/10"
      : dir === "down"
        ? "text-warn bg-warn/10"
        : "text-ink-3 bg-surface-2";
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  const sign = delta > 0 ? "+" : "";
  return (
    <span
      title={title ?? (suffix ? `${sign}${delta} ${suffix}` : undefined)}
      className={cn(
        "tnum inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cls
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="tabular-nums">
        {sign}
        {delta}
      </span>
      {suffix ? <span className="hidden sm:inline">{suffix}</span> : null}
    </span>
  );
}
