import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router';
import { LuLoaderCircle } from 'react-icons/lu';
import { checkAuth } from './store/slices/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import StockInPage from './pages/StockInPage';
import StockOutPage from './pages/StockOutPage';
import TransactionsPage from './pages/TransactionsPage';
import StockImportPage from './pages/StockImportPage';
import DamagedProductsPage from './pages/DamagedProductsPage';

function App() {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.theme);

  // Restore session from the httpOnly cookie on first load - localStorage no
  // longer holds anything auth-related, so this is the only source of truth.
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Single place that reflects theme state onto the DOM + localStorage,
  // regardless of how many components read/toggle it via useTheme().
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  if (status === 'checking' || status === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <LuLoaderCircle className="animate-spin text-emerald-500" size={28} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/stock-in" element={<StockInPage />} />
          <Route path="/stock-out" element={<StockOutPage />} />
          <Route path="/damaged-products" element={<DamagedProductsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/transactions/import" element={<StockImportPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
