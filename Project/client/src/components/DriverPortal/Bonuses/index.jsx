import React, { useState, useEffect } from 'react';
import { useDriver } from '../DriverContext';

export default function Bonuses() {
    return (
        <div className="pp-glass-panel">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>Bonuses & Incentives</h2>
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '20px', background: 'var(--badge-bg)', borderRadius: '12px', border: '1px solid var(--primary-accent)' }}>
                    <h3 style={{ color: 'var(--primary-accent)', marginBottom: '8px' }}>Weekly Quest</h3>
                    <p style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 'bold' }}>Complete 10 rides for ₹50</p>
                    <div style={{ marginTop: '12px', height: '8px', background: 'var(--card-border)', borderRadius: '4px' }}>
                        <div style={{ width: '40%', height: '100%', background: 'var(--primary-accent)', borderRadius: '4px' }}></div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>4 / 10 rides completed</p>
                </div>
                <div style={{ padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Active Surge</h3>
                    <p style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>1.5x Multiplier</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Downtown Zone</p>
                </div>
            </div>
        </div>
    );
}
