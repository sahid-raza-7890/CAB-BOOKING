import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CreateTicketModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'Ride',
        priority: 'Normal',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, color: '#e5b05c' }}>Create Support Ticket</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Subject</label>
                        <input 
                            type="text" 
                            name="subject"
                            className="form-control" 
                            placeholder="Brief description of the issue" 
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Category</label>
                            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                                <option value="Ride">Ride Issue</option>
                                <option value="Payment">Payment & Wallet</option>
                                <option value="Account">Account Management</option>
                                <option value="Technical">App / Technical</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Priority</label>
                            <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            name="description"
                            className="form-control" 
                            placeholder="Please provide as much detail as possible..."
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
