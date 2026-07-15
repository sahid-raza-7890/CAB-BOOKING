import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminContext } from '../../../context/AdminContext';
import './Safety.css';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const fmtFull = (d) => d ? `${fmt(d)} ${fmtTime(d)}` : '—';
const ago = (d) => {
  if (!d) return '—';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

const alertStatusClass = (s) => {
  const m = { Active: 'active', Acknowledged: 'acknowledged', Resolved: 'resolved', Cancelled: 'cancelled' };
  return m[s] || 'active';
};

const ticketStatusClass = (s) => {
  const m = { Open: 'open', InProgress: 'inprogress', Resolved: 'resolved', Closed: 'closed' };
  return m[s] || 'open';
};

const priorityClass = (p) => (p || 'Normal').toLowerCase();

// ─── SafetyStats ────────────────────────────────────────────────────────────
function SafetyStats({ safetyAlerts, supportTickets, safetyDashboard }) {
  const activeAlerts = safetyAlerts.filter(a => a.status === 'Active').length;
  const escalated = safetyAlerts.filter(a => a.metadata?.escalated).length;
  const openTickets = supportTickets.filter(t => t.status === 'Open' || t.status === 'InProgress').length;
  const totalTickets = safetyDashboard?.totalTickets || supportTickets.length;

  return (
    <div className="safety-stats-grid">
      <div className="safety-stat-card">
        <div>
          <div className="safety-stat-label">Active Alerts</div>
          <div className="safety-stat-val" style={{ color: '#FF4B4B' }}>{activeAlerts}</div>
        </div>
        <span className="safety-stat-icon">🚨</span>
      </div>
      <div className="safety-stat-card">
        <div>
          <div className="safety-stat-label">Escalated</div>
          <div className="safety-stat-val" style={{ color: '#FF7814' }}>{escalated}</div>
        </div>
        <span className="safety-stat-icon">⚠️</span>
      </div>
      <div className="safety-stat-card">
        <div>
          <div className="safety-stat-label">Open Tickets</div>
          <div className="safety-stat-val" style={{ color: '#3B82F6' }}>{openTickets}</div>
        </div>
        <span className="safety-stat-icon">🎫</span>
      </div>
      <div className="safety-stat-card">
        <div>
          <div className="safety-stat-label">Total Tickets</div>
          <div className="safety-stat-val">{totalTickets}</div>
        </div>
        <span className="safety-stat-icon">📊</span>
      </div>
    </div>
  );
}

// ─── SafetyFilters ──────────────────────────────────────────────────────────
function SafetyFilters({ type, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter, searchQuery, setSearchQuery }) {
  return (
    <div className="safety-filters">
      <input
        className="safety-filter-input"
        placeholder={type === 'alerts' ? 'Search alerts...' : 'Search tickets...'}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <select className="safety-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        {type === 'alerts' ? (
          <>
            <option value="Active">Active</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Resolved">Resolved</option>
            <option value="Cancelled">Cancelled</option>
          </>
        ) : (
          <>
            <option value="Open">Open</option>
            <option value="InProgress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </>
        )}
      </select>
      {type === 'tickets' && (
        <select className="safety-filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Normal">Normal</option>
          <option value="Low">Low</option>
        </select>
      )}
    </div>
  );
}

// ─── SafetySkeleton ─────────────────────────────────────────────────────────
function SafetySkeleton() {
  return <div className="safety-skeleton">⏳ Loading safety & support data...</div>;
}

// ─── SafetyEmpty ────────────────────────────────────────────────────────────
function SafetyEmpty({ type }) {
  return (
    <div className="safety-empty">
      <div className="safety-empty-icon">{type === 'alerts' ? '🛡️' : '📭'}</div>
      <div>{type === 'alerts' ? 'No safety alerts found' : 'No support tickets found'}</div>
    </div>
  );
}

