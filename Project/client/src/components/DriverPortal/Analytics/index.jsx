import React from 'react';
import { useDriver } from '../DriverContext';

export default function Analytics() {
    return (
        <div className="pp-glass-panel">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>Performance Analytics</h2>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Acceptance Rate</p>
                    <p style={{ color: 'var(--primary-accent)', fontSize: '28px', fontWeight: 'bold' }}>94%</p>
                </div>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Completion Rate</p>
                    <p style={{ color: 'var(--primary-accent)', fontSize: '28px', fontWeight: 'bold' }}>98%</p>
                </div>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Average Rating</p>
                    <p style={{ color: '#FFD400', fontSize: '28px', fontWeight: 'bold' }}>4.92 ★</p>
                </div>
            </div>
            <div style={{ marginTop: '24px', padding: '40px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Detailed charts will appear here after your first week.</p>
            </div>
        </div>
    );
}
