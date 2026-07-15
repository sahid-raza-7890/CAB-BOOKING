import React, { useEffect, useState } from 'react';
import { DollarSign, Percent, TrendingDown, Briefcase } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const FinanceAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getFinancialAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading finance analytics...</div>;
  }

  const kpis = [
    { title: 'Operating Margin', value: `${data.operatingMargin || 0}%`, icon: <Percent />, trend: data.marginTrend >= 0 ? 'up' : 'down', trendValue: `${data.marginTrend || 0}%` },
    { title: 'Total Expenses', value: `₹${(data.totalExpenses || 0).toLocaleString()}`, icon: <TrendingDown />, trend: data.expensesTrend >= 0 ? 'up' : 'down', trendValue: `${data.expensesTrend || 0}%` },
    { title: 'Driver Payouts', value: `₹${(data.driverPayouts || 0).toLocaleString()}`, icon: <DollarSign />, trend: data.payoutsTrend >= 0 ? 'up' : 'down', trendValue: `${data.payoutsTrend || 0}%` },
    { title: 'Corporate Billing', value: `₹${(data.corporateBilling || 0).toLocaleString()}`, icon: <Briefcase />, trend: data.corporateTrend >= 0 ? 'up' : 'down', trendValue: `${data.corporateTrend || 0}%` }
  ];

  const expenseData = data.expenseData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid single">
        <ChartCard title="Financial Health" subtitle="Expenses vs Margin over time">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={expenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="opEx" stackId="a" fill="#3B82F6" name="Operating Expenses" />
              <Bar yAxisId="left" dataKey="capEx" stackId="a" fill="#8B5CF6" name="Capital Expenses" />
              <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#FFD21F" strokeWidth={3} name="Margin %" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default FinanceAnalytics;
