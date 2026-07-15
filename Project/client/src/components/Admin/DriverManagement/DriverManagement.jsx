import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import DriverDetailsDrawer from './DriverDetailsDrawer';
import './DriverManagement.css';

const STATUS_OPTIONS = ['All', 'Pending', 'Active', 'Suspended', 'Inactive'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Rating: High → Low' },
  { value: 'compliance', label: 'Compliance' }
];

function statusStyle(status) {
  const map = {
    Active:    { bg: 'rgba(0,210,106,0.15)',  color: '#00D26A' },
    Suspended: { bg: 'rgba(255,75,75,0.15)',  color: '#FF4B4B' },
    Pending:    { bg: 'rgba(168,85,247,0.15)', color: '#C084FC' },
    Inactive:  { bg: 'rgba(255,255,255,0.08)', color: '#aaa' }
  };
  return map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#aaa' };
}

import { useSearchParams } from 'react-router-dom';

function DriverSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="dm-skeleton-row">
      {Array.from({ length: 7 }).map((__, j) => (
        <td key={j}><div className="dm-skel" style={{ width: `${60 + (j * 7) % 30}%` }} /></td>
      ))}
    </tr>
  ));
}

export default function DriverManagement() {
  const {
    drivers, driversMeta, loadingDrivers, errorDrivers,
    driverFilters, setDriverFilters, driverPage, setDriverPage,
    fetchDrivers, openDriver
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL on mount
  useEffect(() => {
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    
    setDriverFilters({ status, search, sort });
    setDriverPage(pageParam);
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

  // Debounced filter application
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== driverFilters.search) {
        setDriverFilters(f => ({ ...f, search: localSearch }));
        setDriverPage(1);
        updateUrl({ search: localSearch, page: 1 });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = useCallback((key, value) => {
    setDriverFilters(f => ({ ...f, [key]: value }));
    setDriverPage(1);
    updateUrl({ [key]: value, page: 1 });
  }, [setDriverFilters, setDriverPage, searchParams]);

  const handlePageChange = useCallback((newPage) => {
    setDriverPage(newPage);
    updateUrl({ page: newPage });
  }, [setDriverPage, searchParams]);

  const clearFilters = useCallback(() => {
    setLocalSearch('');
    setDriverFilters({ status: 'All', search: '', sort: 'newest' });
    setDriverPage(1);
    setSearchParams({}, { replace: true });
  }, [setDriverFilters, setDriverPage, setSearchParams]);

  const hasFilters = driverFilters.status !== 'All' || driverFilters.search;

  return (
    <div className="dm-root">
      <DriverDetailsDrawer />

      <div className="dm-topbar">
        <div>
          <div className="dm-title">Driver Management</div>
          <div className="dm-meta">
            {loadingDrivers ? 'Loading...' : `${(driversMeta.total || 0).toLocaleString()} total drivers`}
          </div>
        </div>
        <button className="dm-refresh-btn" onClick={() => fetchDrivers()}>⟳ Refresh</button>
      </div>

      <div className="dm-pills">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            className={`dm-pill ${driverFilters.status === s ? 'active' : ''}`}
            data-status={s}
            onClick={() => handleFilterChange('status', s)}
          >{s}</button>
        ))}
      </div>

      <div className="dm-filters">
        <input
          className="dm-search"
          placeholder="Search driver name, email, phone..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
        />
        <select
          className="dm-select"
          value={driverFilters.sort}
          onChange={e => handleFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasFilters && <button className="dm-clear-btn" onClick={clearFilters}>✕ Clear</button>}
      </div>

      <div className="dm-card">
        <div className="dm-table-wrap">
          <table className="dm-table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Rating</th>
                <th>Compliance</th>
                <th>Presence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingDrivers && <DriverSkeleton />}

              {!loadingDrivers && !errorDrivers && drivers.map(drv => {
                const sc = statusStyle(drv.status);
                return (
                  <tr key={drv._id} onClick={() => openDriver(drv._id)}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{drv.name}</td>
                    <td>{drv.email}</td>
                    <td>{drv.phone || '—'}</td>
                    <td style={{ color: '#FFD21F', fontWeight: 700 }}>
                      ⭐ {drv.rating?.toFixed(1) || '0.0'}
                    </td>
                    <td>{drv.complianceScore || 0}%</td>
                    <td>
                      <span style={{ color: drv.isOnline ? '#00D26A' : '#555', fontWeight: 600 }}>
                        <span className="dm-dot" style={{ background: drv.isOnline ? '#00D26A' : '#555' }} />
                        {drv.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <span className="dm-badge" style={{ background: sc.bg, color: sc.color }}>
                        {drv.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!loadingDrivers && !errorDrivers && drivers.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="dm-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, color: '#555' }}>
                      <span>🚕</span>
                      <span style={{ fontWeight: 700, marginTop: 8 }}>No drivers found</span>
                      {hasFilters && <button className="dm-clear-btn" style={{ marginTop: 8 }} onClick={clearFilters}>Clear Filters</button>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {driversMeta.pages > 1 && (
          <div className="rm-pagination" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="rm-page-info" style={{ fontSize: 11, color: '#555' }}>Page {driverPage} of {driversMeta.pages}</span>
            <div className="rm-page-btns" style={{ display: 'flex', gap: 4 }}>
              <button className="rm-page-btn" disabled={driverPage <= 1} onClick={() => handlePageChange(driverPage - 1)}>‹</button>
              <button className="rm-page-btn active">{driverPage}</button>
              <button className="rm-page-btn" disabled={driverPage >= driversMeta.pages} onClick={() => handlePageChange(driverPage + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
