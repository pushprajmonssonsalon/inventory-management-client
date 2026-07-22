import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartSkeleton } from '../common/LoadingSkeleton';
import { chartTheme } from './chartTheme';
import { useTheme } from '../../hooks/useTheme';

const QuantityOverview = ({ data, loading }) => {
  const { isDark } = useTheme();
  const c = chartTheme(isDark);

  if (loading) return <ChartSkeleton height={320} />;

  const chartData = (data || []).map((p) => ({ name: p.name, quantity: p.quantity }));

  return (
    <div className="glass animate-slide-up rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Top Products by Quantity</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke={c.axis} fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke={c.axis}
            fontSize={11}
            width={110}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value.length > 10 ? `${value.substring(0, 10)}...` : value
            }
          />
          <Tooltip
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.tooltipBorder}`, borderRadius: 8 }}
            labelStyle={{ color: c.tooltipLabel }}
          />
          <Bar dataKey="quantity" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QuantityOverview;
