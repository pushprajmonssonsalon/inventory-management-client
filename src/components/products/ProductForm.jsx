import { useEffect, useState } from 'react';
import { capitalize } from './ProductTable';

const categories = ['Spring h2o', 'Casmara', 'Argatin', 'Skin co.', 'Rica', 'Loreal', 'Ola candy', 'Ikonic','Skin co. nyc'];

const emptyForm = {
  name: '',
  sku: '',
  ean: '',
  category: categories[0],
  quantity: 0,
  minimumStock: 10,
  packSize: '',
  mrp: '',
  expiryDate: '',
};

const ProductForm = ({ initialValue, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(initialValue || emptyForm);
  useEffect(() => {
    setForm(
      initialValue
        ? { ...initialValue, expiryDate: initialValue.expiryDate ? initialValue.expiryDate.slice(0, 10) : '' }
        : emptyForm
    );
  }, [initialValue]);

  const handleChange = (field) => (e) => {
    const value = ['quantity', 'minimumStock', 'mrp'].includes(field)
      ? e.target.value === '' ? '' : Number(e.target.value)
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Pack size</label>
          <input
            required
            value={form.packSize || ''}
            onChange={handleChange('packSize')}
            placeholder="e.g. 500ml"
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">MRP</label>
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.mrp ?? ''}
            onChange={handleChange('mrp')}
            className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Expiry date</label>
        <input
          type="date"
          required
          value={form.expiryDate || ''}
          onChange={handleChange('expiryDate')}
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
        />
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
