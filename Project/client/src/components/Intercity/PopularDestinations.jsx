import React from 'react';

const DESTINATIONS = [
    'Pune',
    'Lonavala',
    'Mahabaleshwar',
    'Nashik',
    'Surat',
    'Goa',
    'Alibaug'
];

export default function PopularDestinations({ onSelect }) {
    return (
        <div style={{ marginBottom: '24px' }}>
            <h4 style={{ color: '#888', fontSize: '13px', margin: '0 0 12px 0' }}>Popular Outstation Routes from Mumbai</h4>
            <div className="ic-dest-scroll">
                {DESTINATIONS.map(dest => (
                    <div 
                        key={dest} 
                        className="ic-dest-chip"
                        onClick={() => onSelect(dest)}
                    >
                        {dest}
                    </div>
                ))}
            </div>
        </div>
    );
}
