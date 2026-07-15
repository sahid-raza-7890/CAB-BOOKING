import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, CarFront } from 'lucide-react';
import KPICards from './KPICards';
import ChartCard from './ChartCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import adminApiService from '../../../services/adminApiService';

const SafetyAnalytics = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: resData, error } = await adminApiService.getSafetyAnalytics();
      if (!error && resData) {
        setData(resData);
      }
      setLoading(false);
    };
    fetchData();
  }, [filters]);

  if (loading || !data) {
    return <div style={{ color: 'rgba(255,255,255,0.7)', padding: '20px' }}>Loading safety analytics...</div>;
  }

  const kpis = [
    { title: 'Total Incidents', value: (data.totalIncidents || 0).toString(), icon: <ShieldAlert />, trend: data.incidentsTrend >= 0 ? 'up' : 'down', trendValue: `${data.incidentsTrend || 0}%` },
    { title: 'Safety Score', value: (data.safetyScore || 0).toFixed(1), icon: <CheckCircle />, trend: data.scoreTrend >= 0 ? 'up' : 'down', trendValue: `${data.scoreTrend || 0}` },
    { title: 'User Reports', value: (data.userReports || 0).toString(), icon: <AlertTriangle />, trend: data.reportsTrend >= 0 ? 'up' : 'down', trendValue: `${data.reportsTrend || 0}%` },
    { title: 'Accidents', value: (data.accidents || 0).toString(), icon: <CarFront />, trend: 'neutral', trendValue: '0' }
  ];

  const incidentData = data.incidentData || [];

  return (
    <div className="analytics-tab-content">
      <KPICards data={kpis} />
      
      <div className="chart-grid single">
        <ChartCard title="Safety Incidents Over Time" subtitle="Tracking accidents, reports, and SOS alerts">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incidentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="reports" stroke="#3B82F6" strokeWidth={2} name="User Reports" />
              <Line type="monotone" dataKey="accidents" stroke="#FFD21F" strokeWidth={3} name="Accidents" />
              <Line type="monotone" dataKey="sos" stroke="#EF4444" strokeWidth={3} name="SOS Alerts" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default SafetyAnalytics;
