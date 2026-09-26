import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuTriangleAlert } from "react-icons/lu";
import { fetchDamagedProducts } from "../store/slices/damagedSlice";
import { RowSkeleton } from "../components/common/LoadingSkeleton";

const DamagedProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.damaged);
  const loading = status === "loading" || status === "idle";

  useEffect(() => {
    dispatch(fetchDamagedProducts());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold text-text">
          <LuTriangleAlert className="text-amber-400" size={20} />
          Damaged Products
        </h1>
        <p className="text-sm text-text-muted">
          Items logged as damaged returns - kept out of sellable inventory
        </p>
      </div>

      <div className="glass animate-slide-up overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Pack Size</th>
                <th className="px-4 py-3 font-medium">MRP</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Reported by</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} cols={9} />)}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-text-muted">
                    No damaged products logged.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((d) => (
                  <tr
                    key={d._id}
                    className="transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{d.productId?.name || "—"}</p>
                      <p className="font-mono text-xs text-text-muted">
                        {d.productId?.ean || d.productId?.sku || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{d.productId?.packSize || "—"}</td>
                    <td className="px-4 py-3 tabular-nums text-text-muted">
                      {d.productId?.mrp != null ? `₹${d.productId.mrp}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {d.productId?.expiryDate
                        ? new Date(d.productId.expiryDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-text">{d.quantity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {d.referenceId || "—"}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{d.employeeId?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                    <td
                      className="max-w-[200px] truncate px-4 py-3 text-text-muted"
                      title={d.note}
                    >
                      {d.note || "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DamagedProductsPage;
