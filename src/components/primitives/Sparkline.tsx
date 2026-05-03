export function Sparkline({ values, width = 180, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <div className="h-8" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <polyline
        points={pts}
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
