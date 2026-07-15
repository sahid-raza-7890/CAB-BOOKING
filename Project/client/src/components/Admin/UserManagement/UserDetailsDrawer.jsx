import React, { useState, useContext } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './UserManagement.css';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const fmtCur = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

function statusStyle(status) {
  const map = {
    Active:    { bg: 'rgba(0,210,106,0.15)',  color: '#00D26A' },
    Suspended: { bg: 'rgba(255,75,75,0.15)',  color: '#FF4B4B' },
    Pending:    { bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
    Inactive:  { bg: 'rgba(255,255,255,0.08)', color: '#aaa' }
  };
  return map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#aaa' };
}

export default function UserDetailsDrawer() {
  const {
    selectedUser, loadingUser, closeUser,
    userRideHistory, userWallet, userPayments,
    suspendUser, reactivateUser
  } = useContext(AdminContext);

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'wallet' | 'payments' | 'rides'
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const isOpen = !!selectedUser || loadingUser;

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (type) => {
    setActionLoading(true);
    let result;
    const id = selectedUser?._id;
    if (type === 'suspend')    result = await suspendUser(id);
    if (type === 'reactivate') result = await reactivateUser(id);
    setActionLoading(false);
    if (result?.error) showToast(`Error: ${result.error}`, '#FF4B4B');
    else               showToast('User state updated successfully');
  };

  const userObj = selectedUser;
  const sc = userObj ? statusStyle(userObj.status) : {};

  return (
    <>
      {isOpen && <div className="ud-overlay" onClick={closeUser} />}

      <div className={`ud-drawer ${isOpen ? 'open' : ''}`}>
        <div className="ud-header">
          <div className="ud-header-title">
            {loadingUser ? 'Loading...' : userObj ? userObj.name : 'Passenger Details'}
          </div>
          {userObj && (
            <span className="um-badge" style={{ background: sc.bg, color: sc.color }}>{userObj.status}</span>
          )}
          <button className="ud-close" onClick={closeUser}>×</button>
        </div>

        {userObj && (
          <div className="ud-tabs">
            <button className={`ud-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
            <button className={`ud-tab ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>Wallet</button>
            <button className={`ud-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments ({userPayments.length})</button>
            <button className={`ud-tab ${activeTab === 'rides' ? 'active' : ''}`} onClick={() => setActiveTab('rides')}>Rides ({userRideHistory.length})</button>
          </div>
        )}

        <div className="ud-body">
          {loadingUser && <div className="rd-loading">⏳ Loading passenger data...</div>}

          {!loadingUser && userObj && (
            <>
              {activeTab === 'summary' && (
                <>
                  {/* Administrative actions */}
                  <div className="ud-section">
                    <div className="ud-section-title">Administrative Actions</div>
                    <div className="ud-actions">
                      {userObj.status === 'Suspended' ? (
                        <button 
                          className="ud-action-btn reactivate" 
                          disabled={actionLoading} 
                          onClick={() => handleAction('reactivate')}
                        >
                          ⚙ Reactivate Account
                        </button>
                      ) : (
                        <button 
                          className="ud-action-btn suspend" 
                          disabled={actionLoading} 
                          onClick={() => handleAction('suspend')}
                        >
                          🚫 Suspend Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="ud-section">
                    <div className="ud-section-title">Profile Information</div>
                    <div className="ud-row"><span className="ud-label">Name</span><span className="ud-value">{userObj.name}</span></div>
                    <div className="ud-row"><span className="ud-label">Email</span><span className="ud-value">{userObj.email}</span></div>
                    <div className="ud-row"><span className="ud-label">Phone</span><span className="ud-value">{userObj.phone || '—'}</span></div>
                    <div className="ud-row"><span className="ud-label">Bio</span><span className="ud-value" style={{ fontSize: 10 }}>{userObj.bio || '—'}</span></div>
                    <div className="ud-row"><span className="ud-label">Language</span><span className="ud-value">{userObj.preferredLanguage}</span></div>
                    <div className="ud-row"><span className="ud-label">Joined</span><span className="ud-value">{fmt(userObj.createdAt)}</span></div>
                  </div>

                  {/* Operational statistics */}
                  <div className="ud-section">
                    <div className="ud-section-title">Ride Statistics</div>
                    <div className="ud-row"><span className="ud-label">Total Rides Booked</span><span className="ud-value">{userObj.stats?.totalTrips || 0}</span></div>
                    <div className="ud-row"><span className="ud-label">Completed Rides</span><span className="ud-value green">{userObj.stats?.completedTrips || 0}</span></div>
                    <div className="ud-row"><span className="ud-label">Fares Spent</span><span className="ud-value gold" style={{ fontWeight: 800 }}>{fmtCur(userObj.stats?.totalFares)}</span></div>
                  </div>
                </>
              )}

              {activeTab === 'wallet' && (
                <>
                  <div className="ud-section" style={{ background: 'rgba(255,210,31,0.05)', padding: 12, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', fontWeight: 700 }}>Wallet Balance</div>
                        <div style={{ fontSize: 20, fontWeight: 950, color: '#FFD21F', marginTop: 4 }}>{fmtCur(userWallet?.balance)}</div>
                      </div>
                      <span className="um-badge" style={{
                        background: userWallet?.status === 'Active' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                        color: userWallet?.status === 'Active' ? '#00D26A' : '#FF4B4B'
                      }}>{userWallet?.status || 'Active'}</span>
                    </div>
                  </div>

                  <div className="ud-section">
                    <div className="ud-section-title">Transaction Ledger</div>
                    {!userWallet?.transactions || userWallet.transactions.length === 0 ? (
                      <div style={{ color: '#555', fontSize: 11 }}>No transaction history found</div>
                    ) : (
                      userWallet.transactions.map((tx, i) => (
                        <div key={i} className="ud-tx-item">
                          <div className="ud-row">
                            <span className="ud-label" style={{ color: '#fff' }}>{tx.type}</span>
                            <span className={`ud-value ${tx.type === 'Credit' ? 'green' : 'red'}`} style={{ fontWeight: 800 }}>
                              {tx.type === 'Credit' ? '+' : '−'}{fmtCur(tx.amount)}
                            </span>
                          </div>
                          <div className="ud-row"><span className="ud-label">Description</span><span className="ud-value">{tx.description || '—'}</span></div>
                          <div className="ud-row"><span className="ud-label">Status</span><span className="ud-value">{tx.status}</span></div>
                          <div className="ud-row"><span className="ud-label">Date</span><span className="ud-value">{fmt(tx.createdAt)}</span></div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {activeTab === 'payments' && (
                <div className="ud-section">
                  <div className="ud-section-title">Payment Logs</div>
                  {userPayments.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No payment records logged</div>
                  ) : (
                    userPayments.map(pm => (
                      <div key={pm._id} className="ud-pm-item">
                        <div className="ud-row">
                          <span className="ud-label" style={{ color: '#fff' }}>Payment #{String(pm._id).slice(-6).toUpperCase()}</span>
                          <span className="ud-value">
                            <span className="um-badge" style={{
                              background: pm.status === 'Completed' ? 'rgba(0,210,106,0.15)' : pm.status === 'Failed' ? 'rgba(255,75,75,0.15)' : 'rgba(255,210,31,0.15)',
                              color: pm.status === 'Completed' ? '#00D26A' : pm.status === 'Failed' ? '#FF4B4B' : '#FFD21F'
                            }}>{pm.status}</span>
                          </span>
                        </div>
                        <div className="ud-row"><span className="ud-label">Amount</span><span className="ud-value gold" style={{ fontWeight: 800 }}>{fmtCur(pm.amount)}</span></div>
                        <div className="ud-row"><span className="ud-label">Method</span><span className="ud-value">{pm.method}</span></div>
                        {pm.gatewayPaymentId && (
                          <div className="ud-row"><span className="ud-label">Gateway TX ID</span><span className="ud-value" style={{ fontSize: 10 }}>{pm.gatewayPaymentId}</span></div>
                        )}
                        <div className="ud-row"><span className="ud-label">Processed At</span><span className="ud-value">{fmt(pm.createdAt)}</span></div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'rides' && (
                <div className="ud-section">
                  <div className="ud-section-title">Passenger Trips</div>
                  {userRideHistory.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No trips booked yet</div>
                  ) : (
                    userRideHistory.map(trip => (
                      <div key={trip._id} className="ud-trip-item">
                        <div className="ud-row">
                          <span className="ud-label" style={{ color: '#FFD21F', fontWeight: 700 }}>#{String(trip._id).slice(-6).toUpperCase()}</span>
                          <span className="ud-value">
                            <span className="um-badge" style={{
                              background: trip.status === 'Completed' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                              color: trip.status === 'Completed' ? '#00D26A' : '#FF4B4B'
                            }}>{trip.status}</span>
                          </span>
                        </div>
                        <div className="ud-row"><span className="ud-label">Driver</span><span className="ud-value">{trip.driver?.name || '—'}</span></div>
                        <div className="ud-row"><span className="ud-label">Route</span><span className="ud-value" style={{ fontSize: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{typeof trip.pickupLocation === 'object' ? trip.pickupLocation?.address || 'Unknown' : trip.pickupLocation} → {typeof trip.dropoffLocation === 'object' ? trip.dropoffLocation?.address || 'Unknown' : trip.dropoffLocation}</span></div>
                        <div className="ud-row"><span className="ud-label">Fare Charged</span><span className="ud-value gold">{fmtCur(trip.fare)}</span></div>
                        <div className="ud-row"><span className="ud-label">Date</span><span className="ud-value">{fmt(trip.createdAt)}</span></div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {toast && (
          <div style={{
            position: 'absolute', bottom: 16, left: 16, right: 16,
            background: '#1a1a2e', border: `1px solid ${toast.color}`,
            borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, color: toast.color,
            zIndex: 10,
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
