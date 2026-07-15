import React from 'react';

const PerformanceDashboard = () => {
  const metrics = [
    { label: 'Today\'s Earnings', value: '₹145.50' },
    { label: 'Weekly Earnings', value: '₹840.20' },
    { label: 'Trips Completed', value: '34' },
    { label: 'Acceptance Rate', value: '92%' },
    { label: 'Cancellation Rate', value: '3%' },
    { label: 'Online Hours', value: '28h 30m' }
  ];

  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
  };

  const containerStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'system-ui, sans-serif'
  };

  const accentColor = '#FFD21F';

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: accentColor, marginBottom: '24px', fontSize: '2rem', fontWeight: 'bold' }}>Performance Dashboard</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {metrics.map((metric, index) => (
            <div key={index} style={{ ...glassStyle, textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}>{metric.label}</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: index < 2 ? accentColor : '#fff' }}>{metric.value}</h2>
            </div>
          ))}
        </div>

        <div style={{ ...glassStyle, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Recent Trips Activity</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 0', gap: '10px' }}>
            {[40, 70, 45, 90, 60, 30, 85].map((height, i) => (
              <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  height: `${height}%`, 
                  width: '60%', 
                  backgroundColor: accentColor, 
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8
                }}></div>
                <span style={{ marginTop: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
