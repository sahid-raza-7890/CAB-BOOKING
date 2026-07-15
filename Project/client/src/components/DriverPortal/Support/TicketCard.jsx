import React from 'react';
import './Support.css';

const TicketCard = ({ ticket, isActive, onClick }) => {
    const timeString = new Date(ticket.createdAt).toLocaleDateString();

    return (
        <div className={`ticket-card ${isActive ? 'active' : ''}`} onClick={() => onClick(ticket)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
                    {ticket.status}
                </span>
                <span style={{ color: '#64748b', fontSize: '12px' }}>{timeString}</span>
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>{ticket.subject}</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ticket.description}
            </p>
        </div>
    );
};

export default TicketCard;
