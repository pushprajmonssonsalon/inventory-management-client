import { useDispatch, useSelector } from 'react-redux';
import { LuMenu, LuLogOut, LuSun, LuMoon } from 'react-icons/lu';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';

const Header = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-base/80 px-4 backdrop-blur lg:px-6">
      <button
        className="rounded-lg p-2 text-text-muted hover:bg-black/5 dark:hover:bg-white/5 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <LuMenu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-black/5 hover:text-text dark:hover:bg-white/5"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <LuSun
            size={18}
            className={`absolute transition-all duration-300 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
          />
          <LuMoon
            size={18}
            className={`absolute transition-all duration-300 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
          />
        </button>

        <div className="mx-1 hidden text-right sm:block">
          <p className="text-sm font-medium text-text">{user?.name}</p>
          <p className="text-xs capitalize text-text-muted">{user?.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-semibold text-white">
          {initials}
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="rounded-lg p-2 text-text-muted hover:bg-rose-500/10 hover:text-rose-400"
          aria-label="Log out"
          title="Log out"
        >
          <LuLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
