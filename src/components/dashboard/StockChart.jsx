import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { ChartSkeleton } from '../common/LoadingSkeleton';
import { chartTheme } from './chartTheme';
import { useTheme } from '../../hooks/useTheme';

const StockChart = ({ data, loading }) => {
  const { isDark } = useTheme();
  const c = chartTheme(isDark);

  if (loading) return <ChartSkeleton />;

  return (
    <div className="glass animate-slide-up rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Stock In vs Stock Out (7 days)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => d.slice(5)}
            stroke={c.axis}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke={c.axis} fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: c.tooltipLabel }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: c.axis }} />
          <Bar dataKey="in" name="Stock In" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="out" name="Stock Out" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
