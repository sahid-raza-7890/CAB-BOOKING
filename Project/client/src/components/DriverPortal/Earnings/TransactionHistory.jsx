import React from 'react';
import { useDriver } from '../DriverContext';

const TransactionCard = ({ tx }) => {
    const isCredit = tx.type === 'Credit';
    
    // Format date beautifully
    const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let title = 'Transaction';
    let icon = 'exchange-alt';

    if (tx.referenceType === 'RideEarning' || tx.referenceType === 'Ride') {
        title = 'Ride Fare';
        icon = 'car';
    } else if (tx.referenceType === 'Bonus' || tx.referenceType === 'DriverBonus') {
        title = 'Quest Bonus';
        icon = 'gift';
    } else if (tx.referenceType === 'Withdrawal') {
        title = 'Bank Transfer';
        icon = 'building';
    }

    return (
        <div className="transaction-item">
            <div className="tx-left">
                <div className={`tx-icon ${isCredit ? 'credit' : 'debit'}`}>
                    <i className={`fas fa-${icon}`}></i>
                </div>
                <div className="tx-details">
                    <p className="tx-title">{title}</p>
                    <p className="tx-date">{dateStr}</p>
                </div>
            </div>
            <div className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
                {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
            </div>
        </div>
    );
};

const TransactionHistory = () => {
    const { transactions } = useDriver();

    if (!transactions || transactions.length === 0) {
        return (
            <div className="earnings-card">
                <div className="card-header">
                    <h3 className="card-title">Recent Transactions</h3>
                    <div className="card-icon">
                        <i className="fas fa-history"></i>
                    </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: '24px 0' }}>
                    No recent transactions found.
                </p>
            </div>
        );
    }

    return (
        <div className="earnings-card">
            <div className="card-header">
                <h3 className="card-title">Recent Transactions</h3>
                <div className="card-icon">
                    <i className="fas fa-history"></i>
                </div>
            </div>
            <div className="transaction-list">
                {transactions.slice(0, 5).map((tx) => (
                    <TransactionCard key={tx._id || tx.transactionId} tx={tx} />
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
