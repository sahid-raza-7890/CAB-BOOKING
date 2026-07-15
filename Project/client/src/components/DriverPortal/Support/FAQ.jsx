import React, { useState } from 'react';

const FAQ_DATA = [
    {
        category: 'Earnings & Payments',
        items: [
            { q: "When do I receive my payouts?", a: "Payouts are processed weekly on Tuesdays for the previous Monday-Sunday cycle. Instant payout is also available for a small fee." },
            { q: "Why was my toll not reimbursed?", a: "Tolls are automatically added to the fare if you pass through an electronic toll gate. If it was missed, please submit a toll receipt via a support ticket." }
        ]
    },
    {
        category: 'Rides & App Usage',
        items: [
            { q: "How do I dispute a rider's rating?", a: "We monitor patterns in ratings. If a rider consistently leaves unfair reviews, those are automatically filtered out. For severe disputes, create a ticket." },
            { q: "What happens if I cancel too many rides?", a: "High cancellation rates can lead to temporary account suspension or losing access to Priority Dispatch bonuses. Please only accept rides you intend to complete." },
            { q: "How does the Destination Filter work?", a: "You can set a destination twice a day to only receive rides heading in your direction. Navigate to Dashboard > Settings to configure it." }
        ]
    },
    {
        category: 'Account & Vehicle',
        items: [
            { q: "How do I update my vehicle documents?", a: "Go to the Documents section in the sidebar. Upload the new documents and wait 24-48 hours for admin approval." },
            { q: "Can I drive multiple vehicles?", a: "Yes, you can add multiple vehicles in the Vehicle tab, but only one can be set to 'Active' at any given time." }
        ]
    }
];

export default function FAQ() {
    const [search, setSearch] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredData = FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.q.toLowerCase().includes(search.toLowerCase()) || 
            item.a.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div>
            <h2 className="support-title" style={{ fontSize: '18px', marginBottom: '16px' }}><i className="fa-solid fa-circle-question"></i> Frequently Asked Questions</h2>
            
            <input 
                type="text" 
                className="ucab-input" 
                style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', marginBottom: '16px' }}
                placeholder="Search for answers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="faq-list">
                {filteredData.length > 0 ? filteredData.map((category, catIndex) => (
                    <div key={category.category} style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#ffd700', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {category.category}
                        </h4>
                        {category.items.map((item, itemIndex) => {
                            const globalIndex = `${catIndex}-${itemIndex}`;
                            const isOpen = openIndex === globalIndex;
                            return (
                                <div key={globalIndex} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' }}>
                                    <div 
                                        style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', color: '#fff' }} 
                                        onClick={() => toggleFaq(globalIndex)}
                                    >
                                        <span>{item.q}</span>
                                        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ color: '#94a3b8' }}></i>
                                    </div>
                                    {isOpen && <div style={{ padding: '0 16px 16px 16px', color: '#94a3b8', fontSize: '14px', lineHeight: '1.5' }}>{item.a}</div>}
                                </div>
                            );
                        })}
                    </div>
                )) : (
                    <div style={{ color: '#888', textAlign: 'center', padding: '2rem 0' }}>
                        No FAQs found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
