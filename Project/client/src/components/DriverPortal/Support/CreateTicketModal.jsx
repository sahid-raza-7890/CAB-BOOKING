import React, { useState } from 'react';
import './Support.css';
import DriverSupportService from '../../../services/driverSupportService';

const CreateTicketModal = ({ onClose, onCreated }) => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Ride');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await DriverSupportService.createTicket({ subject, category, description });
            onCreated();
        } catch (err) {
            console.error(err);
            alert('Failed to create ticket');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, color: '#ffd700' }}>Create Support Ticket</h3>
                    <button className="action-btn" onClick={onClose} style={{ fontSize: '20px' }}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="ucab-form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Category</label>
                        <select 
                            className="ucab-input" 
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="Ride">Ride Issue</option>
                            <option value="Payment">Payment & Earnings</option>
                            <option value="Account">Account Management</option>
                            <option value="Technical">App Issue</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="ucab-form-group" style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Subject</label>
                        <input 
                            type="text" 
                            className="ucab-input" 
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            placeholder="Brief description of the issue"
                        />
                    </div>

                    <div className="ucab-form-group" style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Details</label>
                        <textarea 
                            className="ucab-input" 
                            style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', minHeight: '100px' }}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            placeholder="Please provide as much detail as possible..."
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="ucab-btn" style={{ background: 'transparent', border: '1px solid #64748b', color: '#94a3b8' }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="ucab-btn primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
