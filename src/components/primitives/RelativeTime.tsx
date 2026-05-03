import { fmtRelative } from "@/lib/format";

export function RelativeTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={iso}>
      {fmtRelative(iso)}
    </time>
  );
}
