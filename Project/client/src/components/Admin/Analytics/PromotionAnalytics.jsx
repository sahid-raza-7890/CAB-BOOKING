import React, { useEffect, useState } from 'react';
import { Tag, Ticket, Activity, Gift } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const PromotionAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getPromotionAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading promotion analytics...</div>;
  }

  const kpis = [
    { title: 'Active Campaigns', value: (data.activeCampaigns || 0).toString(), icon: <Activity />, trend: data.campaignsTrend >= 0 ? 'up' : 'down', trendValue: `${data.campaignsTrend || 0}` },
    { title: 'Total Redemptions', value: (data.totalRedemptions || 0).toLocaleString(), icon: <Ticket />, trend: data.redemptionsTrend >= 0 ? 'up' : 'down', trendValue: `${data.redemptionsTrend || 0}%` },
    { title: 'Promo Spend', value: `₹${(data.promoSpend || 0).toLocaleString()}`, icon: <Tag />, trend: data.spendTrend >= 0 ? 'up' : 'down', trendValue: `${data.spendTrend || 0}%` },
    { title: 'Cost per Acquisition', value: `₹${(data.cpa || 0).toFixed(2)}`, icon: <Gift />, trend: data.cpaTrend >= 0 ? 'up' : 'down', trendValue: `₹${data.cpaTrend || 0}` }
  ];

  const promoData = data.promoData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid single">
        <ChartCard title="Campaign Performance" subtitle="Redemptions vs Cost per campaign">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={promoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="campaign" stroke="rgba(255,255,255,0.5)" />
              <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
              <YAxis yAxisId="right" orientation="right" stroke="#FFD21F" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="redemptions" fill="#10B981" name="Redemptions" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="cost" fill="#FFD21F" name="Cost ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default PromotionAnalytics;
