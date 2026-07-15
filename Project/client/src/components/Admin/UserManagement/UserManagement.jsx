import React, { useContext, useCallback, useEffect, useState } from 'react';
import { AdminContext } from '../../../context/AdminContext';
import UserDetailsDrawer from './UserDetailsDrawer';
import './UserManagement.css';

const STATUS_OPTIONS = ['All', 'Active', 'Suspended', 'Pending', 'Inactive'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Joined: Newest' },
  { value: 'oldest', label: 'Joined: Oldest' }
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

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

import { useSearchParams } from 'react-router-dom';

function UserSkeleton() {
  return Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="um-skeleton-row">
      {Array.from({ length: 5 }).map((__, j) => (
        <td key={j}><div className="um-skel" style={{ width: `${65 + (j * 7) % 25}%` }} /></td>
      ))}
    </tr>
  ));
}

export default function UserManagement() {
  const {
    users, usersMeta, loadingUsers, errorUsers,
    userFilters, setUserFilters, userPage, setUserPage,
    fetchUsers, openUser
  } = useContext(AdminContext);

  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL on mount
  useEffect(() => {
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const pageParam = parseInt(searchParams.get('page')) || 1;
    
    setUserFilters({ status, search, sort });
    setUserPage(pageParam);
    setLocalSearch(search);
  }, []); // Run only once

  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Debounce search filters
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== userFilters.search) {
        setUserFilters(f => ({ ...f, search: localSearch }));
        setUserPage(1);
        updateUrl({ search: localSearch, page: 1 });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleFilterChange = useCallback((key, value) => {
    setUserFilters(f => ({ ...f, [key]: value }));
    setUserPage(1);
    updateUrl({ [key]: value, page: 1 });
  }, [setUserFilters, setUserPage, searchParams]);

  const handlePageChange = useCallback((newPage) => {
    setUserPage(newPage);
    updateUrl({ page: newPage });
  }, [setUserPage, searchParams]);

  const clearFilters = useCallback(() => {
    setLocalSearch('');
    setUserFilters({ status: 'All', search: '', sort: 'newest' });
    setUserPage(1);
    setSearchParams({}, { replace: true });
  }, [setUserFilters, setUserPage, setSearchParams]);

  const hasFilters = userFilters.status !== 'All' || userFilters.search;

  return (
    <div className="um-root">
      <UserDetailsDrawer />

      <div className="um-topbar">
        <div>
          <div className="um-title">Passenger Management</div>
          <div className="um-meta">
            {loadingUsers ? 'Loading...' : `${(usersMeta.total || 0).toLocaleString()} total passengers`}
          </div>
        </div>
        <button className="um-refresh-btn" onClick={() => fetchUsers()}>⟳ Refresh</button>
      </div>

      <div className="um-pills">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            className={`um-pill ${userFilters.status === s ? 'active' : ''}`}
            data-status={s}
            onClick={() => handleFilterChange('status', s)}
          >{s}</button>
        ))}
      </div>

      <div className="um-filters">
        <input
          className="um-search"
          placeholder="Search passenger name, email, phone..."
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
        />
        <select
          className="um-select"
          value={userFilters.sort}
          onChange={e => handleFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {hasFilters && <button className="um-clear-btn" onClick={clearFilters}>✕ Clear</button>}
      </div>

      <div className="um-card">
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Passenger Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers && <UserSkeleton />}

              {!loadingUsers && !errorUsers && users.map(usr => {
                const sc = statusStyle(usr.status);
                return (
                  <tr key={usr._id} onClick={() => openUser(usr._id)}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{usr.name}</td>
                    <td>{usr.email}</td>
                    <td>{usr.phone || '—'}</td>
                    <td>{fmt(usr.createdAt)}</td>
                    <td>
                      <span className="um-badge" style={{ background: sc.bg, color: sc.color }}>
                        {usr.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!loadingUsers && !errorUsers && users.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="um-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, color: '#555' }}>
                      <span style={{ fontSize: 24 }}>👤</span>
                      <span style={{ fontWeight: 700, marginTop: 8 }}>No passengers found</span>
                      {hasFilters && <button className="um-clear-btn" style={{ marginTop: 8 }} onClick={clearFilters}>Clear Filters</button>}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {usersMeta.pages > 1 && (
          <div className="rm-pagination" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="rm-page-info" style={{ fontSize: 11, color: '#555' }}>Page {userPage} of {usersMeta.pages}</span>
            <div className="rm-page-btns" style={{ display: 'flex', gap: 4 }}>
              <button className="rm-page-btn" disabled={userPage <= 1} onClick={() => handlePageChange(userPage - 1)}>‹</button>
              <button className="rm-page-btn active">{userPage}</button>
              <button className="rm-page-btn" disabled={userPage >= usersMeta.pages} onClick={() => handlePageChange(userPage + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
