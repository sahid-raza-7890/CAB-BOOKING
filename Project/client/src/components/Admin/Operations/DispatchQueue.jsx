import React from 'react';
import './Operations.css';
import OperationsEmpty from './OperationsEmpty';

const DispatchQueue = ({ pendingRides, onRideClick }) => {
  return (
    <div className="glass-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Dispatch Queue</h3>
      {(!pendingRides || pendingRides.length === 0) ? (
        <OperationsEmpty message="No pending rides." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>Pickup</th>
                <th>Wait Time</th>
              </tr>
            </thead>
            <tbody>
              {pendingRides.map(ride => (
                <tr key={ride.id} onClick={() => onRideClick(ride)} style={{ cursor: 'pointer' }}>
                  <td>{ride.shortId}</td>
                  <td>{ride.pickupArea}</td>
                  <td style={{ color: ride.waitTime > 5 ? 'var(--accent-orange)' : 'var(--text-main)' }}>
                    {ride.waitTime} min
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DispatchQueue;
