import React, { useEffect, useState } from 'react';
import DriverDocumentService from '../../../services/driverDocumentService';
import '../DriverPortal.css';

const DocumentsDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [compliance, setCompliance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [docsRes, compRes] = await Promise.all([
                DriverDocumentService.getDocuments(),
                DriverDocumentService.getComplianceStatus()
            ]);
            setDocuments(docsRes.data || docsRes || []);
            setCompliance(compRes.data || compRes || null);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (docType) => {
        // Placeholder for real upload logic
        alert('Upload functionality to be integrated for ' + docType);
    };

    const requiredDocs = [
        { type: 'Driving License', key: 'License' },
        { type: 'Vehicle Registration', key: 'RC' },
        { type: 'PAN Card', key: 'PAN' }
    ];

    if (loading) return <div className="dp-content" style={{ padding: '20px' }}>Loading Documents...</div>;

    const getDocStatus = (typeKey, typeLabel) => {
        const doc = documents.find(d => d.type === typeKey || d.documentType === typeKey || d.type === typeLabel || d.documentType === typeLabel);
        if (!doc) return { status: 'Missing', color: '#FF4B4B', bg: 'rgba(255,75,75,0.12)' };
        if (doc.status === 'Approved') return { status: 'Approved', color: '#00D26A', bg: 'rgba(0,210,106,0.12)' };
        if (doc.status === 'Rejected') return { status: 'Rejected', color: '#FF4B4B', bg: 'rgba(255,75,75,0.12)' };
        return { status: 'Pending', color: '#FFD21F', bg: 'rgba(255,210,31,0.12)' };
    };

    return (
        <div className="dp-content">
            <h2 className="dp-section-title" style={{ fontSize: '20px', marginBottom: '16px' }}>Compliance Documents</h2>

            {compliance && !compliance.isCompliant && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.2)', borderRadius: '8px', color: '#FF4B4B', marginBottom: '16px', fontSize: '13px', fontWeight: '600' }}>
                    <span style={{ marginRight: '8px' }}>⚠️</span> Action Required: Please upload missing or rejected documents to stay compliant.
                </div>
            )}

            <div className="dp-row3">
                {requiredDocs.map(docReq => {
                    const doc = documents.find(d => d.type === docReq.key || d.documentType === docReq.key || d.type === docReq.type || d.documentType === docReq.type);
                    const statusInfo = getDocStatus(docReq.key, docReq.type);
                    
                    return (
                        <div key={docReq.key} className="dp-card">
                            <div className="dp-card-header">
                                <span className="dp-card-title">{docReq.type}</span>
                                <span className="dp-status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                    {statusInfo.status}
                                </span>
                            </div>
                            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%', height: '100px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'
                                }}>
                                    {doc ? '📄' : '📤'}
                                </div>
                                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                                    {doc && (
                                        <button className="dp-action-btn" style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>
                                            Preview
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleUpload(docReq.key)}
                                        className="dp-action-btn" 
                                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(255,210,31,0.1)', color: '#FFD21F', fontSize: '11px', fontWeight: 'bold', height: 'auto', margin: 0 }}
                                    >
                                        {doc ? 'Replace' : 'Upload'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DocumentsDashboard;
