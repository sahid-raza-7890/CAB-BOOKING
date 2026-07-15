import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import tripHistoryService from '../../services/tripHistoryService';

export default function InvoiceViewer({ rideId, onClose }) {
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await tripHistoryService.generateInvoice(rideId);
                setInvoice(res.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [rideId]);

    const handleDownload = () => {
        // In a real app, this would trigger a PDF generation or backend download route.
        // We'll mock a simple download action.
        const printContent = document.getElementById('invoice-content').innerHTML;
        const originalContent = document.body.innerHTML;
        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Quick restore of SPA state
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#fff', color: '#000', borderRadius: '4px' }} // Invoices should look like paper
            >
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>Loading invoice...</div>
                ) : error ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}>{error}</div>
                ) : (
                    <>
                        <div id="invoice-content" style={{ padding: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <h1 style={{ margin: 0, color: '#e5b05c' }}>UCAB</h1>
                                    <p style={{ margin: 0, color: '#666' }}>Ride Invoice</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <strong>{invoice.invoiceNumber}</strong><br/>
                                    <span style={{ color: '#666' }}>{new Date(invoice.generatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Base Fare</td>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹{invoice.fareBreakdown.baseFare.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Distance Fare</td>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹{invoice.fareBreakdown.distanceFare.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Time Fare & Wait Time</td>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹{(invoice.fareBreakdown.timeFare + invoice.fareBreakdown.waitingCharge).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>Taxes & Platform Fees</td>
                                        <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right' }}>₹{(invoice.taxes + invoice.fareBreakdown.platformFee).toFixed(2)}</td>
                                    </tr>
                                    {invoice.discounts > 0 && (
                                        <tr>
                                            <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', color: '#10b981' }}>Discounts</td>
                                            <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', textAlign: 'right', color: '#10b981' }}>-${invoice.discounts.toFixed(2)}</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style={{ padding: '16px 0', fontWeight: 'bold', fontSize: '1.2rem' }}>Total</td>
                                        <td style={{ padding: '16px 0', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>₹{invoice.totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>Thank you for riding with UCAB!</p>
                        </div>
                        
                        <div style={{ padding: '1rem', background: '#f5f5f5', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button className="btn-outline" onClick={onClose} style={{ color: '#333', borderColor: '#ccc' }}>Close</button>
                            <button className="btn-primary" onClick={handleDownload}>Download PDF</button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
