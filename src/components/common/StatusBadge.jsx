const styles = {
  'In Stock': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  'Low Stock': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  'Out of Stock': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  IN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  OUT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
};

const dots = {
  'In Stock': 'bg-emerald-400',
  'Low Stock': 'bg-amber-400',
  'Out of Stock': 'bg-rose-400',
  IN: 'bg-emerald-400',
  OUT: 'bg-cyan-400',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status] || 'bg-black/5 dark:bg-white/5 text-text-muted border-border'}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`} />
    {status}
  </span>
);

export default StatusBadge;
