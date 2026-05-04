import { cn } from "@/lib/utils";

type Size = 20 | 24 | 32 | 40;

const TEXT_SIZE: Record<Size, string> = {
  20: "text-[10px]",
  24: "text-[10px]",
  32: "text-xs",
  40: "text-sm",
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: Size;
  className?: string;
}) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-medium text-ink-2",
        TEXT_SIZE[size],
        className,
      )}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}
