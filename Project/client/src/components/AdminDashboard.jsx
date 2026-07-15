import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import RevenueChart from './RevenueChart';

function AdminDashboard() {
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, pending: 0, activeDrivers: 3 }); // activeDrivers mocked as per your UI
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const fetchRides = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rides');
      if (response.ok) {
        const data = await response.json();
        setRides(data.reverse());
        
        // Calculate dynamic stats
        let totalRev = 0;
        let pendingReq = 0;
        data.forEach(ride => {
          if (ride.status === 'Completed') totalRev += ride.fare || 0;
          if (ride.status === 'Pending') pendingReq += 1;
        });
        
        setStats(prev => ({ ...prev, revenue: totalRev, pending: pendingReq }));
      }
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    }
  };

  useEffect(() => {
    fetchRides();
    const socket = io('http://localhost:5000');
    
    const handleNewRide = (newRide) => {
      setRides(prev => [newRide, ...prev]);
      
      // Update statistics in real-time
      setStats(prev => {
        let newRevenue = prev.revenue;
        if (newRide.status === 'Completed') {
          newRevenue += newRide.fare || 0;
        }
        return {
          ...prev,
          revenue: newRevenue,
          pending: prev.pending + (newRide.status === 'Pending' ? 1 : 0)
        };
      });
      
      triggerToast(`New ride requested by ${newRide.passengerName}!`, 'success');
    };

    const handleRideUpdated = () => {
      fetchRides();
    };

    socket.on('newRide', handleNewRide);
    socket.on('rideUpdated', handleRideUpdated);
    
    return () => {
      socket.off('newRide', handleNewRide);
      socket.off('rideUpdated', handleRideUpdated);
      socket.disconnect();
    };
  }, []);

  const handleDispatch = async (rideId) => {
    try {
      const response = await fetch('http://localhost:5000/api/rides/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId })
      });
      if (response.ok) {
        triggerToast("Driver dispatched successfully!", "success");
        fetchRides();
      }
    } catch (error) {
      triggerToast("Dispatch failed.", "error");
    }
  };

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', borderRadius: '8px', 
          color: 'var(--primary-text)', fontWeight: 'bold', zIndex: 1000, 
          backgroundColor: toast.type === 'success' ? 'var(--primary-accent)' : '#dc3545',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {toast.message}
        </div>
      )}

      <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🛡️ Admin Dispatch Console
      </h2>

      {/* TOP METRICS GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Revenue Card */}
        <div style={{ 
          backgroundColor: 'var(--primary-accent)', color: 'var(--primary-text)', 
          padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Total Revenue</h3>
          <h1 style={{ margin: 0, fontSize: '36px' }}>₹{stats.revenue}</h1>
        </div>

        {/* Pending Requests Card */}
        <div style={{ 
          backgroundColor: '#f59e0b', color: '#fff', 
          padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Pending Requests</h3>
          <h1 style={{ margin: 0, fontSize: '36px' }}>{stats.pending}</h1>
        </div>

        {/* Active Drivers Card */}
        <div style={{ 
          backgroundColor: '#0ea5e9', color: '#fff', 
          padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Active Drivers</h3>
          <h1 style={{ margin: 0, fontSize: '36px' }}>{stats.activeDrivers}</h1>
        </div>
      </div>

      {/* ANALYTICS VISUALIZATION */}
      <RevenueChart rides={rides} />

      {/* LIVE DISPATCH BOARD */}
      <div style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderRadius: '12px', 
        border: '1px solid var(--card-border)',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', backgroundColor: 'var(--bg-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Live Dispatch Board</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '15px 20px', borderBottom: '2px solid var(--card-border)' }}>Passenger</th>
                <th style={{ padding: '15px 20px', borderBottom: '2px solid var(--card-border)' }}>Route</th>
                <th style={{ padding: '15px 20px', borderBottom: '2px solid var(--card-border)' }}>Fare / Type</th>
                <th style={{ padding: '15px 20px', borderBottom: '2px solid var(--card-border)' }}>Status</th>
                <th style={{ padding: '15px 20px', borderBottom: '2px solid var(--card-border)' }}>Dispatch Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map(ride => (
                <tr key={ride._id} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-main)' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{ride.passengerName}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}><strong>From:</strong> {typeof ride.pickupLocation === 'object' ? ride.pickupLocation?.address || 'Unknown' : ride.pickupLocation}</div>
                    <div style={{ fontSize: '14px' }}><strong>To:</strong> {typeof ride.dropoffLocation === 'object' ? ride.dropoffLocation?.address || 'Unknown' : ride.dropoffLocation}</div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary-accent)', fontSize: '16px' }}>₹{ride.fare}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ride.cabType || 'Any'}</div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase',
                      backgroundColor: ride.status === 'Pending' ? '#fff3cd' : ride.status === 'Completed' ? 'var(--primary-accent)' : '#cce5ff',
                      color: ride.status === 'Pending' ? '#856404' : ride.status === 'Completed' ? 'var(--primary-text)' : '#004085'
                    }}>{ride.status}</span>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    {ride.status === 'Pending' ? (
                      <button 
                        onClick={() => handleDispatch(ride._id)}
                        style={{ padding: '8px 16px', backgroundColor: 'var(--primary-accent)', color: 'var(--primary-text)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Dispatch Driver
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ✅ Dispatched
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rides.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No rides available on the dispatch board.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
