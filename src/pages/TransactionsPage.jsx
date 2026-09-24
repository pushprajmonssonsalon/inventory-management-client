import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LuChevronLeft, LuChevronRight, LuDownload } from 'react-icons/lu';
import { fetchTransactions, setTypeFilter, setDateFrom, setDateTo } from '../store/slices/transactionSlice';
import TransactionTable from '../components/transactions/TransactionTable';
import exportToExcel from '../utils/exportToExcel';

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const { items, pagination, typeFilter, status, dateFrom, dateTo } = useSelector((state) => state.transactions);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, dateFrom: dateFrom, dateTo: dateTo }));
  }, [dispatch, dateFrom, dateTo]);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1, type: typeFilter }));
  }, [dispatch, typeFilter]);

  const goToPage = (page) => {
    dispatch(fetchTransactions({ page, type: typeFilter }));
  };
const handleTransactionExport = () => {
    const finalData = items.map((item) => ({
    "Product Name": item.productId?.name || "",
    "SKU": item.productId?.sku || "",
    "Type": item.type,
    "Quantity": item.quantity,
    "Previous Quantity": item.previousQuantity,
    "Updated Quantity": item.updatedQuantity,
    "Employee Name": item.employeeId?.name || "",
    "Date":item.createdAt.split('T')[0],
    "Note": item.note || "",
  }));

  exportToExcel(finalData, "Product Transactions", "product-transaction.xlsx");
};

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Transactions</h1>
          <p className="text-sm text-text-muted">{pagination.total} total records</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">

          <button
            onClick={handleTransactionExport}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
          >
            <LuDownload size={16} />
            Export All
          </button>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => dispatch(setDateFrom(e.target.value))}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-emerald-500/60"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => dispatch(setDateTo(e.target.value))}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-emerald-500/60"
          />

          <select
            value={typeFilter}
            onChange={(e) => dispatch(setTypeFilter(e.target.value))}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-emerald-500/60"
          >
            <option value="">All types</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>

      </div>

      <TransactionTable transactions={items} loading={status === 'loading'} />

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
          >
            <LuChevronLeft size={16} /> Prev
          </button>
          <span className="text-sm text-text-muted">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
          >
            Next <LuChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
