import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: 20 | 24 | 32 | 40;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const text = size <= 24 ? "text-[10px]" : size <= 32 ? "text-xs" : "text-sm";
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-medium text-ink-2",
        text,
        className
      )}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
