const PADDING = 2;

export function Sparkline({
  values,
  width = 180,
  height = 32,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return <div className="h-8" />;

  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const usableHeight = height - PADDING * 2;
  const stepX = width / (values.length - 1);

  const points = values
    .map((value, index) => {
      const x = (index * stepX).toFixed(1);
      const y = (height - ((value - min) / span) * usableHeight - PADDING).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--ink-3))"
        strokeOpacity="0.6"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
