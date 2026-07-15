import React, { useState, useEffect } from 'react';

export default function PaymentMethods() {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCard, setNewCard] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });

    const fetchPaymentMethods = async () => {
        try {
            const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
            const res = await fetch('http://localhost:5000/api/users/payment-settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPaymentMethods(data.paymentMethods || []);
            }
        } catch (error) {
            console.error("Failed to fetch payment methods", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const handleAddCard = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        const cleanNum = newCard.cardNumber.replace(/\s+/g, '');
        const brand = cleanNum.startsWith('5') ? 'Mastercard' : cleanNum.startsWith('3') ? 'Amex' : 'Visa';
        const maskedNum = `•••• •••• •••• ${cleanNum.slice(-4)}`;

        const cardObject = {
            cardholderName: newCard.cardholderName,
            cardNumber: maskedNum,
            expiryDate: newCard.expiryDate,
            cardBrand: brand,
            isDefault: paymentMethods.length === 0
        };

        const updatedMethods = [...paymentMethods, cardObject];

        try {
            const res = await fetch('http://localhost:5000/api/users/payment-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ paymentMethods: updatedMethods })
            });
            if (res.ok) {
                const data = await res.json();
                setPaymentMethods(data.paymentMethods);
                setNewCard({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
                alert("Card added successfully!");
            }
        } catch (error) {
            console.error("Failed to add card", error);
        }
    };

    const handleRemoveCard = async (indexToRemove) => {
        if (!window.confirm("Remove this card?")) return;
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        const updatedMethods = paymentMethods.filter((_, idx) => idx !== indexToRemove);

        try {
            const res = await fetch('http://localhost:5000/api/users/payment-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ paymentMethods: updatedMethods })
            });
            if (res.ok) {
                const data = await res.json();
                setPaymentMethods(data.paymentMethods);
            }
        } catch (error) {
            console.error("Failed to remove card", error);
        }
    };

    if (loading) return <div>Loading payment methods...</div>;

    return (
        <div className="wal-card" style={{ marginTop: '20px' }}>
            <h2 className="wal-card-title">Payment Methods</h2>
            <div style={{ marginBottom: '20px' }}>
                {paymentMethods.length === 0 ? <p>No payment methods saved.</p> : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {paymentMethods.map((method, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ccc' }}>
                                <div>
                                    <strong>{method.cardBrand}</strong> ending in {method.cardNumber.slice(-4)}
                                    <br />
                                    <small>Expires: {method.expiryDate}</small>
                                </div>
                                <button className="btn-outline" onClick={() => handleRemoveCard(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            <h4 style={{ marginBottom: '10px' }}>Add New Card</h4>
            <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="text" placeholder="Cardholder Name" value={newCard.cardholderName} onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} />
                <input type="text" placeholder="Card Number" value={newCard.cardNumber} onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="MM/YY" value={newCard.expiryDate} onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} />
                    <input type="text" placeholder="CVV" value={newCard.cvv} onChange={(e) => setNewCard({...newCard, cvv: e.target.value})} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} />
                </div>
                <button type="submit" className="btn-primary">Add Card</button>
            </form>
        </div>
    );
}
