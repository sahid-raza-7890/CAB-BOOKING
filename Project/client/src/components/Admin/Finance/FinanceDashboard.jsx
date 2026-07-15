import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminContext } from '../../../context/AdminContext';
import './Finance.css';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtCur = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

export default function FinanceDashboard() {
  const {
    financeDashboard, payments, passengerWallets, driverWallets,
    transactions, settlements, earnings, commissions, loadingFinance, errorFinance,
    fetchFinanceDashboard, fetchPayments, fetchPassengerWallets, fetchDriverWallets,
    fetchTransactions, fetchSettlements, fetchEarningsReport, fetchCommissionReport,
    refundPayment, retryPayment, adjustWallet, releaseSettlement
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview'); 
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Wallet adjustment state
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('Credit');
  const [adjustRemarks, setAdjustRemarks] = useState('');

  // Refund remarks state
  const [refundRemarks, setRefundRemarks] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

  const updateUrl = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setLocalSearch('');
    setStatusFilter('All');
    updateUrl({ tab, search: '', status: 'All' });
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    updateUrl({ status });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== searchQuery) {
        setSearchQuery(localSearch);
        updateUrl({ search: localSearch });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'overview') fetchFinanceDashboard();
    if (activeTab === 'payments') fetchPayments({ status: statusFilter, search: searchQuery });
    if (activeTab === 'passenger-wallets') fetchPassengerWallets({ search: searchQuery });
    if (activeTab === 'driver-wallets') fetchDriverWallets({ search: searchQuery });
    if (activeTab === 'ledger') fetchTransactions();
    if (activeTab === 'settlements') fetchSettlements();
    if (activeTab === 'earnings') fetchEarningsReport();
    if (activeTab === 'commissions') fetchCommissionReport();
  }, [activeTab, searchQuery, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleWalletAdjustment = async () => {
    if (!adjustAmount || parseFloat(adjustAmount) <= 0) {
      showToast('Please enter a valid adjustment amount', '#FF4B4B');
      return;
    }
    setActionLoading(true);
    const res = await adjustWallet(selectedWallet?._id, {
      amount: parseFloat(adjustAmount),
      type: adjustType,
      remarks: adjustRemarks
    });
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast('Wallet balance adjusted successfully');
      setSelectedWallet(null);
      setAdjustAmount('');
      setAdjustRemarks('');
      if (activeTab === 'passenger-wallets') fetchPassengerWallets({ search: searchQuery });
      else fetchDriverWallets({ search: searchQuery });
    }
  };

  const handleRefund = async () => {
    setActionLoading(true);
    const res = await refundPayment(selectedPayment?._id, refundRemarks);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast('Refund processed successfully');
      setSelectedPayment(null);
      setRefundRemarks('');
      fetchPayments({ status: statusFilter, search: searchQuery });
    }
  };

  const handleRetry = async (paymentId) => {
    setActionLoading(true);
    const res = await retryPayment(paymentId);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast('Payment retry processed successfully');
      fetchPayments({ status: statusFilter, search: searchQuery });
    }
  };

  const handleReleaseSettlement = async (settlementId) => {
    setActionLoading(true);
    const res = await releaseSettlement(settlementId);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast('Settlement funds released successfully');
      fetchSettlements();
    }
  };

  return (
    <div className="fin-root">
      <div className="fin-topbar">
        <div>
          <div className="fin-title">Financial Operations</div>
          <div className="fin-meta">Payments ledger, manual adjustments, settlements & commission audits</div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="fin-stats-grid">
        <div className="fin-stat-card">
          <div>
            <div className="fin-stat-label">Passenger Wallets Total</div>
            <div className="fin-stat-val">{fmtCur(financeDashboard?.passengerTotal)}</div>
          </div>
          <span className="fin-stat-icon">👤</span>
        </div>
        <div className="fin-stat-card">
          <div>
            <div className="fin-stat-label">Driver Wallets Total</div>
            <div className="fin-stat-val">{fmtCur(financeDashboard?.driverTotal)}</div>
          </div>
          <span className="fin-stat-icon">🚕</span>
        </div>
        <div className="fin-stat-card">
          <div>
            <div className="fin-stat-label">Active Wallets</div>
            <div className="fin-stat-val">{financeDashboard?.status?.Active || 0}</div>
          </div>
          <span className="fin-stat-icon">💳</span>
        </div>
        <div className="fin-stat-card">
          <div>
            <div className="fin-stat-label">Frozen Wallets</div>
            <div className="fin-stat-val" style={{ color: '#FF4B4B' }}>{financeDashboard?.status?.Frozen || 0}</div>
          </div>
          <span className="fin-stat-icon" style={{ color: '#FF4B4B' }}>❄</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="fin-tabs">
        <button className={`fin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>Overview</button>
        <button className={`fin-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => handleTabChange('payments')}>Payments</button>
        <button className={`fin-tab ${activeTab === 'passenger-wallets' ? 'active' : ''}`} onClick={() => handleTabChange('passenger-wallets')}>User Wallets</button>
        <button className={`fin-tab ${activeTab === 'driver-wallets' ? 'active' : ''}`} onClick={() => handleTabChange('driver-wallets')}>Driver Wallets</button>
        <button className={`fin-tab ${activeTab === 'settlements' ? 'active' : ''}`} onClick={() => handleTabChange('settlements')}>Settlements</button>
        <button className={`fin-tab ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => handleTabChange('earnings')}>Driver Earnings</button>
        <button className={`fin-tab ${activeTab === 'commissions' ? 'active' : ''}`} onClick={() => handleTabChange('commissions')}>Commissions</button>
        <button className={`fin-tab ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => handleTabChange('ledger')}>Ledger</button>
      </div>

      {/* Filter Inputs (For list sections) */}
      {(activeTab === 'payments' || activeTab === 'passenger-wallets' || activeTab === 'driver-wallets') && (
        <div className="um-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="um-search"
            placeholder={activeTab === 'payments' ? "Search by passenger name..." : "Search account owner name..."}
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
          {activeTab === 'payments' && (
            <select
              className="um-select"
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          )}
        </div>
      )}

      {/* Content grid */}
      <div className="fin-card">
        <div className="fin-table-wrap">
          {loadingFinance ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>⏳ Loading financial data aggregates...</div>
          ) : errorFinance ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#FF4B4B' }}>❌ Error loading details: {errorFinance}</div>
          ) : activeTab === 'overview' ? (
            <div style={{ padding: 20, color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Platform Financial Summary</h3>
              <p>Total passengers balance: <strong style={{ color: '#FFD21F' }}>{fmtCur(financeDashboard?.passengerTotal)}</strong> across <strong>{financeDashboard?.passengerCount || 0}</strong> wallets.</p>
              <p>Total drivers balance: <strong style={{ color: '#FFD21F' }}>{fmtCur(financeDashboard?.driverTotal)}</strong> across <strong>{financeDashboard?.driverCount || 0}</strong> wallets.</p>
              <p style={{ marginTop: 10 }}>Select a tab from above to perform adjustments, inspect transaction details, or process manual settlements.</p>
            </div>
          ) : activeTab === 'payments' ? (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pm => (
                  <tr key={pm?._id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{pm.userId?.name || 'Passenger'}</td>
                    <td style={{ color: '#FFD21F', fontWeight: 800 }}>{fmtCur(pm.amount)}</td>
                    <td>{pm.method}</td>
                    <td>
                      <span className="um-badge" style={{
                        background: pm.status === 'Completed' ? 'rgba(0,210,106,0.15)' : pm.status === 'Failed' ? 'rgba(255,75,75,0.15)' : 'rgba(255,210,31,0.15)',
                        color: pm.status === 'Completed' ? '#00D26A' : pm.status === 'Failed' ? '#FF4B4B' : '#FFD21F'
                      }}>{pm.status}</span>
                    </td>
                    <td>{fmt(pm.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {pm.status === 'Completed' && (
                          <button className="comp-action-btn reject" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => setSelectedPayment(pm)}>Refund</button>
                        )}
                        {pm.status === 'Failed' && (
                          <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleRetry(pm?._id)}>Retry</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'passenger-wallets' || activeTab === 'driver-wallets' ? (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Account Owner</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'passenger-wallets' ? passengerWallets : driverWallets).map(w => {
                  const owner = activeTab === 'passenger-wallets' ? w.user : w.driver;
                  return (
                    <tr key={w?._id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{owner?.name || 'Unknown'}</td>
                      <td>{owner?.email || '—'}</td>
                      <td style={{ color: '#FFD21F', fontWeight: 800 }}>{fmtCur(w.balance)}</td>
                      <td>
                        <span className="um-badge" style={{
                          background: w.status === 'Active' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                          color: w.status === 'Active' ? '#00D26A' : '#FF4B4B'
                        }}>{w.status}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10, maxWidth: 100 }} onClick={() => setSelectedWallet(w)}>Adjust</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : activeTab === 'settlements' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 14 }}>
              <h4 style={{ color: '#fff' }}>Pending Settlements</h4>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Settlement ID</th>
                    <th>Date Period</th>
                    <th>Trips</th>
                    <th>Net Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.pending?.map(s => (
                    <tr key={s?._id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{s.driverId?.name || 'Driver'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{s.settlementNumber}</td>
                      <td>{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</td>
                      <td>{s.totalTrips}</td>
                      <td style={{ color: '#00D26A', fontWeight: 800 }}>{fmtCur(s.finalAmount)}</td>
                      <td>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleReleaseSettlement(s?._id)}>Release Funds</button>
                      </td>
                    </tr>
                  ))}
                  {(!settlements.pending || settlements.pending.length === 0) && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555' }}>No pending settlements to release</td></tr>
                  )}
                </tbody>
              </table>

              <h4 style={{ color: '#fff', marginTop: 14 }}>Released Settlements</h4>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Settlement ID</th>
                    <th>Date Period</th>
                    <th>Released At</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.completed?.map(s => (
                    <tr key={s?._id}>
                      <td>{s.driverId?.name || 'Driver'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{s.settlementNumber}</td>
                      <td>{new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}</td>
                      <td>{fmt(s.processedAt)}</td>
                      <td style={{ color: '#aaa' }}>{fmtCur(s.finalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'earnings' ? (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Driver ID</th>
                  <th>Trips</th>
                  <th>Gross Fares</th>
                  <th>Commission Ded.</th>
                  <th>Tips Paid</th>
                  <th>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map(e => (
                  <tr key={e?._id}>
                    <td style={{ fontFamily: 'monospace' }}>{e?._id}</td>
                    <td>{e.totalTrips}</td>
                    <td>{fmtCur(e.totalGross)}</td>
                    <td style={{ color: '#FF4B4B' }}>{fmtCur(e.totalCommission)}</td>
                    <td style={{ color: '#00D26A' }}>{fmtCur(e.totalTips)}</td>
                    <td style={{ fontWeight: 800, color: '#FFD21F' }}>{fmtCur(e.totalNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'commissions' ? (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Overview</th>
                  <th>Total Completed Fares</th>
                  <th>Estimated Platform Commission (20%)</th>
                  <th>Rides Count</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>Aggregate Platform Commission</td>
                    <td>{fmtCur(c.totalFare)}</td>
                    <td style={{ color: '#FFD21F', fontWeight: 800 }}>{fmtCur(c.estimatedCommission)}</td>
                    <td>{c.count} Completed Rides</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>TXN ID</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Pre-Bal</th>
                  <th>Post-Bal</th>
                  <th>Created By</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx?._id}>
                    <td style={{ fontFamily: 'monospace' }}>{tx.transactionId}</td>
                    <td>{tx.referenceType} ({tx.referenceId})</td>
                    <td style={{ color: tx.type === 'Credit' ? '#00D26A' : '#FF4B4B', fontWeight: 800 }}>
                      {tx.type === 'Credit' ? '+' : '−'}{fmtCur(tx.amount)}
                    </td>
                    <td>{tx.type}</td>
                    <td>{fmtCur(tx.openingBalance)}</td>
                    <td>{fmtCur(tx.closingBalance)}</td>
                    <td>{tx.createdBy}</td>
                    <td>{fmt(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual Wallet Adjustment Modal */}
      {selectedWallet && (
        <div className="fin-modal-overlay">
          <div className="fin-modal">
            <div className="fin-modal-hdr">
              <div className="fin-modal-title">Manual Balance Adjustment</div>
              <button className="ud-close" onClick={() => setSelectedWallet(null)}>×</button>
            </div>
            <div className="fin-modal-body">
              <div className="ud-row">
                <span className="ud-label">Current Balance</span>
                <span className="ud-value gold" style={{ fontWeight: 800 }}>{fmtCur(selectedWallet?.balance)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Adjustment Type</span>
                <select className="fin-select" value={adjustType} onChange={e => setAdjustType(e.target.value)}>
                  <option value="Credit">Credit (Add Funds)</option>
                  <option value="Debit">Debit (Deduct Funds)</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Amount (INR)</span>
                <input className="fin-input" type="number" placeholder="Enter amount to adjust" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Remarks</span>
                <input className="fin-input" placeholder="Specify adjustment reason/notes" value={adjustRemarks} onChange={e => setAdjustRemarks(e.target.value)} />
              </div>
            </div>
            <div className="fin-btn-row">
              <button className="fin-action-btn cancel" onClick={() => setSelectedWallet(null)}>Close</button>
              <button className="fin-action-btn submit" disabled={actionLoading} onClick={handleWalletAdjustment}>Submit Adjustment</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund remarks modal */}
      {selectedPayment && (
        <div className="fin-modal-overlay">
          <div className="fin-modal">
            <div className="fin-modal-hdr">
              <div className="fin-modal-title">Initiate Payment Refund</div>
              <button className="ud-close" onClick={() => setSelectedPayment(null)}>×</button>
            </div>
            <div className="fin-modal-body">
              <div className="ud-row">
                <span className="ud-label">Payment ID</span>
                <span className="ud-value" style={{ fontFamily: 'monospace' }}>{selectedPayment?._id}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Refund Amount</span>
                <span className="ud-value gold" style={{ fontWeight: 800 }}>{fmtCur(selectedPayment?.amount)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Refund Reason / Remarks</span>
                <input className="fin-input" placeholder="Specify the reason for the refund" value={refundRemarks} onChange={e => setRefundRemarks(e.target.value)} />
              </div>
            </div>
            <div className="fin-btn-row">
              <button className="fin-action-btn cancel" onClick={() => setSelectedPayment(null)}>Close</button>
              <button className="comp-action-btn reject" disabled={actionLoading} style={{ flex: 1 }} onClick={handleRefund}>🚫 Confirm Refund</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20,
          background: '#1a1a2e', border: `1px solid ${toast.color}`,
          borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, color: toast.color,
          zIndex: 1200,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
