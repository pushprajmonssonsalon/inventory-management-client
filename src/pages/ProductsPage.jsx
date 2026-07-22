import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LuDownload, LuPlus } from 'react-icons/lu';
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


const ProductsPage = () => {
  const dispatch = useDispatch();
  const { items, status, search, statusFilter } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      "Quantity": item?.quantity,
      "Minimum Stock": item?.minimumStock,
      "Status": item?.status,
      "Brand": item?.category || "",
      "Updated": item?.updatedAt.split('T')[0],
    }));

    exportToExcel(finalData, "Products Data", "products-data.xlsx");
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Products</h1>
          <p className="text-sm text-text-muted">{items.length} products</p>
        </div>



        <div className="flex items-center gap-3">
          <button
            onClick={handleProductExport}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
          >
            <LuDownload size={16} />
            Export All
          </button>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <LuPlus size={16} />
              Add Product
            </button>
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
