import { LuPackage, LuLayers, LuArrowDownToLine, LuArrowUpFromLine, LuTriangleAlert } from 'react-icons/lu';
import { CardSkeleton } from '../common/LoadingSkeleton';

const cardConfig = [
  { key: 'totalProducts', label: 'Total Products', icon: LuPackage, accent: 'from-emerald-500 to-emerald-400' },
  { key: 'totalAvailableStock', label: 'Available Stock', icon: LuLayers, accent: 'from-cyan-500 to-cyan-400' },
  { key: 'stockInToday', label: 'Stock In Today', icon: LuArrowDownToLine, accent: 'from-emerald-500 to-cyan-400' },
  { key: 'stockOutToday', label: 'Stock Out Today', icon: LuArrowUpFromLine, accent: 'from-cyan-500 to-blue-400' },
  { key: 'lowStockCount', label: 'Low Stock Items', icon: LuTriangleAlert, accent: 'from-amber-500 to-rose-400' },
];

const SummaryCards = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cardConfig.map((c) => <CardSkeleton key={c.key} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cardConfig.map(({ key, label, icon: Icon, accent }) => (
        <div
          key={key}
          className="glass animate-slide-up group rounded-xl p-5 transition-transform hover:-translate-y-0.5"
        >
          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white`}>
            <Icon size={17} />
          </div>
          <p className="text-2xl font-bold tabular-nums text-text">{data[key]}</p>
          <p className="mt-1 text-xs text-text-muted">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
