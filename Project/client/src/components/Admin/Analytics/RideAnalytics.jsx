import React, { useEffect, useState } from 'react';
import { Car, Clock, MapPin, Navigation } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const RideAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getRideAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading ride analytics...</div>;
  }

  const kpis = [
    { title: 'Total Rides', value: (data.totalRides || 0).toLocaleString(), icon: <Car />, trend: data.ridesTrend >= 0 ? 'up' : 'down', trendValue: `${data.ridesTrend || 0}%` },
    { title: 'Avg Ride Time', value: `${data.avgRideTime || 0}m`, icon: <Clock />, trend: 'neutral', trendValue: '0%' },
    { title: 'Avg Distance', value: `${data.avgDistance || 0} km`, icon: <Navigation />, trend: data.distanceTrend >= 0 ? 'up' : 'down', trendValue: `${data.distanceTrend || 0}%` },
    { title: 'Completion Rate', value: `${data.completionRate || 0}%`, icon: <MapPin />, trend: data.completionTrend >= 0 ? 'up' : 'down', trendValue: `${data.completionTrend || 0}%` }
  ];

  const hourlyData = data.hourlyData || [];
  const categoryData = data.categoryData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid">
        <ChartCard title="Ride Volume by Hour" subtitle="Peak hours analysis">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="rides" stroke="#FFD21F" fill="#FFD21F" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Rides by Category" subtitle="Distribution across service types">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default RideAnalytics;
