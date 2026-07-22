import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import SummaryCards from '../components/dashboard/SummaryCards';
import StockChart from '../components/dashboard/StockChart';
import ActivityChart from '../components/dashboard/ActivityChart';
import QuantityOverview from '../components/dashboard/QuantityOverview';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, status } = useSelector((state) => state.dashboard);
  const loading = status === 'loading' || status === 'idle';

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-text-muted">Live snapshot of your warehouse inventory</p>
      </div>

      <SummaryCards data={data} loading={loading} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <StockChart data={data?.last7Days} loading={loading} />
        <ActivityChart data={data?.last7Days} loading={loading} />
      </div>

      <QuantityOverview data={data?.topProducts} loading={loading} />
    </div>
  );
};

export default DashboardPage;
