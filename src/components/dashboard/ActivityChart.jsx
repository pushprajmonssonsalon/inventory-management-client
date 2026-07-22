import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartSkeleton } from '../common/LoadingSkeleton';
import { chartTheme } from './chartTheme';
import { useTheme } from '../../hooks/useTheme';

const ActivityChart = ({ data, loading }) => {
  const { isDark } = useTheme();
  const c = chartTheme(isDark);

  if (loading) return <ChartSkeleton />;

  const chartData = (data || []).map((d) => ({ date: d.date, activity: d.in + d.out }));

  return (
    <div className="glass animate-slide-up rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Daily Activity Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
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
          <Line
            type="monotone"
            dataKey="activity"
            stroke="#22d3ee"
            strokeWidth={2.5}
            dot={{ fill: '#22d3ee', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
