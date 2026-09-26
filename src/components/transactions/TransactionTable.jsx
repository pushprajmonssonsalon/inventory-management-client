import { LuUndo2 } from 'react-icons/lu';
import StatusBadge from '../common/StatusBadge';
import { RowSkeleton } from '../common/LoadingSkeleton';

const returnLabels = {
  customer: 'Customer return',
  supplier: 'Supplier return',
  damaged: 'Damaged',
};

const TransactionTable = ({ transactions, loading }) => (
  <div className="glass animate-slide-up overflow-hidden rounded-xl">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Pack Size</th>
            <th className="px-4 py-3 font-medium">MRP</th>
            <th className="px-4 py-3 font-medium">Expiry Date</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Qty</th>
            <th className="px-4 py-3 font-medium">Previous</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} cols={11} />)}

          {!loading && transactions.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-text-muted">
                No transactions found.
              </td>
            </tr>
          )}

          {!loading &&
            transactions.map((t) => {
              const isReturn = t.source === 'return';
              return (
                <tr key={t._id} className="transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{t.productId?.name || '—'}</p>
                    <p className="font-mono text-xs text-text-muted">{t.productId?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{t.productId?.packSize || '—'}</td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">
                    {t.productId?.mrp != null ? `₹${t.productId.mrp}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {t.productId?.expiryDate ? new Date(t.productId.expiryDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={t.type} />
                      {isReturn && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                          <LuUndo2 size={11} />
                          {returnLabels[t.returnType] || 'Return'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text">{t.quantity}</td>
                  <td className="px-4 py-3 tabular-nums text-text-muted">{t.previousQuantity}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{t.updatedQuantity}</td>
                  <td className="px-4 py-3 text-text-muted">{t.employeeId?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-text-muted" title={isReturn ? `${t.referenceId} — ${t.note}` : t.note}>
                    {isReturn && t.referenceId ? (
                      <span className="font-mono text-xs">{t.referenceId}</span>
                    ) : (
                      t.note || '—'
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
);

export default TransactionTable;
