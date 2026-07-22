import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import {
  LuLayoutDashboard,
  LuPackage,
  LuArrowDownToLine,
  LuArrowUpFromLine,
  LuHistory,
  LuWarehouse,
} from 'react-icons/lu';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LuLayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: LuPackage },
  { to: '/stock-in', label: 'Stock In', icon: LuArrowDownToLine },
  { to: '/stock-out', label: 'Stock Out', icon: LuArrowUpFromLine },
  { to: '/transactions', label: 'Transactions', icon: LuHistory },
];

const Sidebar = ({ open, onNavigate }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <aside
      className={`fixed z-40 h-full w-64 shrink-0 border-r border-border bg-surface/95 backdrop-blur transition-transform duration-300 lg:static lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
          <LuWarehouse size={18} />
        </div>
        <span className="font-semibold tracking-tight text-text">Warehouse</span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => {
          if (label === 'Products' && user?.role !== 'admin') {
            // employees can still view products (read-only), so keep visible
          }
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
