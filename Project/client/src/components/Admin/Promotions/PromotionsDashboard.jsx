import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import './Promotions.css';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtCur = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

import { useSearchParams } from 'react-router-dom';

export default function PromotionsDashboard() {
  const {
    promotionDashboard, promotions, coupons, referrals, driverIncentives, campaignAnalytics, loadingPromotions, errorPromotions,
    fetchPromotionDashboard, fetchPromotions, createPromotion, updatePromotion, deletePromotion,
    activatePromotion, deactivatePromotion, fetchCoupons, createCoupon, updateCoupon, deleteCoupon,
    fetchReferralPrograms, createReferralProgram, updateReferralProgram, fetchDriverIncentives,
    createDriverIncentive, updateDriverIncentive, enableDriverIncentive, disableDriverIncentive, fetchCampaignAnalytics
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'campaigns');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };
  
  // Modals visibility & data hooks
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoBudget, setPromoBudget] = useState('');
  const [promoStart, setPromoStart] = useState('');
  const [promoEnd, setPromoEnd] = useState('');

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponValType, setCouponValType] = useState('Percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponMinFare, setCouponMinFare] = useState('');
  const [couponMaxDisc, setCouponMaxDisc] = useState('');
  const [couponCampaignId, setCouponCampaignId] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');

  const [showReferralModal, setShowReferralModal] = useState(false);
  const [editingReferral, setEditingReferral] = useState(null);
  const [refUserId, setRefUserId] = useState('');
  const [refCode, setRefCode] = useState('');
  const [refReward, setRefReward] = useState('');
  const [refMaxUses, setRefMaxUses] = useState('');

  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [editingIncentive, setEditingIncentive] = useState(null);
  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incTrips, setIncTrips] = useState('');
  const [incReward, setIncReward] = useState('');
  const [incStart, setIncStart] = useState('');
  const [incEnd, setIncEnd] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPromotionDashboard();
    if (activeTab === 'campaigns') fetchPromotions();
    if (activeTab === 'coupons') { fetchCoupons(); fetchPromotions(); }
    if (activeTab === 'referrals') fetchReferralPrograms();
    if (activeTab === 'incentives') fetchDriverIncentives();
    if (activeTab === 'analytics') fetchCampaignAnalytics();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg, color = '#00D26A') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Promo operations
  const openCreatePromo = () => {
    setEditingPromo(null);
    setPromoName('');
    setPromoDesc('');
    setPromoBudget('');
    setPromoStart('');
    setPromoEnd('');
    setShowPromoModal(true);
  };

  const openEditPromo = (promo) => {
    setEditingPromo(promo);
    setPromoName(promo.name);
    setPromoDesc(promo.description);
    setPromoBudget(promo.budget.toString());
    setPromoStart(promo.startDate.split('T')[0]);
    setPromoEnd(promo.endDate.split('T')[0]);
    setShowPromoModal(true);
  };

  const handleSavePromo = async () => {
    if (!promoName || !promoDesc || !promoStart || !promoEnd) {
      showToast('Please fill out all required fields', '#FF4B4B');
      return;
    }
    setActionLoading(true);
    const payload = {
      name: promoName,
      description: promoDesc,
      budget: parseFloat(promoBudget) || 0,
      startDate: promoStart,
      endDate: promoEnd
    };
    const res = editingPromo
      ? await updatePromotion(editingPromo._id, payload)
      : await createPromotion(payload);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(editingPromo ? 'Campaign updated successfully' : 'Campaign created successfully');
      setShowPromoModal(false);
      fetchPromotions();
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion campaign? All related auto-offers will be cleaned up.')) return;
    setActionLoading(true);
    const res = await deletePromotion(id);
    setActionLoading(false);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast('Campaign deleted successfully');
      fetchPromotions();
    }
  };

  const handleTogglePromo = async (promo) => {
    setActionLoading(true);
    const res = promo.status === 'Active'
      ? await deactivatePromotion(promo._id)
      : await activatePromotion(promo._id);
    setActionLoading(false);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast(`Campaign status updated to ${promo.status === 'Active' ? 'Paused' : 'Active'}`);
      fetchPromotions();
    }
  };

  // Coupon operations
  const openCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponCode('');
    setCouponValType('Percentage');
    setCouponValue('');
    setCouponMinFare('');
    setCouponMaxDisc('');
    setCouponCampaignId(promotions[0]?._id || '');
    setCouponExpiry('');
    setShowCouponModal(true);
  };

  const openEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponCode(coupon.code);
    setCouponValType(coupon.type);
    setCouponValue(coupon.value.toString());
    setCouponMinFare(coupon.minFare?.toString() || '');
    setCouponMaxDisc(coupon.maxDiscount?.toString() || '');
    setCouponCampaignId(coupon.campaignId?._id || coupon.campaignId || '');
    setCouponExpiry(coupon.expiryDate.split('T')[0]);
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async () => {
    if (!couponCode || !couponValue || !couponExpiry) {
      showToast('Please fill out all required fields', '#FF4B4B');
      return;
    }
    setActionLoading(true);
    const payload = {
      code: couponCode,
      type: couponValType,
      value: parseFloat(couponValue),
      minFare: parseFloat(couponMinFare) || 0,
      maxDiscount: parseFloat(couponMaxDisc) || undefined,
      campaignId: couponCampaignId || undefined,
      expiryDate: couponExpiry
    };
    const res = editingCoupon
      ? await updateCoupon(editingCoupon._id, payload)
      : await createCoupon(payload);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully');
      setShowCouponModal(false);
      fetchCoupons();
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    setActionLoading(true);
    const res = await deleteCoupon(id);
    setActionLoading(false);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast('Coupon deleted successfully');
      fetchCoupons();
    }
  };

  // Referral operations
  const openCreateReferral = () => {
    setEditingReferral(null);
    setRefUserId('');
    setRefCode('');
    setRefReward('');
    setRefMaxUses('');
    setShowReferralModal(true);
  };

  const openEditReferral = (ref) => {
    setEditingReferral(ref);
    setRefUserId(ref.userId?._id || ref.userId || '');
    setRefCode(ref.code);
    setRefReward(ref.rewardAmount.toString());
    setRefMaxUses(ref.maxUses.toString());
    setShowReferralModal(true);
  };

  const handleSaveReferral = async () => {
    if (!refCode || !refReward) {
      showToast('Please fill out all required fields', '#FF4B4B');
      return;
    }
    setActionLoading(true);
    const payload = {
      userId: refUserId || undefined,
      code: refCode,
      rewardAmount: parseFloat(refReward),
      maxUses: parseInt(refMaxUses, 10) || 50
    };
    const res = editingReferral
      ? await updateReferralProgram(editingReferral._id, payload)
      : await createReferralProgram(payload);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(editingReferral ? 'Referral program updated successfully' : 'Referral program created successfully');
      setShowReferralModal(false);
      fetchReferralPrograms();
    }
  };

  // Driver Quest operations
  const openCreateIncentive = () => {
    setEditingIncentive(null);
    setIncTitle('');
    setIncDesc('');
    setIncTrips('');
    setIncReward('');
    setIncStart('');
    setIncEnd('');
    setShowIncentiveModal(true);
  };

  const openEditIncentive = (inc) => {
    setEditingIncentive(inc);
    setIncTitle(inc.title);
    setIncDesc(inc.description || '');
    setIncTrips(inc.targetTrips.toString());
    setIncReward(inc.reward.toString());
    setIncStart(inc.startDate.split('T')[0]);
    setIncEnd(inc.endDate.split('T')[0]);
    setShowIncentiveModal(true);
  };

  const handleSaveIncentive = async () => {
    if (!incTitle || !incTrips || !incReward || !incStart || !incEnd) {
      showToast('Please fill out all required fields', '#FF4B4B');
      return;
    }
    setActionLoading(true);
    const payload = {
      title: incTitle,
      description: incDesc,
      targetTrips: parseInt(incTrips, 10),
      reward: parseFloat(incReward),
      startDate: incStart,
      endDate: incEnd
    };
    const res = editingIncentive
      ? await updateDriverIncentive(editingIncentive._id, payload)
      : await createDriverIncentive(payload);
    setActionLoading(false);
    if (res?.error) {
      showToast(`Error: ${res.error}`, '#FF4B4B');
    } else {
      showToast(editingIncentive ? 'Incentive quest updated successfully' : 'Incentive quest created successfully');
      setShowIncentiveModal(false);
      fetchDriverIncentives();
    }
  };

  const handleToggleIncentive = async (inc) => {
    setActionLoading(true);
    const res = inc.active
      ? await disableDriverIncentive(inc._id)
      : await enableDriverIncentive(inc._id);
    setActionLoading(false);
    if (res?.error) showToast(`Error: ${res.error}`, '#FF4B4B');
    else {
      showToast(`Quest status updated to ${inc.active ? 'Disabled' : 'Enabled'}`);
      fetchDriverIncentives();
    }
  };

  return (
    <div className="promo-root">
      <div className="promo-topbar">
        <div className="promo-title-wrap">
          <div className="promo-title">Marketing & Promotions Center</div>
          <div className="promo-subtitle">Configure discount coupons, referral codes, campaigns, and driver incentive quests</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeTab === 'campaigns' && <button className="comp-action-btn approve" style={{ padding: '8px 12px', fontSize: 11 }} onClick={openCreatePromo}>➕ Add Campaign</button>}
          {activeTab === 'coupons' && <button className="comp-action-btn approve" style={{ padding: '8px 12px', fontSize: 11 }} onClick={openCreateCoupon}>➕ Add Coupon</button>}
          {activeTab === 'referrals' && <button className="comp-action-btn approve" style={{ padding: '8px 12px', fontSize: 11 }} onClick={openCreateReferral}>➕ Add Referral Program</button>}
          {activeTab === 'incentives' && <button className="comp-action-btn approve" style={{ padding: '8px 12px', fontSize: 11 }} onClick={openCreateIncentive}>➕ Add Quest</button>}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="promo-stats-grid">
        <div className="promo-stat-card">
          <div>
            <div className="promo-stat-label">Active Campaigns</div>
            <div className="promo-stat-val">{promotionDashboard?.campaignCount || 0}</div>
          </div>
          <span className="promo-stat-icon">🎁</span>
        </div>
        <div className="promo-stat-card">
          <div>
            <div className="promo-stat-label">Coupons Defined</div>
            <div className="promo-stat-val">{promotionDashboard?.couponCount || 0}</div>
          </div>
          <span className="promo-stat-icon">📄</span>
        </div>
        <div className="promo-stat-card">
          <div>
            <div className="promo-stat-label">Total Redemptions</div>
            <div className="promo-stat-val">{promotionDashboard?.totalRedemptions || 0}</div>
          </div>
          <span className="promo-stat-icon">🔥</span>
        </div>
        <div className="promo-stat-card">
          <div>
            <div className="promo-stat-label">Bonus Paid to Drivers</div>
            <div className="promo-stat-val" style={{ color: '#00D26A' }}>{fmtCur(promotionDashboard?.totalBonusPaid)}</div>
          </div>
          <span className="promo-stat-icon" style={{ color: '#00D26A' }}>💰</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="promo-tabs">
        <button className={`promo-tab ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => handleTabChange('campaigns')}>Promotions</button>
        <button className={`promo-tab ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => handleTabChange('coupons')}>Coupons</button>
        <button className={`promo-tab ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => handleTabChange('referrals')}>Referral Codes</button>
        <button className={`promo-tab ${activeTab === 'incentives' ? 'active' : ''}`} onClick={() => handleTabChange('incentives')}>Driver Incentives</button>
        <button className={`promo-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabChange('analytics')}>Analytics</button>
      </div>

      {/* Content panel */}
      <div className="promo-card">
        <div className="promo-table-wrap">
          {loadingPromotions ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>⏳ Loading promotion configuration details...</div>
          ) : errorPromotions ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#FF4B4B' }}>❌ Error: {errorPromotions}</div>
          ) : activeTab === 'campaigns' ? (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Budget</th>
                  <th>Spend</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{p.name}</td>
                    <td>{fmtCur(p.budget)}</td>
                    <td style={{ color: '#FFD21F' }}>{fmtCur(p.spend)}</td>
                    <td>{fmt(p.startDate)} - {fmt(p.endDate)}</td>
                    <td>
                      <span className="um-badge" style={{
                        background: p.status === 'Active' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                        color: p.status === 'Active' ? '#00D26A' : '#FF4B4B'
                      }}>{p.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleTogglePromo(p)}>{p.status === 'Active' ? 'Pause' : 'Activate'}</button>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#ccc' }} onClick={() => openEditPromo(p)}>Edit</button>
                        <button className="comp-action-btn reject" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleDeletePromo(p._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'coupons' ? (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Coupon Code</th>
                  <th>Discount Value</th>
                  <th>Min Fare</th>
                  <th>Campaign</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 800, color: '#FFD21F', fontFamily: 'monospace' }}>{c.code}</td>
                    <td>{c.type === 'Percentage' ? `${c.value}%` : fmtCur(c.value)}</td>
                    <td>{fmtCur(c.minFare)}</td>
                    <td>{c.campaignId?.name || '—'}</td>
                    <td>{fmt(c.expiryDate)}</td>
                    <td>
                      <span className="um-badge" style={{
                        background: c.active ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                        color: c.active ? '#00D26A' : '#FF4B4B'
                      }}>{c.active ? 'Active' : 'Disabled'}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#ccc' }} onClick={() => openEditCoupon(c)}>Edit</button>
                        <button className="comp-action-btn reject" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleDeleteCoupon(c._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'referrals' ? (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Account Holder</th>
                  <th>Referral Code</th>
                  <th>Reward (INR)</th>
                  <th>Uses Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(r => (
                  <tr key={r._id}>
                    <td>{r.userId?.name || 'Global default'}</td>
                    <td style={{ fontWeight: 800, color: '#FFD21F', fontFamily: 'monospace' }}>{r.code}</td>
                    <td style={{ color: '#00D26A', fontWeight: 700 }}>{fmtCur(r.rewardAmount)}</td>
                    <td>{r.totalUses} / {r.maxUses}</td>
                    <td>
                      <span className="um-badge" style={{
                        background: r.status === 'Active' ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                        color: r.status === 'Active' ? '#00D26A' : '#FF4B4B'
                      }}>{r.status}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#ccc' }} onClick={() => openEditReferral(r)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'incentives' ? (
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Quest Title</th>
                  <th>Target Trips</th>
                  <th>Quest Reward</th>
                  <th>Duration Period</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {driverIncentives.map(i => (
                  <tr key={i._id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{i.title}</td>
                    <td>{i.targetTrips} Completed rides</td>
                    <td style={{ color: '#00D26A', fontWeight: 800 }}>{fmtCur(i.reward)}</td>
                    <td>{fmt(i.startDate)} - {fmt(i.endDate)}</td>
                    <td>
                      <span className="um-badge" style={{
                        background: i.active ? 'rgba(0,210,106,0.15)' : 'rgba(255,75,75,0.15)',
                        color: i.active ? '#00D26A' : '#FF4B4B'
                      }}>{i.active ? 'Enabled' : 'Disabled'}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10 }} onClick={() => handleToggleIncentive(i)}>{i.active ? 'Disable' : 'Enable'}</button>
                        <button className="comp-action-btn approve" style={{ padding: '4px 8px', fontSize: 10, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', color: '#ccc' }} onClick={() => openEditIncentive(i)}>Edit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 24, color: '#aaa', lineHeight: 1.6 }}>
              <h3 style={{ color: '#fff', marginBottom: 12 }}>Marketing Campaigns Performance Analytics</h3>
              <p>Platform campaigns configured: <strong style={{ color: '#FFD21F' }}>{campaignAnalytics?.campaignCount || 0}</strong></p>
              <p>Coupons active in database: <strong style={{ color: '#FFD21F' }}>{campaignAnalytics?.couponCount || 0}</strong></p>
              <p>Total successful ride redemptions: <strong style={{ color: '#00D26A' }}>{campaignAnalytics?.totalRedemptions || 0}</strong></p>
              <p>Total bonus payouts released: <strong style={{ color: '#00D26A' }}>{fmtCur(campaignAnalytics?.totalBonusPaid)}</strong></p>
            </div>
          )}
        </div>
      </div>

      {/* Promotion Campaign Modal */}
      {showPromoModal && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-hdr">
              <div className="promo-modal-title">{editingPromo ? 'Edit Promotion Campaign' : 'Create New Campaign'}</div>
              <button className="ud-close" onClick={() => setShowPromoModal(false)}>×</button>
            </div>
            <div className="promo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Campaign Name *</span>
                <input className="promo-input" placeholder="e.g. Monsoon Special Promo" value={promoName} onChange={e => setPromoName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Description *</span>
                <input className="promo-input" placeholder="Specify user-facing offer description" value={promoDesc} onChange={e => setPromoDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Budget Limit (INR)</span>
                <input className="promo-input" type="number" placeholder="e.g. 50000" value={promoBudget} onChange={e => setPromoBudget(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Start Date *</span>
                  <input className="promo-input" type="date" value={promoStart} onChange={e => setPromoStart(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">End Date *</span>
                  <input className="promo-input" type="date" value={promoEnd} onChange={e => setPromoEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="promo-btn-row">
              <button className="promo-action-btn cancel" onClick={() => setShowPromoModal(false)}>Cancel</button>
              <button className="promo-action-btn submit" disabled={actionLoading} onClick={handleSavePromo}>Save Campaign</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-hdr">
              <div className="promo-modal-title">{editingCoupon ? 'Edit Coupon Code' : 'Add Discount Coupon'}</div>
              <button className="ud-close" onClick={() => setShowCouponModal(false)}>×</button>
            </div>
            <div className="promo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Coupon Code *</span>
                <input className="promo-input" placeholder="e.g. UCAB50" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Discount Type *</span>
                  <select className="promo-select" value={couponValType} onChange={e => setCouponValType(e.target.value)}>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat (INR)</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Value *</span>
                  <input className="promo-input" type="number" placeholder="Value (e.g. 15 or 100)" value={couponValue} onChange={e => setCouponValue(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Min Fare Required</span>
                  <input className="promo-input" type="number" placeholder="Min ride fare (e.g. 100)" value={couponMinFare} onChange={e => setCouponMinFare(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Max Discount Cap</span>
                  <input className="promo-input" type="number" placeholder="For percentage coupons" value={couponMaxDisc} onChange={e => setCouponMaxDisc(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Campaign Link</span>
                <select className="promo-select" value={couponCampaignId} onChange={e => setCouponCampaignId(e.target.value)}>
                  {promotions.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Expiry Date *</span>
                <input className="promo-input" type="date" value={couponExpiry} onChange={e => setCouponExpiry(e.target.value)} />
              </div>
            </div>
            <div className="promo-btn-row">
              <button className="promo-action-btn cancel" onClick={() => setShowCouponModal(false)}>Cancel</button>
              <button className="promo-action-btn submit" disabled={actionLoading} onClick={handleSaveCoupon}>Save Coupon</button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-hdr">
              <div className="promo-modal-title">{editingReferral ? 'Edit Referral Program' : 'Add Referral Reward'}</div>
              <button className="ud-close" onClick={() => setShowReferralModal(false)}>×</button>
            </div>
            <div className="promo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Referrer User ID (Optional)</span>
                <input className="promo-input" placeholder="User ID (Leave empty for system-wide code)" value={refUserId} onChange={e => setRefUserId(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Referral Code *</span>
                <input className="promo-input" placeholder="e.g. UCAB-INVITE" value={refCode} onChange={e => setRefCode(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Reward Amount (INR) *</span>
                  <input className="promo-input" type="number" placeholder="e.g. 50" value={refReward} onChange={e => setRefReward(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Max Uses Limit</span>
                  <input className="promo-input" type="number" placeholder="e.g. 50" value={refMaxUses} onChange={e => setRefMaxUses(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="promo-btn-row">
              <button className="promo-action-btn cancel" onClick={() => setShowReferralModal(false)}>Cancel</button>
              <button className="promo-action-btn submit" disabled={actionLoading} onClick={handleSaveReferral}>Save Referral</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Incentive Quest Modal */}
      {showIncentiveModal && (
        <div className="promo-modal-overlay">
          <div className="promo-modal">
            <div className="promo-modal-hdr">
              <div className="promo-modal-title">{editingIncentive ? 'Edit Driver Quest' : 'Add Driver Incentive Quest'}</div>
              <button className="ud-close" onClick={() => setShowIncentiveModal(false)}>×</button>
            </div>
            <div className="promo-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Quest Title *</span>
                <input className="promo-input" placeholder="e.g. Complete 5 Trips Today" value={incTitle} onChange={e => setIncTitle(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="ud-label">Description</span>
                <input className="promo-input" placeholder="Enter quest user instructions" value={incDesc} onChange={e => setIncDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Target Trips *</span>
                  <input className="promo-input" type="number" placeholder="e.g. 5" value={incTrips} onChange={e => setIncTrips(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Quest Cash Reward *</span>
                  <input className="promo-input" type="number" placeholder="Reward in INR" value={incReward} onChange={e => setIncReward(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">Start Date *</span>
                  <input className="promo-input" type="date" value={incStart} onChange={e => setIncStart(e.target.value)} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="ud-label">End Date *</span>
                  <input className="promo-input" type="date" value={incEnd} onChange={e => setIncEnd(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="promo-btn-row">
              <button className="promo-action-btn cancel" onClick={() => setShowIncentiveModal(false)}>Cancel</button>
              <button className="promo-action-btn submit" disabled={actionLoading} onClick={handleSaveIncentive}>Save Quest</button>
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
