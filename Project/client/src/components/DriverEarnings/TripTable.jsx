import React from 'react';

export default function TripTable({ history }) {
    if (!history || history.length === 0) {
        return <div style={{ color: '#888', padding: '20px' }}>No trip earnings found.</div>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="de-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Gross Fare</th>
                        <th>Commission</th>
                        <th>Platform Fee</th>
                        <th>Bonus / Tip</th>
                        <th>Net Earning</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item._id}>
                            <td>{new Date(item.completedAt).toLocaleString()}</td>
                            <td>{item.rideType}</td>
                            <td>₹{item.grossFare.toFixed(2)}</td>
                            <td style={{ color: '#ef4444' }}>-₹{item.commission.toFixed(2)}</td>
                            <td style={{ color: '#ef4444' }}>-₹{item.platformFee.toFixed(2)}</td>
                            <td style={{ color: '#22c55e' }}>+₹{(item.bonus + item.incentive + item.tip).toFixed(2)}</td>
                            <td style={{ fontWeight: 'bold' }}>₹{item.netEarning.toFixed(2)}</td>
                            <td>
                                <span className={`de-badge ${item.paymentStatus}`}>
                                    {item.paymentStatus}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
