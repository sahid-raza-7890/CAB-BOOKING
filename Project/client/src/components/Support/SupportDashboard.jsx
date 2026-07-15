import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import supportService from '../../services/supportService';
import TicketList from './TicketList';
import TicketDetails from './TicketDetails';
import CreateTicketModal from './CreateTicketModal';
import FAQ from './FAQ';
import SupportSkeleton from './SupportSkeleton';

export default function SupportDashboard() {
    const { user, authenticated } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    useEffect(() => {
        if (!authenticated || !user) return;

        fetchTickets();

        const socket = io('http://localhost:5000');
        const userId = user.userId || user.id;
        socket.emit('register', userId);
        
        const roomName = `support_${userId}`;
        socket.on(roomName, (payload) => {
            if (payload.event === 'ticketCreated') {
                setTickets(prev => [payload.data, ...prev]);
            } else if (payload.event === 'ticketUpdated' || payload.event === 'ticketReply') {
                setTickets(prev => prev.map(t => {
                    if (t._id === payload.data.ticketId) {
                        return { ...t, status: payload.data.status }; // Partial update in list
                    }
                    if (t._id === payload.data._id) {
                        return payload.data;
                    }
                    return t;
                }));
            }
        });

        return () => {
            socket.off(roomName);
            socket.disconnect();
        };
    }, [authenticated, user]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await supportService.getTickets();
            setTickets(data.data || []); // Accessing generic responseFormatter structure
        } catch (error) {
            console.error("Failed to fetch tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (formData) => {
        try {
            const res = await supportService.createTicket(formData);
            setCreateModalOpen(false);
            // Optimistic update handled by socket or we can push it here if socket is slow
            if (!tickets.find(t => t._id === res.data._id)) {
                setTickets([res.data, ...tickets]);
            }
        } catch (error) {
            console.error("Failed to create ticket:", error);
            alert(error.message || "Failed to create ticket");
        }
    };

    if (selectedTicketId) {
        return (
            <TicketDetails 
                ticketId={selectedTicketId} 
                onBack={() => {
                    setSelectedTicketId(null);
                    fetchTickets();
                }} 
            />
        );
    }

    return (
        <div className="support-container">
            <div className="support-header">
                <h1><i className="fa-solid fa-headset"></i> Support Center</h1>
                <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
                    <i className="fa-solid fa-plus"></i> Create Ticket
                </button>
            </div>

            <div className="support-grid">
                <div className="glass-panel">
                    <h2 className="section-title"><i className="fa-solid fa-ticket"></i> My Tickets</h2>
                    {loading ? (
                        <SupportSkeleton />
                    ) : (
                        <TicketList tickets={tickets} onSelectTicket={setSelectedTicketId} />
                    )}
                </div>

                <div className="support-sidebar">
                    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                        <h2 className="section-title"><i className="fa-solid fa-address-book"></i> Contact Us</h2>
                        <div className="contact-options">
                            <div className="contact-card">
                                <i className="fa-solid fa-envelope"></i>
                                <div>
                                    <h4>Email Support</h4>
                                    <p>support@ucab.com</p>
                                </div>
                            </div>
                            <div className="contact-card">
                                <i className="fa-solid fa-phone"></i>
                                <div>
                                    <h4>Call Us</h4>
                                    <p>1800-UCAB-HELP</p>
                                </div>
                            </div>
                            <div className="contact-card">
                                <i className="fa-brands fa-whatsapp"></i>
                                <div>
                                    <h4>WhatsApp</h4>
                                    <p>+91 98765 43210</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="glass-panel">
                        <FAQ />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateTicketModal 
                        onClose={() => setCreateModalOpen(false)} 
                        onSubmit={handleCreateTicket} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
