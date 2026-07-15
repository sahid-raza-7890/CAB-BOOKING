import React from 'react';
import { useDriver } from '../DriverContext';

const ComplianceStatusCard = () => {
    const { complianceStatus } = useDriver();

    if (!complianceStatus) return null;

    const isVerified = complianceStatus.isCompliant;
    const percentage = complianceStatus.percentage || 0;
    const color = isVerified ? '#00ff88' : '#fbbf24';
    
    return (
        <div className="profile-panel" style={{ flex: 1 }}>
            <h4 className="section-title"><i className="fas fa-shield-alt"></i> Compliance Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '16px' }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    border: `8px solid ${color}`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', fontWeight: 'bold', color: '#fff'
                }}>
                    {percentage}%
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: isVerified ? '#00ff88' : '#fbbf24' }}>
                        {isVerified ? 'Fully Verified' : 'Action Required'}
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
                        {complianceStatus.approvedCount} of {complianceStatus.totalRequired} required documents approved.
                        {complianceStatus.missing && complianceStatus.missing.length > 0 && (
                            <span style={{ display: 'block', marginTop: '4px', color: '#ff4444' }}>
                                Missing: {complianceStatus.missing.join(', ')}
                            </span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComplianceStatusCard;
