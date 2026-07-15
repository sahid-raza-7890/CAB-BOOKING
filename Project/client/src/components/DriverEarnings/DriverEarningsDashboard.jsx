import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { fetchEarningsSummary, fetchEarningsHistory, fetchSettlements, fetchIncentives } from '../../services/driverEarningsService';
import { SocketContext } from "../../context/SocketContext";
import SummaryCards from './SummaryCards';
import TripTable from './TripTable';
import SettlementHistory from './SettlementHistory';
import QuestProgress from './QuestProgress';
import './DriverEarnings.css';

export default function DriverEarningsDashboard() {
    const [summary, setSummary] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [history, setHistory] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [incentives, setIncentives] = useState([]);
    const [activeTab, setActiveTab] = useState('summary');
    const { socket } = useContext(SocketContext);

    const loadData = async () => {
        try {
            const [sumData, histData, setData, incData] = await Promise.all([
                fetchEarningsSummary(),
                fetchEarningsHistory(),
                fetchSettlements(),
                fetchIncentives()
            ]);
            
            setSummary(sumData.summary);
            setWallet(sumData.wallet);
            setHistory(histData.earnings);
            setSettlements(setData.settlements);
            setIncentives(incData.incentives);
        } catch (err) {
            console.error('Failed to load earnings dashboard data:', err);
        }
    };

    useEffect(() => {
        loadData();

        if (socket) {
            socket.on('earningUpdated', () => {
                loadData();
            });
            socket.on('walletUpdated', () => {
                loadData();
            });
            socket.on('bonusUnlocked', () => {
                loadData();
            });
        }

        return () => {
            if (socket) {
                socket.off('earningUpdated');
                socket.off('walletUpdated');
                socket.off('bonusUnlocked');
            }
        };
    }, [socket]);

    return (
        <motion.div 
            className="de-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="de-title">
                Driver Earnings & Wallet
                <button className="de-btn" onClick={() => alert('Withdrawal request initiated!')}>
                    Withdraw Funds
                </button>
            </div>

            <div className="de-panel">
                <SummaryCards summary={summary} wallet={wallet} />
            </div>

            <div className="de-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div 
                        onClick={() => setActiveTab('summary')}
                        style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: activeTab === 'summary' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'summary' ? '#D4AF37' : '#a0a0a0' }}>
                        Trip Earnings
                    </div>
                    <div 
                        onClick={() => setActiveTab('quests')}
                        style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: activeTab === 'quests' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'quests' ? '#D4AF37' : '#a0a0a0' }}>
                        Active Quests
                    </div>
                    <div 
                        onClick={() => setActiveTab('settlements')}
                        style={{ padding: '16px 24px', cursor: 'pointer', borderBottom: activeTab === 'settlements' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'settlements' ? '#D4AF37' : '#a0a0a0' }}>
                        Settlements
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {activeTab === 'summary' && <TripTable history={history} />}
                    {activeTab === 'quests' && <QuestProgress incentives={incentives} />}
                    {activeTab === 'settlements' && <SettlementHistory settlements={settlements} />}
                </div>
            </div>
        </motion.div>
    );
}
