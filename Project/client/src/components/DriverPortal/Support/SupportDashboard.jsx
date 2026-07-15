import React, { useEffect, useState, useCallback } from 'react';
import './Support.css';
import DriverSupportService from '../../../services/driverSupportService';
import TicketList from './TicketList';
import TicketDetails from './TicketDetails';
import CreateTicketModal from './CreateTicketModal';
import FAQ from './FAQ';
import { SupportSkeleton } from './SupportSkeleton';
import { useDriver } from '../DriverContext';

const SupportDashboard = () => {
    const { supportTickets, setSupportTickets, activeTicket, setActiveTicket } = useDriver();
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchTickets = useCallback(async () => {
        try {
            const res = await DriverSupportService.getTickets();
            setSupportTickets(res.data || []);
            
            // If active ticket exists, refresh its data
            if (activeTicket) {
                const updated = res.data.find(t => t._id === activeTicket._id);
                if (updated) setActiveTicket(updated);
            }
        } catch (err) {
            console.error('Failed to fetch support tickets', err);
        } finally {
            setLoading(false);
        }
    }, [activeTicket, setActiveTicket, setSupportTickets]);

    useEffect(() => {
        setLoading(true);
        fetchTickets();
    }, [fetchTickets]);

    const handleTicketCreated = () => {
        setShowCreateModal(false);
        fetchTickets();
    };

    if (loading) return <SupportSkeleton />;

    return (
        <div className="support-dashboard" style={{ height: '100%', overflowY: 'auto' }}>
            <div className="support-header">
                <h2 className="support-title">
                    <i className="fas fa-headset"></i> Support Center
                </h2>
                <button className="ucab-btn primary" onClick={() => setShowCreateModal(true)}>
                    <i className="fas fa-plus"></i> New Ticket
                </button>
            </div>

            <div className="support-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
                {activeTicket ? (
                    <TicketDetails 
                        ticket={activeTicket} 
                        onRefresh={fetchTickets}
                    />
                ) : (
                    <div className="support-panel" style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#fff' }}><i className="fas fa-ticket-alt"></i> My Tickets</h3>
                        <TicketList 
                            tickets={supportTickets} 
                            activeTicket={activeTicket}
                            onSelectTicket={setActiveTicket}
                        />
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="support-panel" style={{ padding: '20px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#fff' }}><i className="fas fa-address-book"></i> Contact Us</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                <i className="fas fa-envelope" style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>Email Support</div>
                                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>drivers@ucab.com</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                <i className="fas fa-phone" style={{ fontSize: '24px', color: '#10b981' }}></i>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>Call Us</div>
                                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>1800-UCAB-DRV</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                                <i className="fab fa-whatsapp" style={{ fontSize: '24px', color: '#25D366' }}></i>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>WhatsApp</div>
                                    <div style={{ color: '#94a3b8', fontSize: '14px' }}>+91 98765 12345</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="support-panel" style={{ padding: '20px' }}>
                        <FAQ />
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateTicketModal 
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleTicketCreated}
                />
            )}
        </div>
    );
};

export default SupportDashboard;
