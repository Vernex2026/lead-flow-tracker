export function Sparkline({ values, width = 180, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <div className="h-8" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / span) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  const lastY = height - ((last - min) / span) * (height - 4) - 2;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="hsl(var(--ink-2))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={lastY} r={2.5} fill="hsl(var(--accent-600))" />
    </svg>
  );
}
