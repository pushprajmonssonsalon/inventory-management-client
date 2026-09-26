import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { LuUpload, LuDownload, LuFileSpreadsheet } from 'react-icons/lu';
import api from '../services/api';
import exportToExcel from '../utils/exportToExcel';
import { parseStockTransactionsExcel, STOCK_TRANSACTION_TYPES } from '../utils/importStockExcel';
import { fetchProducts } from '../store/slices/productSlice';

const summaryLabels = {
  stockIn: 'Stock In',
  stockOut: 'Stock Out',
  customerReturn: 'Customer Return',
  supplierReturn: 'Supplier Return',
  damagedReturn: 'Damaged Return',
};

const StockImportPage = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleImportClick = () => fileInputRef.current?.click();

  const handleDownloadTemplate = () => {
    exportToExcel(
      [
        {
          'Product Name': 'Hydrating Face Wash',
          SKU: 'SKU001',
          EAN: '8901234567890',
          Brand: 'Spring h2o',
          'Pack Size': '500ml',
          MRP: 499,
          'Expiry Date': '2027-01-31',
          Type: 'Stock In',
          Quantity: 10,
          Reference: '',
          Note: 'Supplier restock',
        },
        {
          'Product Name': 'Hydrating Face Wash',
          SKU: 'SKU001',
          EAN: '8901234567890',
          Brand: 'Spring h2o',
          'Pack Size': '500ml',
          MRP: 499,
          'Expiry Date': '2027-01-31',
          Type: 'Stock Out',
          Quantity: 2,
          Reference: '',
          Note: 'Dispatched to Store #4',
        },
        {
          'Product Name': 'Revitalizing Serum',
          SKU: 'SKU002',
          EAN: '8901234567906',
          Brand: 'Casmara',
          'Pack Size': '30ml',
          MRP: 899,
          'Expiry Date': '2026-11-30',
          Type: 'Customer Return',
          Quantity: 1,
          Reference: 'ORD-1234',
          Note: 'Unopened',
        },
        {
          'Product Name': 'Revitalizing Serum',
          SKU: 'SKU002',
          EAN: '8901234567906',
          Brand: 'Casmara',
          'Pack Size': '30ml',
          MRP: 899,
          'Expiry Date': '2026-11-30',
          Type: 'Supplier Return',
          Quantity: 5,
          Reference: 'PO-5678',
          Note: '',
        },
        {
          'Product Name': 'Nourishing Hair Oil',
          SKU: 'SKU003',
          EAN: '8901234567913',
          Brand: 'Argatin',
          'Pack Size': '200ml',
          MRP: 349,
          'Expiry Date': '2026-08-15',
          Type: 'Damaged Return',
          Quantity: 1,
          Reference: 'RMA-9',
          Note: 'Box crushed',
        },
      ],
      'Stock Transactions',
      'stock-transactions-template.xlsx',
    );
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImporting(true);
    setLastResult(null);
    try {
      const rows = await parseStockTransactionsExcel(file);
      const { data } = await api.post('/stock/import', { rows });
      setLastResult(data);

      if (data.processedCount > 0) {
        toast.success(`Processed ${data.processedCount} transaction${data.processedCount === 1 ? '' : 's'}`);
        dispatch(fetchProducts());
      }
      if (data.errorCount > 0) {
        const preview = data.errors
          .slice(0, 3)
          .map((err) => `Row ${err.row}: ${err.message}`)
          .join('; ');
        toast.error(
          `${data.errorCount} row${data.errorCount === 1 ? '' : 's'} skipped - ${preview}${
            data.errorCount > 3 ? '…' : ''
          }`,
          { duration: 8000 },
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to import file');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Import Stock Transactions</h1>
        <p className="text-sm text-text-muted">
          Bulk upload stock in, stock out, and return transactions from an Excel sheet
        </p>
      </div>

      <div className="glass animate-slide-up flex flex-col gap-4 rounded-xl p-6">
        <div>
          <h2 className="text-sm font-semibold text-text">Columns</h2>
          <p className="mt-1 text-sm text-text-muted">
            Use the same sheet you'd export from Products - <span className="font-mono text-xs">Product Name</span>,{' '}
            <span className="font-mono text-xs">SKU</span>, <span className="font-mono text-xs">EAN</span>,{' '}
            <span className="font-mono text-xs">Brand</span>, <span className="font-mono text-xs">Pack Size</span>,{' '}
            <span className="font-mono text-xs">MRP</span>, <span className="font-mono text-xs">Expiry Date</span> -
            and just add two columns: <span className="font-mono text-xs">Type</span> and{' '}
            <span className="font-mono text-xs">Quantity</span>. <span className="font-mono text-xs">Reference</span>{' '}
            is required for returns, <span className="font-mono text-xs">Note</span> is optional.
          </p>
          <p className="mt-2 text-sm text-text-muted">
            <span className="font-medium text-text">Type</span> must be one of:{' '}
            {STOCK_TRANSACTION_TYPES.join(', ')}.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Each row is matched to the real product by SKU (falling back to EAN) - the other
            product columns are just there for your own reference and are never written back to
            the product. The matched product's quantity is updated and the move is logged in
            Transactions exactly like using Stock In / Stock Out / Return manually. A Damaged
            Return does not change quantity - it's logged under Damaged Products instead.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            disabled={importing}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <LuUpload size={16} />
            {importing ? 'Importing…' : 'Import Excel'}
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
          >
            <LuDownload size={16} />
            Download Template
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="glass animate-slide-up rounded-xl p-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
            <LuFileSpreadsheet size={16} />
            Last import summary
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Object.entries(summaryLabels).map(([key, label]) => (
              <div key={key} className="rounded-lg border border-border bg-surface-2 p-3">
                <p className="text-xs text-text-muted">{label}</p>
                <p className="text-lg font-semibold text-text">{lastResult.summary?.[key] ?? 0}</p>
              </div>
            ))}
          </div>
          {lastResult.errorCount > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-rose-400">
                {lastResult.errorCount} row{lastResult.errorCount === 1 ? '' : 's'} skipped
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="px-3 py-2 font-medium">Row</th>
                      <th className="px-3 py-2 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lastResult.errors.map((err, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-text-muted">{err.row}</td>
                        <td className="px-3 py-2 text-text-muted">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockImportPage;
