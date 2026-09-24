import { LuPencil, LuTrash2 } from 'react-icons/lu';
import StatusBadge from '../common/StatusBadge';
import { RowSkeleton } from '../common/LoadingSkeleton';

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

const ProductTable = ({ products, loading, isAdmin, onEdit, onDelete }) => (
  <div className="glass animate-slide-up overflow-hidden rounded-xl overflow-y-auto h-96">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">SKU</th>
            <th className="px-4 py-3 font-medium">EAN</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Quantity</th>
            <th className="px-4 py-3 font-medium">Min Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            {isAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} cols={isAdmin ? 9 : 8} />)}

          {!loading && products.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 9 : 8} className="px-4 py-10 text-center text-text-muted">
                No products found.
              </td>
            </tr>
          )}

          {!loading &&
            products.map((p) => (
              <tr key={p._id} className="transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
                <td className="px-4 py-3 font-medium text-text">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.sku}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{p.ean || '—'}</td>
                <td className="px-4 py-3 text-text-muted">{capitalize(p.category)}</td>
                <td className="px-4 py-3 tabular-nums text-text">{p.quantity}</td>
                <td className="px-4 py-3 tabular-nums text-text-muted">{p.minimumStock}</td>
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
