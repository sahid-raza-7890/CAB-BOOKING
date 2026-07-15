import React from 'react';
import { useDriver } from '../DriverContext';

const VerificationTimeline = () => {
    const { documents } = useDriver();

    const getIcon = (status) => {
        switch (status) {
            case 'Approved': return <i className="fas fa-check-circle" style={{ color: '#00ff88' }}></i>;
            case 'Rejected': return <i className="fas fa-times-circle" style={{ color: '#ff4444' }}></i>;
            case 'Pending': return <i className="fas fa-clock" style={{ color: '#fbbf24' }}></i>;
            default: return <i className="fas fa-circle" style={{ color: '#64748b' }}></i>;
        }
    };

    return (
        <div className="profile-panel">
            <h4 className="section-title"><i className="fas fa-history"></i> Verification Timeline</h4>
            
            {documents.length === 0 ? (
                <p style={{ color: '#94a3b8', margin: '16px 0 0 0' }}>No verification history found.</p>
            ) : (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {documents.slice(0, 5).map(doc => (
                        <div key={doc._id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '20px', marginTop: '2px' }}>
                                {getIcon(doc.status)}
                            </div>
                            <div>
                                <h5 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '14px' }}>
                                    {doc.documentType} {doc.status}
                                </h5>
                                <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                                    {doc.verifiedAt 
                                        ? new Date(doc.verifiedAt).toLocaleString() 
                                        : new Date(doc.uploadedAt).toLocaleString()
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VerificationTimeline;
