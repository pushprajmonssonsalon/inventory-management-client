import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuArrowUpFromLine, LuTriangleAlert } from 'react-icons/lu';
import api from '../services/api';
import { fetchProducts } from '../store/slices/productSlice';

const StockOutPage = () => {
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
  const willBeLow =
    selected && quantity && selected.quantity - Number(quantity) <= selected.minimumStock;
  const exceedsAvailable = selected && Number(quantity) > selected.quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) {
      toast.error('Select a product and enter a valid quantity');
      return;
    }
    if (exceedsAvailable) {
      toast.error(`Only ${selected.quantity} units available`);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/stock/out', { productId, quantity: Number(quantity), note });
      toast.success(`Dispatched ${quantity} units of ${selected?.name}`);
      setQuantity('');
      setNote('');
      dispatch(fetchProducts());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record stock out');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Stock Out</h1>
        <p className="text-sm text-text-muted">Record outgoing inventory</p>
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
                {p.name} ({p.sku}) — available: {p.quantity}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Quantity to dispatch {selected && <span className="text-text-muted/70">(available: {selected.quantity})</span>}
          </label>
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>

        {exceedsAvailable && (
          <p className="flex items-center gap-1.5 text-xs text-rose-400">
            <LuTriangleAlert size={14} />
            Exceeds available stock ({selected.quantity} units)
          </p>
        )}
        {!exceedsAvailable && willBeLow && (
          <p className="flex items-center gap-1.5 text-xs text-amber-400">
            <LuTriangleAlert size={14} />
            This will bring stock at or below the minimum ({selected.minimumStock} units)
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
            placeholder="e.g. Dispatched to Store #4"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || exceedsAvailable}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          <LuArrowUpFromLine size={16} />
          Record Stock Out
        </button>
      </form>
    </div>
  );
};

export default StockOutPage;
