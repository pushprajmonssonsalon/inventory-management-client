import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuDownload, LuPlus, LuUpload } from 'react-icons/lu';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSearch,
  setStatusFilter,
} from '../store/slices/productSlice';
import ProductFilters from '../components/products/ProductFilters';
import ProductTable from '../components/products/ProductTable';
import ProductForm from '../components/products/ProductForm';
import Modal from '../components/common/Modal';
import exportToExcel from '../utils/exportToExcel';
import { parseProductsExcel } from '../utils/importFromExcel';
import api from '../services/api';


const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status, search, statusFilter } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(fetchProducts({ search, status: statusFilter }));
    }, 800);
    return () => clearTimeout(timeout);
  }, [dispatch, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSubmit = async (form) => {
    setSubmitting(true);
    const action = editing
      ? updateProduct({ id: editing._id, ...form })
      : addProduct(form);
    const result = await dispatch(action);
    setSubmitting(false);

    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(editing ? 'Product updated' : 'Product created');
      setModalOpen(false);
    } else {
      toast.error(result.payload || 'Something went wrong');
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const result = await dispatch(deleteProduct(product._id));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Product deleted');
    } else {
      toast.error(result.payload || 'Failed to delete product');
    }
  };
  const handleProductExport = () => {
    const finalData = items.map((item) => ({
      "Product Name": item?.name || "",
      "SKU": item?.sku || "",
      "EAN": item?.ean || "",
      "Quantity": item?.quantity,
      "Minimum Stock": item?.minimumStock,
      "Status": item?.status,
      "Brand": item?.category || "",
      "Pack Size": item?.packSize || "",
      "MRP": item?.mrp ?? "",
      "Expiry Date": item?.expiryDate ? item.expiryDate.split('T')[0] : "",
      "Updated": item?.updatedAt.split('T')[0],
    }));

    exportToExcel(finalData, "Products Data", "products-data.xlsx");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file) return;

    setImporting(true);
    try {
      const rows = await parseProductsExcel(file);
      const { data } = await api.post('/products/import', { rows });

      if (data.createdCount > 0) {
        toast.success(`Imported ${data.createdCount} product${data.createdCount === 1 ? '' : 's'}`);
      }
      if (data.errorCount > 0) {
        const preview = data.errors
          .slice(0, 3)
          .map((e) => `Row ${e.row}: ${e.message}`)
          .join('; ');
        toast.error(
          `${data.errorCount} row${data.errorCount === 1 ? '' : 's'} skipped - ${preview}${
            data.errorCount > 3 ? '…' : ''
          }`,
          { duration: 8000 },
        );
      }
      if (data.createdCount > 0) {
        dispatch(fetchProducts({ search, status: statusFilter }));
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to import file',
      );
    } finally {
      setImporting(false);
    }
  };
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Products</h1>
          <p className="text-sm text-text-muted">{items.length} products</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleProductExport}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
          >
            <LuDownload size={16} />
            Export All
          </button>
          {isAdmin && (
            <>
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
                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
              >
                <LuUpload size={16} />
                {importing ? 'Importing…' : 'Import Excel'}
              </button>
              <button
                onClick={openCreate}
                className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                <LuPlus size={16} />
                Add Product
              </button>
            </>
          )}
        </div>
      </div>

      <ProductFilters
        search={search}
        onSearchChange={(v) => dispatch(setSearch(v))}
        status={statusFilter}
        onStatusChange={(v) => dispatch(setStatusFilter(v))}
      />

      <ProductTable
        products={items}
        loading={status === 'loading'}
        isAdmin={isAdmin}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'}
      >
        <ProductForm
          initialValue={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default ProductsPage;
