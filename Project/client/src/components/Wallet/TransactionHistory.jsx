import React from 'react';

export default function TransactionHistory({ transactions }) {
    
    if (!transactions || transactions.length === 0) {
        return (
            <div className="wal-card">
                <h2 className="wal-card-title">Transaction History</h2>
                <div style={{ padding: '32px', textAlign: 'center', color: '#888' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
                    No transactions yet.
                </div>
            </div>
        );
    }

    return (
        <div className="wal-card">
            <h2 className="wal-card-title">Transaction History</h2>
            <div className="wal-ledger">
                {transactions.map(txn => (
                    <div className="wal-txn" key={txn.transactionId}>
                        <div className="wal-txn-left">
                            <div className={`wal-txn-icon ${txn.type}`}>
                                {txn.type === 'Credit' ? '↓' : '↑'}
                            </div>
                            <div>
                                <div className="wal-txn-title">
                                    {txn.referenceType}
                                </div>
                                <div className="wal-txn-date">
                                    {new Date(txn.createdAt).toLocaleString()} • {txn.transactionId}
                                </div>
                            </div>
                        </div>
                        <div className={`wal-txn-amount ${txn.type}`}>
                            {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
