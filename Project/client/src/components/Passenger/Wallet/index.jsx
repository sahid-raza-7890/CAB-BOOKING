import React, { useState, useEffect } from 'react';
import './Wallet.css';
import WalletDashboard from './WalletDashboard';
import TransactionHistory from './TransactionHistory';
import AddMoneyModal from './AddMoneyModal';
import WithdrawModal from './WithdrawModal';
import PaymentMethods from './PaymentMethods';
import Invoices from './Invoices';
import { getWalletBalance, getWalletTransactions } from '../../services/walletService';

export default function WalletModule() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    const loadWalletData = async () => {
        setLoading(true);
        try {
            const wData = await getWalletBalance();
            setWallet(wData.wallet);
            
            const tData = await getWalletTransactions();
            setTransactions(tData.transactions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWalletData();
    }, []);

    const handleTopUpSuccess = () => {
        setShowAddMoney(false);
        loadWalletData(); // Refresh balances and ledger
    };

    if (loading) {
        return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading Wallet...</div>;
    }

    return (
        <div className="wal-container">
            <div className="wal-left-col">
                <WalletDashboard 
                    wallet={wallet} 
                    onAddMoney={() => setShowAddMoney(true)}
                />
                <PaymentMethods />
            </div>
            <div className="wal-main-col">
                <TransactionHistory transactions={transactions} />
                <Invoices />
            </div>

            {showAddMoney && (
                <AddMoneyModal 
                    onClose={() => setShowAddMoney(false)}
                    onSuccess={handleTopUpSuccess}
                />
            )}
            
            {showWithdraw && (
                <WithdrawModal 
                    onClose={() => setShowWithdraw(false)}
                    onSuccess={() => setShowWithdraw(false)}
                />
            )}
        </div>
    );
}
