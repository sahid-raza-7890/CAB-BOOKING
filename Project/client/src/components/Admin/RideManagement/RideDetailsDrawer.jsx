/**
 * RideDetailsDrawer — UCAB Enterprise (Sprint 22)
 *
 * Slide-out panel showing full ride details, timeline, and quick actions.
 * All actions delegate to AdminContext (which uses AdminApiService).
 */
import React, { useState, useContext } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './RideManagement.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const fmtCur = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

function statusStyle(status) {
  const map = {
    Completed:  { bg: 'rgba(0,210,106,0.15)',  color: '#00D26A' },
    InProgress: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
    Accepted:   { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA' },
    Searching:  { bg: 'rgba(255,210,31,0.15)', color: '#FFD21F' },
    Pending:    { bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
    Cancelled:  { bg: 'rgba(255,75,75,0.15)',  color: '#FF4B4B' },
  };
  return map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#aaa' };
}

function paymentStyle(ps) {
  if (ps === 'Paid')     return 'green';
  if (ps === 'Refunded') return 'blue';
  return 'red';
}

// ─── Confirm Sub-panel ─────────────────────────────────────────────────────────

function ConfirmAction({ title, placeholder, needsReason, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState('');
  return (
    <div className="rd-confirm">
      <div className="rd-confirm-title">{title}</div>
      {needsReason && (
        <input
          className="rd-confirm-input"
          placeholder={placeholder || 'Enter reason...'}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      )}
      <div className="rd-confirm-btns">
        <button className="rd-confirm-btn yes" disabled={loading} onClick={() => onConfirm(reason)}>
          {loading ? 'Processing...' : 'Confirm'}
        </button>
        <button className="rd-confirm-btn no" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RideDetailsDrawer() {
  const {
    selectedRide, loadingRide, closeRide,
    assignDriver, cancelRide, forceCompleteRide, triggerRefund,
  } = useContext(AdminContext);

  const [activeAction, setActiveAction] = useState(null); // 'assign' | 'cancel' | 'complete' | 'refund'
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const isOpen = !!selectedRide || loadingRide;

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (type, payload) => {
    setActionLoading(true);
    let result;
    const id = selectedRide?._id;
    if (type === 'cancel')   result = await cancelRide(id, payload);
    if (type === 'complete') result = await forceCompleteRide(id);
    if (type === 'refund')   result = await triggerRefund(id, payload);
    if (type === 'assign')   result = await assignDriver(id, payload);
    setActionLoading(false);
    setActiveAction(null);
    if (result?.error) showToast(`Error: ${result.error}`, '#FF4B4B');
    else               showToast('Action completed successfully');
  };

  const ride  = selectedRide;
  const sc    = ride ? statusStyle(ride.status) : {};
  const pax   = ride?.userId;
  const drv   = ride?.driver;
  const veh   = ride?.vehicleId;
  const tl    = ride?.timeline || [];
  const canCancel   = ride && !['Completed', 'Cancelled'].includes(ride.status);
  const canComplete = ride && !['Completed', 'Cancelled'].includes(ride.status);
  const canAssign   = ride && !['Completed', 'Cancelled'].includes(ride.status);
  const canRefund   = ride && ['Completed', 'Cancelled'].includes(ride.status) && ride.paymentStatus !== 'Refunded';

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="rd-overlay" onClick={closeRide} />}

      {/* Drawer */}
      <div className={`rd-drawer ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="rd-header">
          <div className="rd-header-title">
            {loadingRide ? 'Loading...' : ride ? `Ride #${String(ride._id).slice(-6).toUpperCase()}` : 'Ride Details'}
          </div>
          {ride && (
            <span className="rm-badge" style={{ background: sc.bg, color: sc.color }}>{ride.status}</span>
          )}
          <button className="rd-close" onClick={closeRide}>×</button>
        </div>

        {/* Body */}
        <div className="rd-body">
          {loadingRide && (
            <div className="rd-loading">⏳ Loading ride details...</div>
          )}

          {!loadingRide && ride && (
            <>
              {/* Quick Actions */}
              <div className="rd-section">
                <div className="rd-section-title">Quick Actions</div>
                {activeAction === 'cancel' && (
                  <ConfirmAction
                    title="⚠️ Cancel this ride?"
                    placeholder="Reason for cancellation..."
                    needsReason
                    loading={actionLoading}
                    onConfirm={(r) => handleAction('cancel', r)}
                    onCancel={() => setActiveAction(null)}
                  />
                )}
                {activeAction === 'complete' && (
                  <ConfirmAction
                    title="✅ Force-complete this ride?"
                    needsReason={false}
                    loading={actionLoading}
                    onConfirm={() => handleAction('complete')}
                    onCancel={() => setActiveAction(null)}
                  />
                )}
                {activeAction === 'refund' && (
                  <ConfirmAction
                    title="💳 Trigger refund for this ride?"
                    placeholder="Reason for refund..."
                    needsReason
                    loading={actionLoading}
                    onConfirm={(r) => handleAction('refund', r)}
                    onCancel={() => setActiveAction(null)}
                  />
                )}
                {activeAction === 'assign' && (
                  <ConfirmAction
                    title="🚗 Assign/Reassign driver (enter Driver ID)"
                    placeholder="Driver ID..."
                    needsReason
                    loading={actionLoading}
                    onConfirm={(id) => handleAction('assign', id)}
                    onCancel={() => setActiveAction(null)}
                  />
                )}
                {!activeAction && (
                  <div className="rd-actions">
                    <button
                      className="rd-action-btn assign"
                      disabled={!canAssign}
                      onClick={() => setActiveAction('assign')}
                    >
                      🚗 {drv ? 'Reassign' : 'Assign'} Driver
                    </button>
                    <button
                      className="rd-action-btn complete"
                      disabled={!canComplete}
                      onClick={() => setActiveAction('complete')}
                    >
                      ✅ Force Complete
                    </button>
                    <button
                      className="rd-action-btn cancel"
                      disabled={!canCancel}
                      onClick={() => setActiveAction('cancel')}
                    >
                      ❌ Cancel Ride
                    </button>
                    <button
                      className="rd-action-btn refund"
                      disabled={!canRefund}
                      onClick={() => setActiveAction('refund')}
                    >
                      💳 Trigger Refund
                    </button>
                  </div>
                )}
              </div>

              {/* Ride Summary */}
              <div className="rd-section">
                <div className="rd-section-title">Ride Summary</div>
                <div className="rd-row"><span className="rd-label">Type</span><span className="rd-value">{ride.type || 'Immediate'}</span></div>
                <div className="rd-row"><span className="rd-label">Status</span><span className="rd-value" style={{ color: sc.color }}>{ride.status}</span></div>
                <div className="rd-row"><span className="rd-label">Pickup</span><span className="rd-value">{ride.pickupLocation || '—'}</span></div>
                <div className="rd-row"><span className="rd-label">Drop-off</span><span className="rd-value">{ride.dropoffLocation || '—'}</span></div>
                <div className="rd-row"><span className="rd-label">Distance</span><span className="rd-value">{ride.distanceKm || 0} km</span></div>
                <div className="rd-row"><span className="rd-label">Payment</span><span className="rd-value">{ride.paymentMethod}</span></div>
                <div className="rd-row"><span className="rd-label">Payment Status</span><span className={`rd-value ${paymentStyle(ride.paymentStatus)}`}>{ride.paymentStatus}</span></div>
                <div className="rd-row"><span className="rd-label">Booked At</span><span className="rd-value">{fmt(ride.createdAt)}</span></div>
              </div>

              {/* Payment Summary */}
              <div className="rd-section">
                <div className="rd-section-title">Payment Summary</div>
                <div className="rd-row"><span className="rd-label">Base Fare</span><span className="rd-value">{fmtCur(ride.baseFare)}</span></div>
                <div className="rd-row"><span className="rd-label">Distance Fare</span><span className="rd-value">{fmtCur(ride.fareBreakdown?.distanceFare)}</span></div>
                <div className="rd-row"><span className="rd-label">Platform Fee</span><span className="rd-value">{fmtCur(ride.fareBreakdown?.platformFee)}</span></div>
                <div className="rd-row"><span className="rd-label">Taxes</span><span className="rd-value">{fmtCur(ride.fareBreakdown?.taxes)}</span></div>
                <div className="rd-row"><span className="rd-label">Coupon Discount</span><span className="rd-value green">−{fmtCur(ride.discountAmount)}</span></div>
                <div className="rd-row"><span className="rd-label">Total Fare</span><span className="rd-value gold" style={{ fontSize: 13, fontWeight: 900 }}>{fmtCur(ride.fare)}</span></div>
              </div>

              {/* Passenger Info */}
              {pax && (
                <div className="rd-section">
                  <div className="rd-section-title">Passenger Information</div>
                  <div className="rd-row"><span className="rd-label">Name</span><span className="rd-value">{pax.name || ride.passengerName || '—'}</span></div>
                  <div className="rd-row"><span className="rd-label">Email</span><span className="rd-value">{pax.email || '—'}</span></div>
                  <div className="rd-row"><span className="rd-label">Phone</span><span className="rd-value">{pax.phone || '—'}</span></div>
                </div>
              )}

              {/* Driver Info */}
              <div className="rd-section">
                <div className="rd-section-title">Driver Information</div>
                {drv ? (
                  <>
                    <div className="rd-row"><span className="rd-label">Name</span><span className="rd-value">{drv.name || '—'}</span></div>
                    <div className="rd-row"><span className="rd-label">Phone</span><span className="rd-value">{drv.phone || '—'}</span></div>
                    <div className="rd-row"><span className="rd-label">Rating</span><span className="rd-value gold">⭐ {drv.rating?.toFixed(1) || '—'}</span></div>
                    <div className="rd-row"><span className="rd-label">License</span><span className="rd-value">{drv.licenseNumber || '—'}</span></div>
                  </>
                ) : (
                  <div className="rd-row"><span className="rd-label" style={{ color: '#555' }}>No driver assigned</span></div>
                )}
              </div>

              {/* Vehicle Info */}
              {veh && (
                <div className="rd-section">
                  <div className="rd-section-title">Vehicle Information</div>
                  <div className="rd-row"><span className="rd-label">Type</span><span className="rd-value">{veh.label || ride.vehicleType || '—'}</span></div>
                  <div className="rd-row"><span className="rd-label">Base Fare</span><span className="rd-value">{fmtCur(veh.baseFare)}</span></div>
                  <div className="rd-row"><span className="rd-label">Per KM Rate</span><span className="rd-value">{fmtCur(veh.perKmRate)}/km</span></div>
                </div>
              )}

              {/* Timeline */}
              <div className="rd-section">
                <div className="rd-section-title">Ride Timeline</div>
                {tl.length > 0 ? (
                  <div className="rd-timeline">
                    {tl.map((item, i) => (
                      <div key={i} className="rd-tl-item">
                        <div className="rd-tl-dot">{item.icon}</div>
                        <div className="rd-tl-content">
                          <div className="rd-tl-event">{item.event}</div>
                          <div className="rd-tl-time">{fmt(item.at)}</div>
                          {item.reason && <div className="rd-tl-reason">{item.reason}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#555', fontSize: 11 }}>No timeline events available</div>
                )}
              </div>

              {/* Audit Log */}
              <div className="rd-section">
                <div className="rd-section-title">Audit Log</div>
                <div className="rd-row"><span className="rd-label">Cancelled By</span><span className="rd-value">{ride.cancelledBy || '—'}</span></div>
                <div className="rd-row"><span className="rd-label">Cancel Reason</span><span className="rd-value">{ride.cancelReason || '—'}</span></div>
                <div className="rd-row"><span className="rd-label">Notes</span><span className="rd-value">{ride.notes || '—'}</span></div>
                <div className="rd-row"><span className="rd-label">Last Updated</span><span className="rd-value">{fmt(ride.updatedAt)}</span></div>
              </div>
            </>
          )}
        </div>

        {/* In-drawer toast */}
        {toast && (
          <div style={{
            position: 'absolute', bottom: 16, left: 16, right: 16,
            background: '#1a1a2e', border: `1px solid ${toast.color}`,
            borderRadius: 8, padding: '10px 14px', fontSize: 12, fontWeight: 700, color: toast.color,
            zIndex: 10, animation: 'fadeIn 0.2s',
          }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
