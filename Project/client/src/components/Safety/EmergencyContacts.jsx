import React from 'react';

export default function EmergencyContacts() {
    // Mock contacts. In a real app, this would come from user profile.
    const contacts = [
        { name: 'Mom', phone: '+1 234 567 8900' },
        { name: 'Partner', phone: '+1 987 654 3210' }
    ];

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e5b05c' }}>
                <i className="fa-solid fa-address-book"></i> Emergency Contacts
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contacts.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{c.name}</div>
                            <div style={{ color: '#888', fontSize: '0.8rem' }}>{c.phone}</div>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#e5b05c', cursor: 'pointer' }}>
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    </div>
                ))}
            </div>
            <button className="btn-outline" style={{ width: '100%', marginTop: '1rem', padding: '6px' }}>
                + Add Contact
            </button>
        </div>
    );
}
