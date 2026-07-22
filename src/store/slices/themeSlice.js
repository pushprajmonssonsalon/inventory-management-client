import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: getInitialTheme() },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
