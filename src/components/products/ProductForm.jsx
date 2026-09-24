import { useEffect, useState } from 'react';
import { capitalize } from './ProductTable';

const categories = ['Spring h2o', 'Casmara', 'Argatin', 'Skin co.', 'Rica', 'Loreal', 'Ola candy', 'Ikonic','Skin co. nyc'];

const emptyForm = { name: '', sku: '', ean: '', category: categories[0], quantity: 0, minimumStock: 10 };

const ProductForm = ({ initialValue, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initialValue || emptyForm);
  useEffect(() => {
    setForm(initialValue || emptyForm);
  }, [initialValue]);

  const handleChange = (field) => (e) => {
    const value = ['quantity', 'minimumStock'].includes(field)
      ? Number(e.target.value)
      : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Product name</label>
        <input
          required
          value={form.name}
          onChange={handleChange('name')}
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">SKU</label>
        <input
          required
          value={form.sku}
          onChange={handleChange('sku')}
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-text outline-none focus:border-emerald-500/60"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">EAN / Barcode</label>
        <input
          required
          value={form.ean || ''}
          onChange={handleChange('ean')}
          placeholder="e.g. 8901234567890"
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-text outline-none focus:border-emerald-500/60"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Brand</label>
        <select
          value={capitalize(form.category)}
          onChange={handleChange('category')}
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Quantity</label>
          <input
            type="number"
            min={0}
            required
            value={form.quantity}
            onChange={handleChange('quantity')}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Minimum stock</label>
          <input
            type="number"
            min={0}
            required
            value={form.minimumStock}
            onChange={handleChange('minimumStock')}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-black/5 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {initialValue ? 'Save changes' : 'Add product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
