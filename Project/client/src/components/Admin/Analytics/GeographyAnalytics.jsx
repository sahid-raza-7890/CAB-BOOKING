import React, { useEffect, useState } from 'react';
import { Map, MapPin, Navigation, Compass, Clock as ClockIcon } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const GeographyAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getGeographicalAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading geographical analytics...</div>;
  }

  const kpis = [
    { title: 'Active Regions', value: (data.activeRegions || 0).toString(), icon: <Map />, trend: data.regionsTrend >= 0 ? 'up' : 'down', trendValue: `${data.regionsTrend || 0}` },
    { title: 'Avg Wait Time', value: `${data.avgWaitTime || 0}m`, icon: <ClockIcon />, trend: data.waitTrend >= 0 ? 'up' : 'down', trendValue: `${data.waitTrend || 0}m` },
    { title: 'Longest Trip', value: `${data.longestTrip || 0}km`, icon: <Navigation />, trend: 'neutral', trendValue: '-' },
    { title: 'Coverage Area', value: `${data.coverageArea || 0}km²`, icon: <Compass />, trend: data.coverageTrend >= 0 ? 'up' : 'down', trendValue: `${data.coverageTrend || 0}km²` }
  ];

  const regionData = data.regionData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid">
        <ChartCard title="Ride Volume by Region" subtitle="Most active operational zones">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
              <YAxis dataKey="region" type="category" stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="volume" fill="#FFD21F" radius={[0, 4, 4, 0]} name="Ride Volume" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Wait Time (mins)" subtitle="ETA delays across regions">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
              <YAxis dataKey="region" type="category" stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Bar dataKey="waitTime" fill="#EF4444" radius={[0, 4, 4, 0]} name="Wait Time (min)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default GeographyAnalytics;
