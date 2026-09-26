import { LuPencil, LuTrash2 } from 'react-icons/lu';
import StatusBadge from '../common/StatusBadge';
import { RowSkeleton } from '../common/LoadingSkeleton';

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const ProductTable = ({ products, loading, isAdmin, onEdit, onDelete }) => (
  <div className="glass animate-slide-up h-96 min-w-0 overflow-hidden overflow-y-auto rounded-xl">
    <div className="overflow-x-auto">
      <table className="w-full min-w-max whitespace-nowrap text-left text-sm">
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">EAN</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Quantity</th>
            <th className="px-4 py-3 font-medium">Min Stock</th>
            <th className="px-4 py-3 font-medium">Pack Size</th>
            <th className="px-4 py-3 font-medium">MRP</th>
            <th className="px-4 py-3 font-medium">Expiry Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} cols={isAdmin ? 12 : 11} />)}

          {!loading && products.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 12 : 11} className="px-4 py-10 text-center text-text-muted">
                No products found.
              </td>
            </tr>
          )}

          {!loading &&
            products.map((p) => (
              <tr key={p._id} className="transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
                <td className="max-w-[220px] truncate px-4 py-3 font-medium text-text" title={p.name}>
                  {p.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.sku}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.ean || '—'}</td>
                <td className="px-4 py-3 text-text-muted">{capitalize(p.category)}</td>
                <td className="px-4 py-3 tabular-nums text-text">{p.quantity}</td>
                <td className="px-4 py-3 tabular-nums text-text-muted">{p.minimumStock}</td>
                <td className="px-4 py-3 text-text-muted">{p.packSize || '—'}</td>
                <td className="px-4 py-3 tabular-nums text-text-muted">{p.mrp != null ? `₹${p.mrp}` : '—'}</td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-xs text-text-muted">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(p)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-cyan-500/10 hover:text-cyan-400"
                        aria-label={`Edit ${p.name}`}
                      >
                        <LuPencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="rounded-lg p-1.5 text-text-muted hover:bg-rose-500/10 hover:text-rose-400"
                        aria-label={`Delete ${p.name}`}
                      >
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProductTable;
