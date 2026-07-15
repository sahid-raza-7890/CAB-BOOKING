import React, { useState, useContext } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './DriverManagement.css';

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

export default function DriverDetailsDrawer() {
  const {
    selectedDriver, loadingDriver, closeDriver,
    driverDocuments, driverVehicles, driverTrips, driverEarnings,
    verifyDriver, suspendDriver, reactivateDriver
  } = useContext(AdminContext);

  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'documents' | 'vehicles' | 'earnings' | 'trips'
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const isOpen = !!selectedDriver || loadingDriver;

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (type) => {
    setActionLoading(true);
    let result;
    const id = selectedDriver?._id;
    if (type === 'verify')     result = await verifyDriver(id);
    if (type === 'suspend')    result = await suspendDriver(id);
    if (type === 'reactivate') result = await reactivateDriver(id);
    setActionLoading(false);
    if (result?.error) showToast(`Error: ${result.error}`, '#FF4B4B');
    else               showToast('Driver updated successfully');
  };

  const driver = selectedDriver;
  const sc = driver ? statusStyle(driver.status) : {};

  return (
    <>
      {isOpen && <div className="dd-overlay" onClick={closeDriver} />}

      <div className={`dd-drawer ${isOpen ? 'open' : ''}`}>
        <div className="dd-header">
          <div className="dd-header-title">
            {loadingDriver ? 'Loading...' : driver ? driver.name : 'Driver Details'}
          </div>
          {driver && (
            <span className="dm-badge" style={{ background: sc.bg, color: sc.color }}>{driver.status}</span>
          )}
          <button className="dd-close" onClick={closeDriver}>×</button>
        </div>

        {driver && (
          <div className="dd-tabs">
            <button className={`dd-tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
            <button className={`dd-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>Docs ({driverDocuments.length})</button>
            <button className={`dd-tab ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => setActiveTab('vehicles')}>Vehicles ({driverVehicles.length})</button>
            <button className={`dd-tab ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>Earnings ({driverEarnings.length})</button>
            <button className={`dd-tab ${activeTab === 'trips' ? 'active' : ''}`} onClick={() => setActiveTab('trips')}>Trips ({driverTrips.length})</button>
          </div>
        )}

        <div className="dd-body">
          {loadingDriver && <div className="rd-loading">⏳ Loading driver data...</div>}

          {!loadingDriver && driver && (
            <>
              {activeTab === 'summary' && (
                <>
                  {/* Actions */}
                  <div className="dd-section">
                    <div className="dd-section-title">Administrative Actions</div>
                    <div className="dd-actions">
                      <button 
                        className="dd-action-btn verify" 
                        disabled={actionLoading || driver.isVerified} 
                        onClick={() => handleAction('verify')}
                      >
                        ✓ Verify Compliance
                      </button>
                      {driver.status === 'Suspended' ? (
                        <button 
                          className="dd-action-btn reactivate" 
                          disabled={actionLoading} 
                          onClick={() => handleAction('reactivate')}
                        >
                          ⚙ Reactivate Account
                        </button>
                      ) : (
                        <button 
                          className="dd-action-btn suspend" 
                          disabled={actionLoading} 
                          onClick={() => handleAction('suspend')}
                        >
                          🚫 Suspend Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="dd-section">
                    <div className="dd-section-title">Profile Information</div>
                    <div className="dd-row"><span className="dd-label">Name</span><span className="dd-value">{driver.name}</span></div>
                    <div className="dd-row"><span className="dd-label">Email</span><span className="dd-value">{driver.email}</span></div>
                    <div className="dd-row"><span className="dd-label">Phone</span><span className="dd-value">{driver.phone || '—'}</span></div>
                    <div className="dd-row"><span className="dd-label">Rating</span><span className="dd-value gold">⭐ {driver.rating?.toFixed(1) || '0.0'} ({driver.ratingCount || 0} reviews)</span></div>
                    <div className="dd-row"><span className="dd-label">Compliance Score</span><span className="dd-value">{driver.complianceScore || 0}%</span></div>
                    <div className="dd-row"><span className="dd-label">Joined</span><span className="dd-value">{fmt(driver.createdAt)}</span></div>
                  </div>

                  {/* Shift Session */}
                  <div className="dd-section">
                    <div className="dd-section-title">Session State</div>
                    <div className="dd-row">
                      <span className="dd-label">Status</span>
                      <span className="dd-value">
                        {driver.session?.isOnline ? (
                          <span style={{ color: '#00D26A' }}>● Online {driver.session?.isOnBreak ? '(On Break)' : '(Available)'}</span>
                        ) : (
                          <span style={{ color: '#555' }}>● Offline</span>
                        )}
                      </span>
                    </div>
                    {driver.session?.shiftStartedAt && (
                      <div className="dd-row"><span className="dd-label">Shift Started</span><span className="dd-value">{fmt(driver.session.shiftStartedAt)}</span></div>
                    )}
                    {driver.session?.maxPickupDistance && (
                      <div className="dd-row"><span className="dd-label">Pickup Radius</span><span className="dd-value">{driver.session.maxPickupDistance} km</span></div>
                    )}
                  </div>
                </>
              )}

              {activeTab === 'documents' && (
                <div className="dd-section">
                  <div className="dd-section-title">Verification Documents</div>
                  {driverDocuments.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No documents uploaded yet</div>
                  ) : (
                    driverDocuments.map(doc => (
                      <div key={doc._id} className="dd-doc-item">
                        <div className="dd-row">
                          <span className="dd-label" style={{ color: '#fff' }}>{doc.documentType}</span>
                          <span className="dd-value">
                            <span className="dm-badge" style={{ 
                              background: doc.status === 'Approved' ? 'rgba(0,210,106,0.15)' : doc.status === 'Rejected' ? 'rgba(255,75,75,0.15)' : 'rgba(255,210,31,0.15)',
                              color: doc.status === 'Approved' ? '#00D26A' : doc.status === 'Rejected' ? '#FF4B4B' : '#FFD21F'
                            }}>{doc.status}</span>
                          </span>
                        </div>
                        {doc.documentNumber && (
                          <div className="dd-row"><span className="dd-label">Number</span><span className="dd-value">{doc.documentNumber}</span></div>
                        )}
                        <div className="dd-row">
                          <span className="dd-label">Link</span>
                          <span className="dd-value"><a href={doc.documentUrl} target="_blank" rel="noreferrer" style={{ color: '#FFD21F', textDecoration: 'underline' }}>View Attachment</a></span>
                        </div>
                        {doc.verifiedAt && (
                          <div className="dd-row"><span className="dd-label">Verified At</span><span className="dd-value">{fmt(doc.verifiedAt)}</span></div>
                        )}
                        {doc.expiryDate && (
                          <div className="dd-row"><span className="dd-label">Expires</span><span className="dd-value" style={{ color: new Date(doc.expiryDate) < new Date() ? '#FF4B4B' : '#ccc' }}>{fmt(doc.expiryDate)}</span></div>
                        )}
                        {doc.rejectionReason && (
                          <div className="dd-row"><span className="dd-label" style={{ color: '#FF4B4B' }}>Reason</span><span className="dd-value" style={{ color: '#FF4B4B' }}>{doc.rejectionReason}</span></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'vehicles' && (
                <div className="dd-section">
                  <div className="dd-section-title">Registered Vehicles</div>
                  {driverVehicles.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No vehicles registered yet</div>
                  ) : (
                    driverVehicles.map(veh => (
                      <div key={veh._id} className="dd-veh-item">
                        <div className="dd-row">
                          <span className="dd-label" style={{ color: '#fff' }}>{veh.make} {veh.model} ({veh.year})</span>
                          <span className="dd-value">
                            <span className="dm-badge" style={{ 
                              background: veh.status === 'Approved' ? 'rgba(0,210,106,0.15)' : 'rgba(255,210,31,0.15)',
                              color: veh.status === 'Approved' ? '#00D26A' : '#FFD21F'
                            }}>{veh.status}</span>
                          </span>
                        </div>
                        <div className="dd-row"><span className="dd-label">Plate Number</span><span className="dd-value">{veh.licensePlate}</span></div>
                        <div className="dd-row"><span className="dd-label">Color</span><span className="dd-value">{veh.color}</span></div>
                        <div className="dd-row"><span className="dd-label">Type Category</span><span className="dd-value">{veh.type}</span></div>
                        <div className="dd-row">
                          <span className="dd-label">Selection State</span>
                          <span className="dd-value" style={{ color: veh.isActive ? '#00D26A' : '#555' }}>
                            {veh.isActive ? 'Active Vehicle' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="dd-section">
                  <div className="dd-section-title">Earning Records</div>
                  <div className="dd-row" style={{ background: 'rgba(255,210,31,0.05)', padding: 10, borderRadius: 6, marginBottom: 10 }}>
                    <span className="dd-label" style={{ color: '#FFD21F' }}>Gross Lifetime Earnings</span>
                    <span className="dd-value gold" style={{ fontSize: 14, fontWeight: 900 }}>{fmtCur(driver.earningsSummary?.totalEarnings)}</span>
                  </div>
                  {driverEarnings.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No earning records found</div>
                  ) : (
                    driverEarnings.map((earn, i) => (
                      <div key={i} className="dd-earn-item">
                        <div className="dd-row">
                          <span className="dd-label" style={{ color: '#fff' }}>Net Earning</span>
                          <span className="dd-value gold" style={{ fontWeight: 800 }}>{fmtCur(earn.netEarning)}</span>
                        </div>
                        <div className="dd-row"><span className="dd-label">Source Ride</span><span className="dd-value">#{String(earn.rideId?._id || earn.rideId).slice(-6).toUpperCase()}</span></div>
                        <div className="dd-row"><span className="dd-label">Gross Fare</span><span className="dd-value">{fmtCur(earn.grossFare)}</span></div>
                        <div className="dd-row"><span className="dd-label">Commission Deducted</span><span className="dd-value" style={{ color: '#FF4B4B' }}>{fmtCur(earn.commission)}</span></div>
                        {earn.tip > 0 && (
                          <div className="dd-row"><span className="dd-label">Tip</span><span className="dd-value green">{fmtCur(earn.tip)}</span></div>
                        )}
                        <div className="dd-row"><span className="dd-label">Date</span><span className="dd-value">{fmt(earn.createdAt)}</span></div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'trips' && (
                <div className="dd-section">
                  <div className="dd-section-title">Ride History</div>
                  {driverTrips.length === 0 ? (
                    <div style={{ color: '#555', fontSize: 11 }}>No trips logged yet</div>
                  ) : (
                    driverTrips.map(trip => (
                      <div key={trip._id} className="dd-trip-item">
                        <div className="dd-row">
                          <span className="dd-label" style={{ color: '#FFD21F', fontWeight: 700 }}>#{String(trip._id).slice(-6).toUpperCase()}</span>
                          <span className="dd-value">
                            <span className="dm-badge" style={{
                              background: trip.status === 'Completed' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                              color: trip.status === 'Completed' ? '#00D26A' : '#FF4B4B'
                            }}>{trip.status}</span>
                          </span>
                        </div>
                        <div className="dd-row"><span className="dd-label">Passenger</span><span className="dd-value">{trip.userId?.name || trip.passengerName || '—'}</span></div>
                        <div className="dd-row"><span className="dd-label">Route</span><span className="dd-value" style={{ fontSize: 10, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{typeof trip.pickupLocation === 'object' ? trip.pickupLocation?.address || 'Unknown' : trip.pickupLocation}   {typeof trip.dropoffLocation === 'object' ? trip.dropoffLocation?.address || 'Unknown' : trip.dropoffLocation}</span></div>
                        <div className="dd-row"><span className="dd-label">Fare</span><span className="dd-value gold">{fmtCur(trip.fare)}</span></div>
                        <div className="dd-row"><span className="dd-label">Date</span><span className="dd-value">{fmt(trip.createdAt)}</span></div>
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
