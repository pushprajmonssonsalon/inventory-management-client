// Recharts colors are inline SVG/style props, not Tailwind classes, so they
// can't pick up CSS variables automatically - each chart looks these up
// based on the current theme instead.
export const chartTheme = (isDark) => ({
  grid: isDark ? '#232c39' : '#e2e8f0',
  axis: isDark ? '#8a94a6' : '#64748b',
  tooltipBg: isDark ? '#161d27' : '#ffffff',
  tooltipBorder: isDark ? '#232c39' : '#e2e8f0',
  tooltipLabel: isDark ? '#e7ebf2' : '#0f172a',
});
