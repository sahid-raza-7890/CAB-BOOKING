import React, { useEffect, useRef } from 'react';
import './Support.css';
import TicketReply from './TicketReply';
import DriverSupportService from '../../../services/driverSupportService';
import { useDriver } from '../DriverContext';

const TicketDetails = ({ ticket, onCloseTicket, onRefresh }) => {
    const { driver } = useDriver();
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [ticket]);

    const handleClose = async () => {
        if (!window.confirm('Are you sure you want to close this ticket?')) return;
        try {
            await DriverSupportService.closeTicket(ticket._id);
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    if (!ticket) {
        return (
            <div className="support-panel" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-comments" style={{ fontSize: '48px', color: '#334155', marginBottom: '16px' }}></i>
                <p style={{ color: '#94a3b8' }}>Select a ticket to view details</p>
            </div>
        );
    }

    return (
        <div className="support-panel" style={{ padding: 0 }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{ticket.subject}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>Ticket #{ticket._id.slice(-6).toUpperCase()}</span>
                </div>
                {ticket.status !== 'Closed' && (
                    <button className="ucab-btn" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', fontSize: '13px' }} onClick={handleClose}>
                        Close Ticket
                    </button>
                )}
            </div>

            <div className="chat-container">
                <div className="chat-messages" ref={chatRef}>
                    <div className="chat-message driver">
                        <p style={{ margin: 0 }}>{ticket.description}</p>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                            {new Date(ticket.createdAt).toLocaleTimeString()}
                        </div>
                    </div>

                    {(ticket.replies || []).map(reply => (
                        <div key={reply._id} className={`chat-message ${reply.senderModel === 'Driver' ? 'driver' : 'agent'}`}>
                            <p style={{ margin: 0 }}>{reply.message}</p>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: reply.senderModel === 'Driver' ? 'right' : 'left' }}>
                                {new Date(reply.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>

                <TicketReply ticket={ticket} onReply={onRefresh} />
            </div>
        </div>
    );
};

export default TicketDetails;
