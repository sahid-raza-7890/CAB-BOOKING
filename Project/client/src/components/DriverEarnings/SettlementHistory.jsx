import React from 'react';

export default function SettlementHistory({ settlements }) {
    if (!settlements || settlements.length === 0) {
        return <div style={{ color: '#888', padding: '20px' }}>No settlement history found.</div>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table className="de-table">
                <thead>
                    <tr>
                        <th>Settlement #</th>
                        <th>Period</th>
                        <th>Trips</th>
                        <th>Gross</th>
                        <th>Deductions</th>
                        <th>Final Settled</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {settlements.map(item => (
                        <tr key={item._id}>
                            <td>{item.settlementNumber}</td>
                            <td>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</td>
                            <td>{item.totalTrips}</td>
                            <td>₹{item.grossAmount.toFixed(2)}</td>
                            <td style={{ color: '#ef4444' }}>-₹{(item.commission + item.penalties).toFixed(2)}</td>
                            <td style={{ fontWeight: 'bold' }}>₹{item.finalAmount.toFixed(2)}</td>
                            <td>
                                <span className={`de-badge ${item.status === 'Pending' ? 'Pending' : 'Credited'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
