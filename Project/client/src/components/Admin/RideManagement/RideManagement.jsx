/**
 * RideManagement.jsx — UCAB Enterprise (Sprint 22)
 *
 * Full-page Ride Management module for Admin Portal.
 * Data comes exclusively from AdminContext (backed by AdminApiService).
 * No mock data. No raw fetch() calls.
 */
import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import RideDetailsDrawer from './RideDetailsDrawer';
import './RideManagement.css';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['All', 'Pending', 'Searching', 'Ongoing', 'Accepted', 'InProgress', 'Completed', 'Cancelled'];
const SORT_OPTIONS   = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'oldest',    label: 'Oldest First' },
  { value: 'fare-high', label: 'Fare: High → Low' },
  { value: 'fare-low',  label: 'Fare: Low → High' },
];

const PILL_STATUSES = ['All', 'Ongoing', 'Completed', 'Cancelled', 'Pending'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const fmtTime = (d) => d
  ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  : '';

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function RideSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="rm-skeleton-row">
      {Array.from({ length: 8 }).map((__, j) => (
        <td key={j}><div className="rm-skel" style={{ width: `${60 + (j * 7) % 30}%` }} /></td>
      ))}
    </tr>
  ));
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function RideEmpty({ hasFilters, onClear }) {
  return (
    <div className="rm-empty">
      <div className="rm-empty-icon">🚖</div>
      <div className="rm-empty-title">{hasFilters ? 'No rides match your filters' : 'No rides yet'}</div>
      <div className="rm-empty-sub">
        {hasFilters
          ? 'Try adjusting your search or filter criteria'
          : 'Rides will appear here once passengers start booking'}
      </div>
      {hasFilters && (
        <button className="rm-clear-btn" style={{ marginTop: 6 }} onClick={onClear}>Clear Filters</button>
      )}
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function RidePagination({ meta, page, setPage }) {
  if (meta.pages <= 1) return null;

  const buildPages = () => {
    const { pages } = meta;
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const left  = Math.max(2, page - 1);
    const right = Math.min(pages - 1, page + 1);
    const arr = [1];
    if (left > 2) arr.push('...');
    for (let i = left; i <= right; i++) arr.push(i);
    if (right < pages - 1) arr.push('...');
    arr.push(pages);
    return arr;
  };

  const pages = buildPages();
  const from  = (page - 1) * 20 + 1;
  const to    = Math.min(page * 20, meta.total);

  return (
    <div className="rm-pagination">
      <span className="rm-page-info">Showing {from}–{to} of {meta.total.toLocaleString()} rides</span>
      <div className="rm-page-btns">
        <button className="rm-page-btn" disabled={page <= 1}       onClick={() => setPage(p => p - 1)}>‹</button>
        {pages.map((p, i) => (
          <button
            key={i}
            className={`rm-page-btn ${p === page ? 'active' : ''}`}
            disabled={p === '...'}
            onClick={() => typeof p === 'number' && setPage(p)}
          >{p}</button>
        ))}
        <button className="rm-page-btn" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>›</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

import { useSearchParams } from 'react-router-dom';

export default function RideManagement() {
  const {
    rides, ridesMeta, loadingRides, errorRides,
    filters, setFilters, page, setPage,
    fetchRides, openRide,
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL on mount
  useEffect(() => {
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const sort = searchParams.get('sort') || 'newest';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    
    setFilters({ status, search, from, to, sort });
    setPage(pageParam);
    setLocalSearch(search);
  }, []); // Run only once

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  const updateUrl = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== 'newest' && value !== 1) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams, { replace: true });
  };

  // Debounce search input — apply after 350ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters(f => ({ ...f, search: localSearch }));
        setPage(1);
        updateUrl({ search: localSearch, page: 1 });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = useCallback((key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
    updateUrl({ [key]: value, page: 1 });
  }, [setFilters, setPage, searchParams]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    updateUrl({ page: newPage });
  }, [setPage, searchParams]);

  const hasFilters = filters.status !== 'All' || filters.search || filters.from || filters.to;

  const clearFilters = useCallback(() => {
    setLocalSearch('');
    setFilters({ status: 'All', search: '', from: '', to: '', sort: 'newest' });
    setPage(1);
    setSearchParams({}, { replace: true });
  }, [setFilters, setPage, setSearchParams]);

  const handleRefresh = useCallback(() => {
    // Invalidate via adminApiService (AdminContext will re-fetch)
    fetchRides();
  }, [fetchRides]);

  return (
    <div className="rm-root">
      {/* Drawer (renders globally positioned) */}
      <RideDetailsDrawer />

      {/* Top Bar */}
      <div className="rm-topbar">
        <div>
          <div className="rm-title">Ride Management</div>
          <div className="rm-meta">
            {loadingRides ? 'Loading...' : `${(ridesMeta.total || 0).toLocaleString()} total rides`}
          </div>
        </div>
        <button className="rm-refresh-btn" onClick={handleRefresh}>⟳ Refresh</button>
      </div>

      {/* Status Pills */}
      <div className="rm-pills">
        {PILL_STATUSES.map(s => (
          <button
            key={s}
            className={`rm-pill ${filters.status === s ? 'active' : ''}`}
            data-status={s}
            onClick={() => handleFilterChange('status', s)}
          >{s}</button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="rm-filters">
        <input
          className="rm-search"
          placeholder="Search passenger, pickup, drop-off..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
        />
        <input
          type="date"
          className="rm-date-input"
          value={filters.from}
          onChange={e => handleFilterChange('from', e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="rm-date-input"
          value={filters.to}
          onChange={e => handleFilterChange('to', e.target.value)}
          title="To date"
        />
        <select
          className="rm-select"
          value={filters.sort}
          onChange={e => handleFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasFilters && <button className="rm-clear-btn" onClick={clearFilters}>✕ Clear</button>}
      </div>

      {/* Table Card */}
      <div className="rm-card">
        <div className="rm-table-wrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Ride ID</th>
                <th>Passenger</th>
                <th>Pickup</th>
                <th>Drop-off</th>
                <th>Driver</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loadingRides && <RideSkeleton />}

              {!loadingRides && !errorRides && rides.map(ride => {
                const sc = statusStyle(ride.status);
                const paxName = ride.userId?.name || ride.passengerName || 'Passenger';
                return (
                  <tr
                    key={ride._id}
                    onClick={() => openRide(ride._id)}
                    title="Click to view details"
                  >
                    <td style={{ color: '#FFD21F', fontWeight: 700, fontSize: 11 }}>
                      #{String(ride._id).slice(-6).toUpperCase()}
                    </td>
                    <td style={{ fontWeight: 600, color: '#e0e0e0' }}>{paxName}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ride.pickupLocation || '—'}
                    </td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ride.dropoffLocation || '—'}
                    </td>
                    <td style={{ color: ride.driver ? '#ccc' : '#444' }}>
                      {ride.driver?.name || '—'}
                    </td>
                    <td style={{ fontWeight: 800, color: '#FFD21F' }}>
                      ₹{(ride.fare || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className="rm-badge" style={{ background: sc.bg, color: sc.color }}>
                        {ride.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 11 }}>{fmt(ride.createdAt)}</div>
                      <div style={{ fontSize: 10, color: '#555' }}>{fmtTime(ride.createdAt)}</div>
                    </td>
                  </tr>
                );
              })}

              {!loadingRides && !errorRides && rides.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <RideEmpty hasFilters={hasFilters} onClear={clearFilters} />
                  </td>
                </tr>
              )}

              {!loadingRides && errorRides && (
                <tr>
                  <td colSpan={8}>
                    <div className="rm-empty">
                      <div className="rm-empty-icon">⚠️</div>
                      <div className="rm-empty-title">Failed to load rides</div>
                      <div className="rm-empty-sub">{errorRides}</div>
                      <button className="rm-refresh-btn" style={{ marginTop: 8 }} onClick={handleRefresh}>
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <RidePagination meta={ridesMeta} page={page} setPage={handlePageChange} />
      </div>
    </div>
  );
}
