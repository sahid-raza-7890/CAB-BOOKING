import React from 'react';
import './Operations.css';
import OperationsEmpty from './OperationsEmpty';

const ActiveRides = ({ rides, onRideClick }) => {
  return (
    <div className="glass-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Active Rides</h3>
      {(!rides || rides.length === 0) ? (
        <OperationsEmpty message="No active rides." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Passenger</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map(ride => (
                <tr key={ride.id} onClick={() => onRideClick(ride)} style={{ cursor: 'pointer' }}>
                  <td>{ride.driverName}</td>
                  <td>{ride.passengerName}</td>
                  <td>
                    <span className="status-badge" style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)' }}>
                      {ride.status}
                    </span>
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

export default ActiveRides;
