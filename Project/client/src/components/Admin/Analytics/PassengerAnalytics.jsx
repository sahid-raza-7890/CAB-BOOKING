import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Heart, Zap } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const COLORS = ['#FFD21F', '#10B981', '#3B82F6', '#EF4444'];

const PassengerAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getPassengerAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading passenger analytics...</div>;
  }

  const kpis = [
    { title: 'Total Passengers', value: (data.totalPassengers || 0).toLocaleString(), icon: <Users />, trend: data.passengersTrend >= 0 ? 'up' : 'down', trendValue: `${data.passengersTrend || 0}%` },
    { title: 'New Signups', value: (data.newSignups || 0).toLocaleString(), icon: <UserPlus />, trend: data.signupsTrend >= 0 ? 'up' : 'down', trendValue: `${data.signupsTrend || 0}%` },
    { title: 'Retention Rate', value: `${data.retentionRate || 0}%`, icon: <Heart />, trend: 'neutral', trendValue: '0%' },
    { title: 'Engagement Score', value: `${data.engagementScore || 0}/10`, icon: <Zap />, trend: data.engagementTrend >= 0 ? 'up' : 'down', trendValue: `${data.engagementTrend || 0}` }
  ];

  const signupsData = data.signupsData || [];
  const cohortData = data.cohortData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid">
        <ChartCard title="Passenger Acquisition" subtitle="Organic vs Referral signups">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={signupsData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="organic" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="referral" stackId="1" stroke="#FFD21F" fill="#FFD21F" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Segments" subtitle="Distribution by usage frequency">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cohortData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {cohortData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default PassengerAnalytics;
