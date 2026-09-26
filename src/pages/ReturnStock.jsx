import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuArrowDownToLine } from 'react-icons/lu';
import api from '../services/api';
import { fetchProducts } from '../store/slices/productSlice';

const ReturnStockPage = () => {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const selected = products.find((p) => p._id === productId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) {
      toast.error('Select a product and enter a valid quantity');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/stock/in', { productId, quantity: Number(quantity), note });
      toast.success(`Added ${quantity} units to ${selected?.name}`);
      setQuantity('');
      setNote('');
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record stock in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Return Stock</h1>
        <p className="text-sm text-text-muted">Record Return inventory</p>
      </div>

      <form onSubmit={handleSubmit} className="glass animate-slide-up flex flex-col gap-4 rounded-xl p-6">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Product</label>
          <select
            required
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          >
            <option value="">Select a product...</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku}) — current: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-surface-2 p-3 text-xs sm:grid-cols-3">
            <div>
              <p className="text-text-muted">Pack Size</p>
              <p className="font-medium text-text">{selected.packSize || '—'}</p>
            </div>
            <div>
              <p className="text-text-muted">MRP</p>
              <p className="font-medium text-text">{selected.mrp != null ? `₹${selected.mrp}` : '—'}</p>
            </div>
            <div>
              <p className="text-text-muted">Expiry Date</p>
              <p className="font-medium text-text">
                {selected.expiryDate ? new Date(selected.expiryDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Quantity to add</label>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
            placeholder="e.g. Supplier restock, PO #1234"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <LuArrowDownToLine size={16} />
          Record Stock In
        </button>
      </form>
    </div>
  );
};

export default ReturnStockPage;
