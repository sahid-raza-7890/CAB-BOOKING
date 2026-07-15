import React from 'react';
import './Support.css';
import TicketCard from './TicketCard';
import { SupportEmpty } from './SupportSkeleton';

const TicketList = ({ tickets, activeTicket, onSelectTicket }) => {
    if (!tickets || tickets.length === 0) {
        return <SupportEmpty />;
    }

    return (
        <div className="ticket-list-container">
            {tickets.map(ticket => (
                <TicketCard 
                    key={ticket._id} 
                    ticket={ticket} 
                    isActive={activeTicket?._id === ticket._id}
                    onClick={onSelectTicket}
                />
            ))}
        </div>
    );
};

export default TicketList;
