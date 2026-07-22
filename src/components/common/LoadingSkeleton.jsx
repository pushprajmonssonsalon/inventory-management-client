export const RowSkeleton = ({ cols = 5 }) => (
  <tr className="animate-pulse-soft">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3.5 rounded bg-black/5 dark:bg-white/5" />
      </td>
    ))}
  </tr>
);

export const CardSkeleton = () => (
  <div className="glass animate-pulse-soft rounded-xl p-5">
    <div className="mb-3 h-3 w-20 rounded bg-black/5 dark:bg-white/5" />
    <div className="h-7 w-24 rounded bg-black/10 dark:bg-white/10" />
  </div>
);

export const ChartSkeleton = ({ height = 260 }) => (
  <div className="glass animate-pulse-soft rounded-xl p-5" style={{ height }}>
    <div className="mb-4 h-3 w-32 rounded bg-black/5 dark:bg-white/5" />
    <div className="h-[calc(100%-2rem)] w-full rounded bg-black/5 dark:bg-white/5" />
  </div>
);
