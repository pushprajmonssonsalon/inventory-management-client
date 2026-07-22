import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router';
import toast from 'react-hot-toast';
import { LuWarehouse, LuLoaderCircle, LuSun, LuMoon } from 'react-icons/lu';
import { login } from '../store/slices/authSlice';
import { useTheme } from '../hooks/useTheme';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, status } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('admin@warehouse.com');
  const [password, setPassword] = useState('admin123');
  const { isDark, toggleTheme } = useTheme();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success('Signed in');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base p-4">
      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-black/5 hover:text-text dark:hover:bg-white/5"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
      </button>
      <div className="glass animate-slide-up w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
            <LuWarehouse size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-text">Warehouse Dashboard</h1>
            <p className="text-sm text-text-muted">Sign in to manage inventory</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
              placeholder="you@warehouse.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none focus:border-emerald-500/60"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === 'loading' && <LuLoaderCircle className="animate-spin" size={16} />}
            Sign in
          </button>
        </form>

        {/* <div className="mt-6 rounded-lg border border-border bg-surface-2/60 p-3 text-xs text-text-muted">
          <p className="mb-1 font-medium text-text">Seeded accounts</p>
          <p>Admin: admin@warehouse.com / admin123</p>
          <p>Employee: employee@warehouse.com / employee123</p>
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
