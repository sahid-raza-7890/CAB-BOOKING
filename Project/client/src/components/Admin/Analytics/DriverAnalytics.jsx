import React, { useEffect, useState } from 'react';
import { Users, Star, UserCheck, Clock } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const DriverAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getDriverAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading driver analytics...</div>;
  }

  const kpis = [
    { title: 'Total Drivers', value: (data.totalDrivers || 0).toLocaleString(), icon: <Users />, trend: data.driversTrend >= 0 ? 'up' : 'down', trendValue: `${data.driversTrend || 0}%` },
    { title: 'Avg Rating', value: (data.avgRating || 0).toFixed(2), icon: <Star />, trend: data.ratingTrend >= 0 ? 'up' : 'down', trendValue: `${data.ratingTrend || 0}` },
    { title: 'Active Drivers', value: (data.activeDrivers || 0).toLocaleString(), icon: <UserCheck />, trend: data.activeTrend >= 0 ? 'up' : 'down', trendValue: `${data.activeTrend || 0}%` },
    { title: 'Avg Online Hours', value: `${data.avgOnlineHours || 0}h`, icon: <Clock />, trend: 'neutral', trendValue: '0%' }
  ];

  const retentionData = data.retentionData || [];
  const ratingData = data.ratingData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid">
        <ChartCard title="Driver Growth & Retention" subtitle="Active vs New drivers monthly">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="new" stroke="#FFD21F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Driver Ratings Distribution" subtitle="Overall rating spread">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="rating" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#FFD21F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default DriverAnalytics;
