import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, PieChart as PieChartIcon } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const COLORS = ['#FFD21F', '#10B981', '#3B82F6', '#8B5CF6'];

const RevenueAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getRevenueAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading revenue analytics...</div>;
  }

  const kpis = [
    { title: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString()}`, icon: <DollarSign />, trend: data.revenueTrend >= 0 ? 'up' : 'down', trendValue: `${data.revenueTrend || 0}%` },
    { title: 'Net Profit', value: `₹${(data.netProfit || 0).toLocaleString()}`, icon: <TrendingUp />, trend: data.profitTrend >= 0 ? 'up' : 'down', trendValue: `${data.profitTrend || 0}%` },
    { title: 'Avg Order Value', value: `₹${(data.avgOrderValue || 0).toFixed(2)}`, icon: <CreditCard />, trend: 'neutral', trendValue: '0.0%' },
    { title: 'Payment Fees', value: `₹${(data.paymentFees || 0).toLocaleString()}`, icon: <PieChartIcon />, trend: 'down', trendValue: '-2.1%' }
  ];

  const chartData = data.chartData || [];
  const pieData = data.paymentMethods || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid">
        <ChartCard title="Revenue Trend" subtitle="Monthly revenue vs profit">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#FFD21F" strokeWidth={3} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Payment Methods" subtitle="Revenue distribution by payment type">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
