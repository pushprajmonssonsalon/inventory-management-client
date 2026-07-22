import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme as toggleThemeAction } from '../store/slices/themeSlice';

// Thin wrapper around the theme slice so components read/toggle theme
// through one shared piece of state (see App.jsx for the effect that syncs
// this with the <html class="dark"> and localStorage).
export const useTheme = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme: () => dispatch(toggleThemeAction()),
  };
};
