import React, { useState, useEffect } from 'react';
import * as rideService from '../../services/rideService';

function ReceiptModal({ rideId, onClose }) {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceipt();
    }, [rideId]);

    const fetchReceipt = async () => {
        try {
            const data = await rideService.getReceipt(rideId);
            setReceipt(data);
        } catch (err) {
            console.error('Error fetching receipt:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!receipt) return null;

    return (
        <div className="mr-modal-overlay" onClick={onClose}>
            <div className="mr-modal-content" onClick={e => e.stopPropagation()} style={{ background: '#fff', color: '#000', borderRadius: '8px', maxWidth: '400px' }}>
                <div style={{ padding: '30px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px dashed #ccc', paddingBottom: '20px' }}>
                        <h2 style={{ margin: '0 0 8px', letterSpacing: '4px' }}>UCAB</h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>TAX INVOICE</p>
                    </div>
                    
                    <div style={{ fontSize: '13px', color: '#333', marginBottom: '20px', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Invoice No:</span> <strong>{receipt.invoiceNumber}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Date:</span> <strong>{new Date(receipt.date).toLocaleDateString()}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Driver:</span> <strong>{receipt.driverName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Vehicle:</span> <strong>{receipt.vehicleType}</strong>
                        </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#333', marginBottom: '20px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <div style={{ marginBottom: '8px' }}><strong>Pickup:</strong><br/>{receipt.pickup}</div>
                        <div><strong>Dropoff:</strong><br/>{receipt.dropoff}</div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span>Base Fare</span> <span>₹{receipt.fareBreakdown?.baseFare?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span>Distance Fare</span> <span>₹{receipt.fareBreakdown?.distanceFare?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span>Taxes & Fees</span> <span>₹{receipt.fareBreakdown?.taxes?.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #000', fontSize: '18px', fontWeight: 'bold' }}>
                            <span>Total Paid</span> <span>₹{receipt.fareBreakdown?.total?.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginTop: '24px' }}>
                        Paid via {receipt.paymentMethod} • Status: {receipt.paymentStatus}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                        <button className="mr-btn" style={{ flex: 1, background: '#eee', color: '#000', justifyContent: 'center' }} onClick={onClose}>Close</button>
                        <button className="mr-btn mr-btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => window.print()}>Print</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiptModal;
