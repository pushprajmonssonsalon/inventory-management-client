import { LuSearch } from 'react-icons/lu';

const statusOptions = ['', 'In Stock', 'Low Stock', 'Out of Stock'];

const ProductFilters = ({ search, onSearchChange, status, onStatusChange }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name or SKU..."
        className="w-full rounded-lg border border-border bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-text outline-none focus:border-emerald-500/60"
      />
    </div>
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>
          {s || 'All statuses'}
        </option>
      ))}
    </select>
  </div>
);

export default ProductFilters;
