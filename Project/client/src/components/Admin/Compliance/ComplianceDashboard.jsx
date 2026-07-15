import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './Compliance.css';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

import { useSearchParams } from 'react-router-dom';

export default function ComplianceDashboard() {
  const {
    pendingDocuments, pendingVehicles, complianceStats, loadingCompliance, errorCompliance,
    fetchComplianceData, approveDocument, rejectDocument, approveVehicle, rejectVehicle
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'documents');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedVeh, setSelectedVeh] = useState(null);

  // Verification details
  const [expiryDate, setExpiryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDocumentAction = async (type) => {
    setActionLoading(true);
    let res;
    if (type === 'approve') {
      res = await approveDocument(selectedDoc._id, expiryDate, remarks);
    } else {
      if (!rejectionReason.trim()) {
        showToast('Rejection reason is required', '#FF4B4B');
        setActionLoading(false);
        return;
      }
      res = await rejectDocument(selectedDoc._id, rejectionReason);
    }
    setActionLoading(false);

    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(`Document ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedDoc(null);
      setExpiryDate('');
      setRemarks('');
      setRejectionReason('');
    }
  };

  const handleVehicleAction = async (type) => {
    setActionLoading(true);
    let res;
    if (type === 'approve') {
      res = await approveVehicle(selectedVeh._id, remarks);
    } else {
      if (!rejectionReason.trim()) {
        showToast('Rejection reason is required', '#FF4B4B');
        setActionLoading(false);
        return;
      }
      res = await rejectVehicle(selectedVeh._id, rejectionReason);
    }
    setActionLoading(false);

    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(`Vehicle ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedVeh(null);
      setRemarks('');
      setRejectionReason('');
    }
  };

  return (
    <div className="comp-root">
      <div className="comp-topbar">
        <div>
          <div className="comp-title">Compliance Operations</div>
          <div className="comp-meta">Driver onboarding, documents & vehicle approvals center</div>
        </div>
        <button className="um-refresh-btn" onClick={fetchComplianceData}>⟳ Refresh Queue</button>
      </div>

      {/* Stats */}
      <div className="comp-stats-grid">
        <div className="comp-stat-card">
          <div>
            <div className="comp-stat-label">Pending Documents</div>
            <div className="comp-stat-val">{complianceStats.totalPendingDocs}</div>
          </div>
          <span className="comp-stat-icon">📄</span>
        </div>
        <div className="comp-stat-card">
          <div>
            <div className="comp-stat-label">Pending Vehicles</div>
            <div className="comp-stat-val">{complianceStats.totalPendingVehicles}</div>
          </div>
          <span className="comp-stat-icon">🚗</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="comp-tabs">
        <button className={`comp-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => handleTabChange('documents')}>
          Pending Documents ({pendingDocuments.length})
        </button>
        <button className={`comp-tab ${activeTab === 'vehicles' ? 'active' : ''}`} onClick={() => handleTabChange('vehicles')}>
          Pending Vehicles ({pendingVehicles.length})
        </button>
      </div>

      {/* Main card */}
      <div className="comp-card">
        <div className="comp-table-wrap">
          {loadingCompliance ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>⏳ Loading verification queues...</div>
          ) : errorCompliance ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#FF4B4B' }}>❌ Error loading queues: {errorCompliance}</div>
          ) : activeTab === 'documents' ? (
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Document Type</th>
                  <th>Document Number</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDocuments.map(doc => (
                  <tr key={doc._id} onClick={() => { setSelectedDoc(doc); setExpiryDate(''); setRemarks(''); setRejectionReason(''); }}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{doc.driverId?.name || 'Driver'}</td>
                    <td><span className="um-badge" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>{doc.documentType}</span></td>
                    <td>{doc.documentNumber || '—'}</td>
                    <td>{fmt(doc.uploadedAt)}</td>
                    <td><span style={{ color: '#FFD21F', fontWeight: 700, fontSize: 11 }}>🔍 Inspect & Review</span></td>
                  </tr>
                ))}
                {pendingDocuments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#555' }}>
                      🎉 Document approval queue is clear!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Vehicle Model</th>
                  <th>License Plate</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVehicles.map(veh => (
                  <tr key={veh._id} onClick={() => { setSelectedVeh(veh); setRemarks(''); setRejectionReason(''); }}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{veh.driverId?.name || 'Driver'}</td>
                    <td>{veh.make} {veh.model} ({veh.year})</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{veh.licensePlate}</td>
                    <td><span className="um-badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>{veh.vehicleType}</span></td>
                    <td><span style={{ color: '#FFD21F', fontWeight: 700, fontSize: 11 }}>🔍 Inspect & Review</span></td>
                  </tr>
                ))}
                {pendingVehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#555' }}>
                      🎉 Vehicle approval queue is clear!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedDoc && (
        <div className="comp-modal-overlay">
          <div className="comp-modal">
            <div className="comp-modal-hdr">
              <div className="comp-modal-title">Document Inspection — {selectedDoc.documentType}</div>
              <button className="ud-close" onClick={() => setSelectedDoc(null)}>×</button>
            </div>
            <div className="comp-modal-body">
              <div className="ud-row">
                <span className="ud-label">Driver Info</span>
                <span className="ud-value">{selectedDoc.driverId?.name || '—'} ({selectedDoc.driverId?.phone || '—'})</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Document Number</span>
                <span className="ud-value">{selectedDoc.documentNumber || '—'}</span>
              </div>
              <div className="comp-doc-preview-wrap">
                <img className="comp-doc-img" src={selectedDoc.documentUrl} alt="Compliance Upload Preview" />
              </div>

              {/* Approval controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <span className="ud-label">Expiry Date (For Approval)</span>
                <input className="comp-input" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Approval Remarks</span>
                <input className="comp-input" placeholder="Optional notes for verification" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>

              {/* Rejection controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Rejection Reason (Required for Rejecting)</span>
                <input className="comp-input" placeholder="Specify why the document is being rejected" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
              </div>
            </div>
            <div className="comp-btn-row">
              <button className="comp-action-btn cancel" onClick={() => setSelectedDoc(null)}>Close</button>
              <button className="comp-action-btn reject" disabled={actionLoading} onClick={() => handleDocumentAction('reject')}>🚫 Reject</button>
              <button className="comp-action-btn approve" disabled={actionLoading} onClick={() => handleDocumentAction('approve')}>✅ Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Review Modal */}
      {selectedVeh && (
        <div className="comp-modal-overlay">
          <div className="comp-modal">
            <div className="comp-modal-hdr">
              <div className="comp-modal-title">Vehicle Inspection — {selectedVeh.make} {selectedVeh.model}</div>
              <button className="ud-close" onClick={() => setSelectedVeh(null)}>×</button>
            </div>
            <div className="comp-modal-body">
              <div className="ud-row">
                <span className="ud-label">Driver Owner</span>
                <span className="ud-value">{selectedVeh.driverId?.name || '—'} ({selectedVeh.driverId?.phone || '—'})</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Model Year</span>
                <span className="ud-value">{selectedVeh.year}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Color</span>
                <span className="ud-value">{selectedVeh.color || '—'}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">License Plate</span>
                <span className="ud-value" style={{ fontFamily: 'monospace', fontWeight: 800 }}>{selectedVeh.licensePlate}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Registration Number</span>
                <span className="ud-value">{selectedVeh.registrationNumber || '—'}</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Capacity</span>
                <span className="ud-value">{selectedVeh.capacity} Passengers</span>
              </div>
              <div className="ud-row">
                <span className="ud-label">Vehicle Type Category</span>
                <span className="ud-value"><span className="um-badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }}>{selectedVeh.vehicleType}</span></span>
              </div>

              {/* Approval controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <span className="ud-label">Verification Remarks</span>
                <input className="comp-input" placeholder="Optional notes for vehicle approval" value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>

              {/* Rejection controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Rejection Reason (Required for Rejecting)</span>
                <input className="comp-input" placeholder="Specify why the vehicle is being rejected" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
              </div>
            </div>
            <div className="comp-btn-row">
              <button className="comp-action-btn cancel" onClick={() => setSelectedVeh(null)}>Close</button>
              <button className="comp-action-btn reject" disabled={actionLoading} onClick={() => handleVehicleAction('reject')}>🚫 Reject</button>
              <button className="comp-action-btn approve" disabled={actionLoading} onClick={() => handleVehicleAction('approve')}>✅ Approve</button>
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
