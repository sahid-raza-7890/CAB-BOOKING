import React from 'react';
import SupportEmpty from './SupportEmpty';

// Simple relative time formatter
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
};

export default function TicketList({ tickets, onSelectTicket }) {
    if (!tickets || tickets.length === 0) {
        return <SupportEmpty />;
    }

    return (
        <div className="ticket-list-wrapper">
            {tickets.map(ticket => (
                <div key={ticket._id} className="ticket-card" onClick={() => onSelectTicket(ticket._id)}>
                    <div className="ticket-header">
                        <span className={`ticket-status status-${ticket.status}`}>{ticket.status}</span>
                        <span className="ticket-id">#{ticket._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="ticket-subject">{ticket.subject}</div>
                    <div className="ticket-date">
                        <i className="fa-regular fa-clock"></i> Updated {formatRelativeTime(ticket.updatedAt || ticket.createdAt)}
                    </div>
                </div>
            ))}
        </div>
    );
}
