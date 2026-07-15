import React from 'react';
import './Operations.css';
import OperationsEmpty from './OperationsEmpty';

const LiveDrivers = ({ drivers, onDriverClick }) => {
  return (
    <div className="glass-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Live Drivers</h3>
      {(!drivers || drivers.length === 0) ? (
        <OperationsEmpty message="No drivers online." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id} onClick={() => onDriverClick(driver)} style={{ cursor: 'pointer' }}>
                  <td>{driver.name}</td>
                  <td>{driver.vehiclePlate}</td>
                  <td>
                    <span className={`status-badge ${driver.status === 'ONLINE' ? 'status-online' : 'status-busy'}`}>
                      {driver.status}
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

export default LiveDrivers;
