import { cn } from "@/lib/utils";
import type { StatusCode } from "@/data/types";
import { STATUS_LABEL } from "@/data/types";

const CHIP_BY_STATUS: Record<StatusCode, string> = {
  new: "bg-status-new text-status-new-fg",
  qualified: "bg-status-qualified text-status-qualified-fg",
  opportunity: "bg-status-opportunity text-status-opportunity-fg",
  won: "bg-status-won text-status-won-fg",
  lost: "bg-status-lost text-status-lost-fg",
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-[13px]",
  lg: "px-3 py-1.5 text-sm",
} as const;

export function StatusChip({
  code,
  size = "md",
  className,
}: {
  code: StatusCode;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      aria-label={`Status: ${STATUS_LABEL[code]}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-wide",
        CHIP_BY_STATUS[code],
        SIZE_CLASSES[size],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[code]}
    </span>
  );
}
