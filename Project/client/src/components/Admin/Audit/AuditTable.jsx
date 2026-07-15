import React from 'react';
import './Audit.css';

const AuditTable = ({ data, onRowClick }) => {
  return (
    <div className="ucab-glass-panel ucab-table-wrapper">
      <table className="ucab-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>IP Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((log) => (
            <tr key={log.id} onClick={() => onRowClick(log)}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.user}</td>
              <td>{log.action}</td>
              <td style={{ fontFamily: 'monospace' }}>{log.ipAddress}</td>
              <td>
                <span className={`ucab-status-badge ucab-status-${log.status.toLowerCase() === 'success' ? 'success' : log.status.toLowerCase() === 'failed' ? 'danger' : 'warning'}`}>
                  {log.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
