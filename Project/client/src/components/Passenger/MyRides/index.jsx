import React, { useState, useEffect } from 'react';
import { getMyRides } from '../../../services/rideService';
import '../Passenger.css';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // all, upcoming, active, completed

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }
      const data = await getMyRides(params);
      setRides(data.rides || data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="pp-container" style={{ maxWidth: '800px' }}>
      <h2 className="pp-title">My Rides</h2>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'upcoming', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className="pp-btn"
            style={{
              background: filter === f ? '#FFD21F' : 'rgba(255, 210, 31, 0.2)',
              color: filter === f ? '#0F172A' : '#FFD21F',
              padding: '8px 16px',
              border: filter === f ? 'none' : '1px solid #FFD21F'
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="pp-error">{error}</div>}

      {loading && rides.length === 0 ? (
        <div style={{ textAlign: 'center' }}>Loading rides...</div>
      ) : rides.length === 0 ? (
        <p style={{ color: '#94A3B8', textAlign: 'center' }}>No rides found.</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="pp-table">
              <thead>
                <tr>
                  <th className="pp-th">Date</th>
                  <th className="pp-th">Pickup</th>
                  <th className="pp-th">Dropoff</th>
                  <th className="pp-th">Status</th>
                  <th className="pp-th">Fare</th>
                  <th className="pp-th">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {rides.map(ride => (
                  <tr key={ride._id || ride.id}>
                    <td className="pp-td">{new Date(ride.createdAt || ride.date).toLocaleDateString()}</td>
                    <td className="pp-td">{ride.pickupLocation?.address || 'N/A'}</td>
                    <td className="pp-td">{ride.dropoffLocation?.address || 'N/A'}</td>
                    <td className="pp-td">
                      <span className="pp-badge" style={{
                        background: ride.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : ride.status === 'active' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: ride.status === 'completed' ? '#10B981' : ride.status === 'active' ? '#3B82F6' : '#F59E0B'
                      }}>
                        {ride.status}
                      </span>
                    </td>
                    <td className="pp-td" style={{ fontWeight: 'bold' }}>
                      ${Number(ride.fare || ride.price || 0).toFixed(2)}
                    </td>
                    <td className="pp-td">
                      {(ride.status === 'completed' || ride.status === 'paid') ? (
                        <button 
                          className="pp-btn" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                          onClick={() => alert(`Invoice feature triggered for Ride ID: ${ride._id || ride.id}`)}
                        >
                          View
                        </button>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pp-pagination">
              <button 
                className="pp-pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                className="pp-pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRides;
