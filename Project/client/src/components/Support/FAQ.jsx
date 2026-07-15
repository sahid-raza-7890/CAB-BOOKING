import React, { useState } from 'react';

const FAQ_DATA = [
    {
        category: 'Rides',
        items: [
            { q: "How do I cancel a ride?", a: "You can cancel a ride from the 'Active Ride' screen before the driver arrives. Note that a cancellation fee may apply if the driver is already on the way." },
            { q: "Can I schedule a ride in advance?", a: "Yes, use the 'Schedule Ride' option from the main dashboard to book a ride for a future date and time." }
        ]
    },
    {
        category: 'Payments',
        items: [
            { q: "How do I add money to my wallet?", a: "Go to the Wallet section and click 'Add Funds'. You can use credit/debit cards, UPI, or net banking." },
            { q: "Why was my payment declined?", a: "Payments can be declined due to insufficient funds, expired cards, or network issues. Please try another payment method." }
        ]
    },
    {
        category: 'Account',
        items: [
            { q: "How do I reset my password?", a: "Click on 'Forgot Password' on the login screen, and we will send a reset link to your registered email." }
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
            <h2 className="section-title"><i className="fa-solid fa-circle-question"></i> Frequently Asked Questions</h2>
            
            <input 
                type="text" 
                className="faq-search" 
                placeholder="Search for answers..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="faq-list">
                {filteredData.length > 0 ? filteredData.map((category, catIndex) => (
                    <div key={category.category} style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#e5b05c', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {category.category}
                        </h4>
                        {category.items.map((item, itemIndex) => {
                            const globalIndex = `${catIndex}-${itemIndex}`;
                            const isOpen = openIndex === globalIndex;
                            return (
                                <div key={globalIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                                    <div className="faq-question" onClick={() => toggleFaq(globalIndex)}>
                                        <span>{item.q}</span>
                                        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
                                    </div>
                                    {isOpen && <div className="faq-answer">{item.a}</div>}
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