// ─── SafetyAlertDrawer ──────────────────────────────────────────────────────
function SafetyAlertDrawer({ alert, onClose, onResolve, onEscalate, onDismiss }) {
  const [showActionModal, setShowActionModal] = useState(null); // 'resolve' | 'escalate' | 'dismiss'
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  if (!alert) return null;

  const handleAction = async () => {
    setLoading(true);
    if (showActionModal === 'resolve') await onResolve(alert._id, remarks);
    if (showActionModal === 'escalate') await onEscalate(alert._id, remarks);
    if (showActionModal === 'dismiss') await onDismiss(alert._id, remarks);
    setLoading(false);
    setShowActionModal(null);
    setRemarks('');
    onClose();
  };

  return (
    <div className="safety-drawer-overlay" onClick={onClose}>
      <div className="safety-drawer" onClick={e => e.stopPropagation()}>
        <div className="safety-drawer-hdr">
          <div className="safety-drawer-title">🚨 Safety Alert Details</div>
          <button className="safety-drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="safety-drawer-body">
          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Alert Type</div>
              <div className="safety-drawer-value" style={{ fontWeight: 800, color: alert.alertType === 'SOS' ? '#FF2D2D' : '#FFD21F' }}>{alert.alertType}</div>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Status</div>
              <span className={`safety-badge ${alertStatusClass(alert.status)}`}>{alert.status}</span>
            </div>
          </div>

          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Passenger</div>
              <div className="safety-drawer-value">{alert.userId?.name || 'Unknown'}</div>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Driver</div>
              <div className="safety-drawer-value">{alert.driverId?.name || 'Unassigned'}</div>
            </div>
          </div>

          <div className="safety-drawer-section">
            <div className="safety-drawer-label">Description</div>
            <div className="safety-drawer-value">{alert.description || 'No description provided'}</div>
          </div>

          {alert.currentLocation && (
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Location</div>
              <div className="safety-drawer-value">
                {alert.currentLocation.address || `${alert.currentLocation.latitude}, ${alert.currentLocation.longitude}`}
              </div>
            </div>
          )}

          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Alert Owner</div>
              <div className="safety-drawer-value">{alert.alertOwnerType || 'Passenger'}</div>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Created</div>
              <div className="safety-drawer-value">{fmtFull(alert.createdAt)}</div>
            </div>
          </div>

          {alert.contactsNotified?.length > 0 && (
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Contacts Notified</div>
              <div className="safety-drawer-value">{alert.contactsNotified.join(', ')}</div>
            </div>
          )}

          {alert.metadata?.escalated && (
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Escalation Details</div>
              <div className="safety-drawer-value" style={{ color: '#FF7814' }}>
                ⚠️ Escalated — {alert.metadata.remarks || 'No remarks'}
              </div>
            </div>
          )}
        </div>

        {alert.status === 'Active' || alert.status === 'Acknowledged' ? (
          <div className="safety-drawer-actions">
            <button className="safety-action-btn resolve" onClick={() => setShowActionModal('resolve')}>✅ Resolve</button>
            {alert.status !== 'Acknowledged' && (
              <button className="safety-action-btn escalate" onClick={() => setShowActionModal('escalate')}>⚠️ Escalate</button>
            )}
            <button className="safety-action-btn dismiss" onClick={() => setShowActionModal('dismiss')}>🗑️ Dismiss</button>
          </div>
        ) : null}

        {showActionModal && (
          <div className="safety-modal-overlay" onClick={() => setShowActionModal(null)}>
            <div className="safety-modal" onClick={e => e.stopPropagation()}>
              <div className="safety-modal-hdr">
                <div className="safety-modal-title">
                  {showActionModal === 'resolve' ? '✅ Resolve Alert' : showActionModal === 'escalate' ? '⚠️ Escalate Alert' : '🗑️ Dismiss Alert'}
                </div>
                <button className="safety-drawer-close" onClick={() => setShowActionModal(null)}>×</button>
              </div>
              <div className="safety-modal-body">
                <div className="safety-drawer-label">Remarks</div>
                <textarea className="safety-modal-input" placeholder="Enter your remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
              <div className="safety-modal-actions">
                <button className="safety-action-btn dismiss" onClick={() => setShowActionModal(null)}>Cancel</button>
                <button className={`safety-action-btn ${showActionModal}`} disabled={loading} onClick={handleAction}>
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SupportTicketDrawer ────────────────────────────────────────────────────
function SupportTicketDrawer({ ticket, onClose, onAssign, onReply, onCloseTicket, onReopen }) {
  const [replyMsg, setReplyMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!ticket) return null;

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setLoading(true);
    await onReply(ticket._id, replyMsg);
    setReplyMsg('');
    setLoading(false);
  };

  return (
    <div className="safety-drawer-overlay" onClick={onClose}>
      <div className="safety-drawer" onClick={e => e.stopPropagation()}>
        <div className="safety-drawer-hdr">
          <div className="safety-drawer-title">🎫 Support Ticket Details</div>
          <button className="safety-drawer-close" onClick={onClose}>×</button>
        </div>
        <div className="safety-drawer-body">
          <div className="safety-drawer-section">
            <div className="safety-drawer-label">Subject</div>
            <div className="safety-drawer-value" style={{ fontWeight: 700, color: '#fff' }}>{ticket.subject}</div>
          </div>

          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Status</div>
              <span className={`safety-badge ${ticketStatusClass(ticket.status)}`}>{ticket.status}</span>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Priority</div>
              <span className={`safety-badge ${priorityClass(ticket.priority)}`}>{ticket.priority}</span>
            </div>
          </div>

          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Category</div>
              <div className="safety-drawer-value">{ticket.category}</div>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Submitted By</div>
              <div className="safety-drawer-value">{ticket.userId?.name || ticket.userType || 'Unknown'}</div>
            </div>
          </div>

          <div className="safety-drawer-section">
            <div className="safety-drawer-label">Description</div>
            <div className="safety-drawer-value">{ticket.description}</div>
          </div>

          <div className="safety-drawer-row">
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Created</div>
              <div className="safety-drawer-value">{fmtFull(ticket.createdAt)}</div>
            </div>
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Updated</div>
              <div className="safety-drawer-value">{fmtFull(ticket.updatedAt)}</div>
            </div>
          </div>

          {/* Conversation Thread */}
          {ticket.replies?.length > 0 && (
            <div className="safety-drawer-section">
              <div className="safety-drawer-label">Conversation ({ticket.replies.length} messages)</div>
              <div className="safety-reply-thread">
                {ticket.replies.map((r, idx) => (
                  <div key={idx} className={`safety-reply-bubble ${r.senderModel === 'Admin' ? 'admin' : ''}`}>
                    <div className="safety-reply-sender">{r.senderModel === 'Admin' ? '👤 Admin Support' : `📱 ${ticket.userType || 'User'}`}</div>
                    <div className="safety-reply-msg">{r.message}</div>
                    <div className="safety-reply-time">{fmtFull(r.createdAt)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reply Input */}
        {ticket.status !== 'Closed' && (
          <div className="safety-reply-input-wrap">
            <textarea
              className="safety-reply-input"
              placeholder="Type your reply..."
              rows={2}
              value={replyMsg}
              onChange={e => setReplyMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
            />
            <button className="safety-reply-send" disabled={!replyMsg.trim() || loading} onClick={handleReply}>
              {loading ? '...' : 'Send'}
            </button>
          </div>
        )}

        <div className="safety-drawer-actions">
          {ticket.status === 'Open' && (
            <button className="safety-action-btn assign" onClick={() => onAssign(ticket._id)}>📌 Assign to Me</button>
          )}
          {ticket.status !== 'Closed' && (
            <button className="safety-action-btn close-ticket" onClick={() => onCloseTicket(ticket._id)}>🔒 Close Ticket</button>
          )}
          {ticket.status === 'Closed' && (
            <button className="safety-action-btn reopen" onClick={() => onReopen(ticket._id)}>🔓 Reopen</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SafetyAnalytics ────────────────────────────────────────────────────────
function SafetyAnalyticsPanel({ supportAnalytics, safetyAlerts }) {
  if (!supportAnalytics) return <SafetySkeleton />;

  const alertTypes = {};
  safetyAlerts.forEach(a => { alertTypes[a.alertType] = (alertTypes[a.alertType] || 0) + 1; });

  return (
    <div className="safety-analytics-grid">
      <div className="safety-analytics-card">
        <div className="safety-analytics-card-title">Ticket Categories</div>
        {Object.entries(supportAnalytics.categories || {}).map(([k, v]) => (
          <div key={k} className="safety-analytics-item">
            <span className="safety-analytics-key">{k}</span>
            <span className="safety-analytics-value">{v}</span>
          </div>
        ))}
        {Object.keys(supportAnalytics.categories || {}).length === 0 && (
          <div style={{ color: '#555', fontSize: 12 }}>No categories data</div>
        )}
      </div>

      <div className="safety-analytics-card">
        <div className="safety-analytics-card-title">Ticket Priorities</div>
        {Object.entries(supportAnalytics.priorities || {}).map(([k, v]) => (
          <div key={k} className="safety-analytics-item">
            <span className="safety-analytics-key">{k}</span>
            <span className="safety-analytics-value">{v}</span>
          </div>
        ))}
      </div>

      <div className="safety-analytics-card">
        <div className="safety-analytics-card-title">Ticket Statuses</div>
        {Object.entries(supportAnalytics.statuses || {}).map(([k, v]) => (
          <div key={k} className="safety-analytics-item">
            <span className="safety-analytics-key">{k}</span>
            <span className="safety-analytics-value">{v}</span>
          </div>
        ))}
      </div>

      <div className="safety-analytics-card">
        <div className="safety-analytics-card-title">Safety Alert Types</div>
        {Object.entries(alertTypes).map(([k, v]) => (
          <div key={k} className="safety-analytics-item">
            <span className="safety-analytics-key">{k}</span>
            <span className="safety-analytics-value" style={{ color: k === 'SOS' ? '#FF2D2D' : '#FFD21F' }}>{v}</span>
          </div>
        ))}
        {Object.keys(alertTypes).length === 0 && (
          <div style={{ color: '#555', fontSize: 12 }}>No alert data</div>
        )}
      </div>

      <div className="safety-analytics-card">
        <div className="safety-analytics-card-title">Summary</div>
        <div className="safety-analytics-item">
          <span className="safety-analytics-key">Total Tickets</span>
          <span className="safety-analytics-value">{supportAnalytics.totalTickets || 0}</span>
        </div>
        <div className="safety-analytics-item">
          <span className="safety-analytics-key">Total Safety Alerts</span>
          <span className="safety-analytics-value" style={{ color: '#FF4B4B' }}>{safetyAlerts.length}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN SafetyDashboard ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export default function SafetyDashboard() {
  const {
    safetyDashboard, safetyAlerts, selectedAlert, setSelectedAlert,
    supportTickets, selectedTicket, setSelectedTicket, supportAnalytics,
    loadingSafety, errorSafety,
    fetchSafetyDashboard, fetchSafetyAlerts, fetchSafetyAlert,
    resolveSafetyAlert, escalateSafetyAlert, dismissSafetyAlert,
    fetchSupportTickets, fetchSupportTicket, assignSupportTicket,
    replySupportTicket, closeSupportTicket, reopenSupportTicket, fetchSupportAnalytics
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'alerts');
  const [alertStatusFilter, setAlertStatusFilter] = useState(searchParams.get('alertStatus') || '');
  const [alertSearch, setAlertSearch] = useState(searchParams.get('alertSearch') || '');
  const [localAlertSearch, setLocalAlertSearch] = useState(searchParams.get('alertSearch') || '');
  const [ticketStatusFilter, setTicketStatusFilter] = useState(searchParams.get('ticketStatus') || '');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState(searchParams.get('ticketPriority') || '');
  const [ticketSearch, setTicketSearch] = useState(searchParams.get('ticketSearch') || '');
  const [localTicketSearch, setLocalTicketSearch] = useState(searchParams.get('ticketSearch') || '');
  const [toast, setToast] = useState(null);

  const updateUrl = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    updateUrl({ tab });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (localAlertSearch !== alertSearch) {
        setAlertSearch(localAlertSearch);
        updateUrl({ alertSearch: localAlertSearch });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localAlertSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      if (localTicketSearch !== ticketSearch) {
        setTicketSearch(localTicketSearch);
        updateUrl({ ticketSearch: localTicketSearch });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localTicketSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSafetyDashboard();
    if (activeTab === 'alerts') fetchSafetyAlerts();
    if (activeTab === 'tickets') fetchSupportTickets();
    if (activeTab === 'analytics') { fetchSupportAnalytics(); fetchSafetyAlerts(); }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let items = safetyAlerts;
    if (alertStatusFilter) items = items.filter(a => a.status === alertStatusFilter);
    if (alertSearch) {
      const q = alertSearch.toLowerCase();
      items = items.filter(a =>
        (a.alertType || '').toLowerCase().includes(q) ||
        (a.userId?.name || '').toLowerCase().includes(q) ||
        (a.driverId?.name || '').toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [safetyAlerts, alertStatusFilter, alertSearch]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    let items = supportTickets;
    if (ticketStatusFilter) items = items.filter(t => t.status === ticketStatusFilter);
    if (ticketPriorityFilter) items = items.filter(t => t.priority === ticketPriorityFilter);
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase();
      items = items.filter(t =>
        (t.subject || '').toLowerCase().includes(q) ||
        (t.userId?.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [supportTickets, ticketStatusFilter, ticketPriorityFilter, ticketSearch]);

  // Handlers
  const handleOpenAlert = async (alert) => {
    await fetchSafetyAlert(alert._id);
    setSelectedAlert(alert);
  };

  const handleResolveAlert = async (id, remarks) => {
    const res = await resolveSafetyAlert(id, remarks);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else showToast('Alert resolved successfully');
  };

  const handleEscalateAlert = async (id, remarks) => {
    const res = await escalateSafetyAlert(id, remarks);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else showToast('Alert escalated successfully', '#FF7814');
  };

  const handleDismissAlert = async (id, remarks) => {
    const res = await dismissSafetyAlert(id, remarks);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else showToast('Alert dismissed');
  };

  const handleOpenTicket = async (ticket) => {
    await fetchSupportTicket(ticket._id);
    setSelectedTicket(ticket);
  };

  const handleAssignTicket = async (id) => {
    const res = await assignSupportTicket(id);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else showToast('Ticket assigned to you');
    fetchSupportTickets();
  };

  const handleReplyTicket = async (id, message) => {
    const res = await replySupportTicket(id, message);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast('Reply sent successfully');
      fetchSupportTicket(id);
    }
  };

  const handleCloseTicket = async (id) => {
    if (!window.confirm('Close this support ticket?')) return;
    const res = await closeSupportTicket(id);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast('Ticket closed');
      setSelectedTicket(null);
    }
  };

  const handleReopenTicket = async (id) => {
    const res = await reopenSupportTicket(id);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast('Ticket reopened', '#FFD21F');
      fetchSupportTicket(id);
    }
  };

  return (
    <div className="safety-root">
      <div className="safety-topbar">
        <div className="safety-title-wrap">
          <div className="safety-title">Safety & Support Operations Center</div>
          <div className="safety-subtitle">Monitor safety alerts, manage support tickets, and review analytics</div>
        </div>
      </div>

      {/* Stats */}
      <SafetyStats safetyAlerts={safetyAlerts} supportTickets={supportTickets} safetyDashboard={safetyDashboard} />

      {/* Tabs */}
      <div className="safety-tabs">
        <button className={`safety-tab ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>🚨 Safety Alerts</button>
        <button className={`safety-tab ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>🎫 Support Tickets</button>
        <button className={`safety-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
      </div>

      {/* Content */}
      <div className="safety-card">
        {activeTab === 'alerts' && (
          <>
            <div className="safety-card-header">
              <div className="safety-card-title">Safety Alerts Queue</div>
              <SafetyFilters
                type="alerts"
                statusFilter={alertStatusFilter} setStatusFilter={(val) => { setAlertStatusFilter(val); updateUrl({ alertStatus: val }); }}
                searchQuery={localAlertSearch} setSearchQuery={setLocalAlertSearch}
              />
            </div>
            <div className="safety-table-wrap">
              {loadingSafety ? <SafetySkeleton /> : filteredAlerts.length === 0 ? <SafetyEmpty type="alerts" /> : (
                <table className="safety-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Passenger</th>
                      <th>Driver</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map(a => (
                      <tr key={a._id} onClick={() => handleOpenAlert(a)}>
                        <td>
                          <span className={`safety-badge ${a.alertType === 'SOS' ? 'sos' : a.alertType === 'Emergency' ? 'emergency' : 'active'}`}>
                            {a.alertType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{a.userId?.name || '—'}</td>
                        <td>{a.driverId?.name || '—'}</td>
                        <td>{a.currentLocation?.address || (a.currentLocation?.latitude ? `${a.currentLocation.latitude.toFixed(4)}, ${a.currentLocation.longitude.toFixed(4)}` : '—')}</td>
                        <td><span className={`safety-badge ${alertStatusClass(a.status)}`}>{a.status}</span></td>
                        <td style={{ color: '#888' }}>{ago(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'tickets' && (
          <>
            <div className="safety-card-header">
              <div className="safety-card-title">Support Tickets</div>
              <SafetyFilters
                type="tickets"
                statusFilter={ticketStatusFilter} setStatusFilter={(val) => { setTicketStatusFilter(val); updateUrl({ ticketStatus: val }); }}
                priorityFilter={ticketPriorityFilter} setPriorityFilter={(val) => { setTicketPriorityFilter(val); updateUrl({ ticketPriority: val }); }}
                searchQuery={localTicketSearch} setSearchQuery={setLocalTicketSearch}
              />
            </div>
            <div className="safety-table-wrap">
              {loadingSafety ? <SafetySkeleton /> : filteredTickets.length === 0 ? <SafetyEmpty type="tickets" /> : (
                <table className="safety-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Submitted By</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Replies</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => (
                      <tr key={t._id} onClick={() => handleOpenTicket(t)}>
                        <td style={{ fontWeight: 600, color: '#fff', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</td>
                        <td>{t.userId?.name || t.userType || '—'}</td>
                        <td>{t.category}</td>
                        <td><span className={`safety-badge ${priorityClass(t.priority)}`}>{t.priority}</span></td>
                        <td><span className={`safety-badge ${ticketStatusClass(t.status)}`}>{t.status}</span></td>
                        <td style={{ textAlign: 'center' }}>{t.replies?.length || 0}</td>
                        <td style={{ color: '#888' }}>{ago(t.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <SafetyAnalyticsPanel supportAnalytics={supportAnalytics} safetyAlerts={safetyAlerts} />
        )}
      </div>

      {/* Drawers */}
      {selectedAlert && (
        <SafetyAlertDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onResolve={handleResolveAlert}
          onEscalate={handleEscalateAlert}
          onDismiss={handleDismissAlert}
        />
      )}

      {selectedTicket && (
        <SupportTicketDrawer
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onAssign={handleAssignTicket}
          onReply={handleReplyTicket}
          onCloseTicket={handleCloseTicket}
          onReopen={handleReopenTicket}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="safety-toast" style={{ border: `1px solid ${toast.color}`, color: toast.color }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
