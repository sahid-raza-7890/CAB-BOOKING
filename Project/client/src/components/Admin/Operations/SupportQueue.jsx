import React from 'react';
import './Operations.css';
import OperationsEmpty from './OperationsEmpty';

const SupportQueue = ({ tickets, onTicketClick }) => {
  return (
    <div className="glass-panel">
      <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Support Queue</h3>
      {(!tickets || tickets.length === 0) ? (
        <OperationsEmpty message="No open support tickets." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} onClick={() => onTicketClick(ticket)} style={{ cursor: 'pointer' }}>
                  <td>{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <span className={`status-badge ${ticket.priority === 'HIGH' ? 'status-sos' : ''}`}>
                      {ticket.priority}
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

export default SupportQueue;
