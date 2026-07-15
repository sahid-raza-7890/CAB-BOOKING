import React, {
  useState, useEffect, useContext, useRef, useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AdminContext } from '../context/AdminContext';
import { io } from 'socket.io-client';
import RideManagement from './Admin/RideManagement/RideManagement';
import DriverManagement from './Admin/DriverManagement/DriverManagement';
import UserManagement from './Admin/UserManagement/UserManagement';
import ComplianceDashboard from './Admin/Compliance/ComplianceDashboard';
import FinanceDashboard from './Admin/Finance/FinanceDashboard';
import PromotionsDashboard from './Admin/Promotions/PromotionsDashboard';
import SafetyDashboard from './Admin/Safety/SafetyDashboard';
import AnalyticsDashboard from './Admin/Analytics';
import SettingsDashboard from './Admin/Settings';
import NotificationsDashboard from './Admin/Notifications';

import AuditDashboard from './Admin/Audit';
import OperationsDashboard from './Admin/Operations';

// ─── FONT ─────────────────────────────────────────────────────────────────────
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`;

// ─── LOGO ─────────────────────────────────────────────────────────────────────
let logoSrc = null;
try { logoSrc = new URL('../assets/logo-01.png', import.meta.url).href; } catch (_) {}

// ─── SIDEBAR NAV ITEMS ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',     icon: '🏠', label: 'Dashboard' },
  { id: 'rides',         icon: '🚖', label: 'Ride Management' },
  { id: 'users',         icon: '👤', label: 'Passengers' },
  { id: 'drivers',       icon: '🚕', label: 'Drivers' },
  { id: 'earnings',      icon: '💰', label: 'Earnings' },
  { id: 'payments',      icon: '💳', label: 'Payments' },
  { id: 'promotions',    icon: '🎁', label: 'Promotions' },
  { id: 'analytics',     icon: '📊', label: 'Analytics' },
  { id: 'tracking',      icon: '📍', label: 'Live Tracking' },
  { id: 'safety',        icon: '🛡️', label: 'Safety Center' },
  { id: 'support',       icon: '🎫', label: 'Support Tickets', badge: 7 },
  { id: 'ratings',       icon: '⭐', label: 'Ratings' },
  { id: 'packages',      icon: '📦', label: 'Packages' },
  { id: 'vehicles',      icon: '🚗', label: 'Vehicle Verification' },
  { id: 'documents',     icon: '📄', label: 'Documents' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'areas',         icon: '🌍', label: 'Service Areas' },
  { id: 'settings',      icon: '⚙️', label: 'Settings' },

  { id: 'audit',         icon: '📜', label: 'Audit Timeline' },
  { id: 'operations',    icon: '🎛️', label: 'Live Operations' },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
.ap-root {
  font-family: 'Inter', sans-serif;
  background: #070707;
  color: #fff;
  height: 100vh; width: 100vw;
  display: flex; flex-direction: column;
  overflow: hidden;
}
/* HEADER */
.ap-header {
  height: 64px; min-height: 64px;
  background: rgba(10,10,10,0.95);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; padding: 0 20px; gap: 12px; z-index: 200;
}
.ap-search-wrap {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 8px 14px; flex: 1; max-width: 300px;
}
.ap-search-wrap input {
  background: none; border: none; outline: none; color: #fff;
  font-size: 13px; font-family: 'Inter',sans-serif; width: 100%;
}
.ap-search-wrap input::placeholder { color: #555; }
.ap-kbd {
  font-size: 10px; color: #555; background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 5px; padding: 2px 6px;
  white-space: nowrap;
}
.ap-hdr-stats {
  display: flex; align-items: center; gap: 0;
  flex: 1; justify-content: center;
}
.ap-hdr-stat {
  display: flex; flex-direction: column; align-items: center;
  padding: 0 20px; border-right: 1px solid rgba(255,255,255,0.07);
}
.ap-hdr-stat:last-child { border-right: none; }
.ap-hdr-stat-label { font-size: 9px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.ap-hdr-stat-val { font-size: 15px; font-weight: 900; margin-top: 1px; }
.ap-hdr-stat-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; color: #00D26A;
}
.ap-hdr-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.ap-icon-btn {
  position: relative; width: 34px; height: 34px; border-radius: 9px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #aaa; transition: all 0.2s; font-size: 15px;
  font-family: 'Inter',sans-serif;
}
.ap-icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.ap-notif-dot {
  position: absolute; top: -3px; right: -3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #FF4B4B; color: #fff; font-size: 9px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #070707;
}
.ap-socket-badge {
  display: flex; align-items: center; gap: 5px;
  background: rgba(0,210,106,0.1); border: 1px solid rgba(0,210,106,0.25);
  border-radius: 8px; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #00D26A;
}
.ap-socket-dot { width: 6px; height: 6px; border-radius: 50%; background: #00D26A; animation: adPulse 2s infinite; }
.ap-avatar-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg,#FFD21F,#e6a800);
  color: #000; font-weight: 900; font-size: 14px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
/* BODY */
.ap-body { flex: 1; display: flex; overflow: hidden; }
/* SIDEBAR */
.ap-sidebar {
  width: 220px; min-width: 220px;
  background: rgba(8,8,8,0.98); border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; padding: 14px 8px;
  overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
}
.ap-sidebar::-webkit-scrollbar { display: none; }
.ap-brand { display: flex; align-items: center; gap: 8px; padding: 4px 8px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 10px; }
.ap-brand-logo { width: 32px; height: 32px; object-fit: contain; }
.ap-brand-name { font-size: 16px; font-weight: 900; color: #FFD21F; }
.ap-brand-sub  { font-size: 9px; color: #555; font-weight: 600; }
.ap-nav-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border-radius: 9px;
  font-size: 12px; font-weight: 500; color: #777;
  cursor: pointer; transition: all 0.15s;
  border: none; background: transparent; width: 100%; text-align: left;
  font-family: 'Inter',sans-serif;
}
.ap-nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.ap-nav-item.active { background: rgba(255,210,31,0.12); color: #FFD21F; font-weight: 700; }
.ap-nav-icon { font-size: 14px; flex-shrink: 0; }
.ap-nav-badge {
  margin-left: auto; background: #FF4B4B; color: #fff;
  font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 5px;
}
.ap-sidebar-footer {
  margin-top: auto; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06);
}
.ap-admin-card {
  display: flex; align-items: center; gap: 8px;
  padding: 10px; border-radius: 10px; background: rgba(255,255,255,0.04);
  margin-bottom: 8px;
}
.ap-admin-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,#FFD21F,#e6a800);
  color: #000; font-weight: 900; font-size: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ap-admin-name { font-size: 12px; font-weight: 700; }
.ap-admin-role { font-size: 10px; color: #666; }
.ap-logout-btn {
  width: 100%; padding: 9px 0; border-radius: 9px;
  background: rgba(255,75,75,0.1); border: 1px solid rgba(255,75,75,0.2);
  color: #FF4B4B; font-weight: 700; font-size: 12px; cursor: pointer;
  font-family: 'Inter',sans-serif; transition: all 0.2s;
}
.ap-logout-btn:hover { background: rgba(255,75,75,0.2); }
/* MAIN */
.ap-main { flex: 1; display: flex; overflow: hidden; }
.ap-content {
  flex: 1; padding: 16px; overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: #1a1a1a transparent;
  display: flex; flex-direction: column; gap: 14px;
}
.ap-content::-webkit-scrollbar { width: 4px; }
.ap-content::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 2px; }
/* MAP PANEL */
.ap-map-panel {
  width: 370px; min-width: 370px;
  border-left: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column;
  background: #050505;
}
/* CARD */
.ap-card {
  background: #111; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; overflow: hidden;
}
.ap-card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.ap-card-title { font-size: 13px; font-weight: 800; }
.ap-view-all {
  font-size: 11px; font-weight: 700; color: #FFD21F;
  background: none; border: none; cursor: pointer; font-family: 'Inter',sans-serif;
}
/* KPI GRID */
.ap-kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.ap-kpi-card {
  background: #111; border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px; padding: 14px 16px;
  transition: all 0.2s; cursor: default; position: relative; overflow: hidden;
}
.ap-kpi-card:hover { border-color: rgba(255,210,31,0.2); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }
.ap-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
.ap-kpi-icon { font-size: 22px; }
.ap-kpi-label { font-size: 10px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.ap-kpi-value { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
.ap-kpi-growth {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 5px;
}
.ap-kpi-growth.up   { color: #00D26A; background: rgba(0,210,106,0.12); }
.ap-kpi-growth.down { color: #FF4B4B; background: rgba(255,75,75,0.12); }
.ap-sparkline { margin-top: 10px; }
/* GRID LAYOUTS */
.ap-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.ap-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.ap-row-custom { display: grid; grid-template-columns: 1.2fr 1fr; gap: 14px; }
/* ACTIVITY FEED */
.ap-feed { display: flex; flex-direction: column; }
.ap-feed-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.ap-feed-item:hover { background: rgba(255,255,255,0.02); }
.ap-feed-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.ap-feed-text { flex: 1; min-width: 0; }
.ap-feed-title { font-size: 12px; font-weight: 700; }
.ap-feed-sub   { font-size: 10px; color: #666; margin-top: 1px; }
.ap-feed-time  { font-size: 10px; color: #555; flex-shrink: 0; }
/* RIDES TABLE */
.ap-table { width: 100%; border-collapse: collapse; }
.ap-table th {
  padding: 9px 12px; font-size: 10px; font-weight: 700; color: #555;
  text-transform: uppercase; letter-spacing: 0.5px; text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap;
}
.ap-table td {
  padding: 10px 12px; font-size: 12px; color: #ccc;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-table tr:hover td { background: rgba(255,255,255,0.02); }
.ap-table tr:last-child td { border-bottom: none; }
.ap-status-badge {
  display: inline-block; padding: 2px 8px; border-radius: 5px;
  font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px;
}
.ap-action-btn {
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(255,255,255,0.06); border: none; color: #aaa;
  cursor: pointer; font-size: 13px; display: inline-flex;
  align-items: center; justify-content: center;
  transition: all 0.15s; margin-right: 4px;
}
.ap-action-btn:hover { background: rgba(255,210,31,0.15); color: #FFD21F; }
.ap-action-btn.danger:hover { background: rgba(255,75,75,0.15); color: #FF4B4B; }
/* QUICK ACTIONS */
.ap-qa-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; padding: 14px 16px; }
.ap-qa-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 8px; border-radius: 11px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer; transition: all 0.18s;
}
.ap-qa-item:hover { background: rgba(255,210,31,0.08); border-color: rgba(255,210,31,0.2); transform: translateY(-2px); }
.ap-qa-icon { font-size: 22px; }
.ap-qa-label { font-size: 10px; font-weight: 700; color: #aaa; text-align: center; line-height: 1.3; }
/* SYSTEM STATUS */
.ap-sys-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-sys-item:last-child { border-bottom: none; }
.ap-sys-name { font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
.ap-sys-dot   { width: 7px; height: 7px; border-radius: 50%; }
.ap-sys-status { font-size: 11px; font-weight: 700; }
/* SUPPORT TICKETS */
.ap-ticket-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-ticket-item:last-child { border-bottom: none; }
.ap-ticket-id { font-size: 11px; font-weight: 800; color: #FFD21F; width: 56px; flex-shrink: 0; }
.ap-ticket-info { flex: 1; min-width: 0; }
.ap-ticket-title { font-size: 12px; font-weight: 700; }
.ap-ticket-sub   { font-size: 10px; color: #666; margin-top: 1px; }
.ap-priority-badge {
  font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 5px; flex-shrink: 0;
}
/* REVENUE CHART */
.ap-revenue-chart { padding: 16px; position: relative; }
.ap-chart-bars {
  display: flex; align-items: flex-end; gap: 6px; height: 80px;
}
.ap-chart-bar { flex: 1; border-radius: 4px 4px 0 0; transition: all 0.3s; cursor: pointer; }
.ap-chart-bar:hover { filter: brightness(1.2); }
.ap-chart-labels { display: flex; gap: 6px; margin-top: 6px; }
.ap-chart-label { flex: 1; font-size: 9px; color: #555; text-align: center; }
.ap-chart-line {
  width: 100%; height: 60px; position: relative; overflow: visible;
}
/* TOP DRIVERS */
.ap-driver-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-driver-item:last-child { border-bottom: none; }
.ap-driver-rank { font-size: 16px; width: 24px; flex-shrink: 0; }
.ap-driver-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,#FFD21F,#e6a800);
  color: #000; font-weight: 900; font-size: 13px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ap-driver-info { flex: 1; min-width: 0; }
.ap-driver-name { font-size: 12px; font-weight: 700; }
.ap-driver-meta { font-size: 10px; color: #666; margin-top: 1px; }
.ap-driver-earn { font-size: 13px; font-weight: 800; color: #FFD21F; }
/* TOP CITIES */
.ap-city-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-city-item:last-child { border-bottom: none; }
.ap-city-rank { font-size: 11px; font-weight: 800; color: #555; width: 16px; flex-shrink: 0; }
.ap-city-name { flex: 1; font-size: 12px; font-weight: 700; }
.ap-city-bar-wrap { width: 80px; height: 5px; background: rgba(255,255,255,0.07); border-radius: 3px; }
.ap-city-bar { height: 100%; border-radius: 3px; background: linear-gradient(90deg,#FFD21F,#e6a800); }
.ap-city-rev { font-size: 11px; font-weight: 800; color: #FFD21F; width: 64px; text-align: right; }
/* SOS ALERTS */
.ap-sos-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ap-sos-item:last-child { border-bottom: none; }
.ap-sos-badge {
  font-size: 9px; font-weight: 800; padding: 3px 7px; border-radius: 5px;
  background: rgba(255,75,75,0.15); color: #FF4B4B; flex-shrink: 0;
}
.ap-sos-info { flex: 1; min-width: 0; }
.ap-sos-loc  { font-size: 12px; font-weight: 700; }
.ap-sos-sub  { font-size: 10px; color: #666; margin-top: 1px; }
.ap-sos-time { font-size: 10px; color: #555; flex-shrink: 0; }
/* RIDE STATUS DONUT */
.ap-donut-wrap { display: flex; align-items: center; gap: 16px; padding: 14px 16px; }
.ap-donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.ap-donut-leg-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
.ap-donut-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ap-donut-leg-val { font-weight: 800; font-size: 12px; margin-left: auto; }
/* MAP */
.ap-map-container { flex: 1; position: relative; }
#ap-live-map { width: 100%; height: 100%; }
.ap-map-overlay-top {
  position: absolute; top: 10px; left: 10px; right: 10px;
  display: flex; align-items: center; justify-content: space-between; z-index: 500;
}
.ap-map-chip {
  background: rgba(15,15,15,0.92); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
  padding: 5px 10px; font-size: 10px; font-weight: 600; color: #ccc;
  display: flex; align-items: center; gap: 5px;
}
.ap-map-legend {
  position: absolute; bottom: 10px; left: 10px; z-index: 500;
  background: rgba(15,15,15,0.92); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px;
}
.ap-map-leg-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #ccc; margin-bottom: 4px; }
.ap-map-leg-item:last-child { margin-bottom: 0; }
.ap-map-leg-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ap-map-ctrl {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%); z-index: 500;
  display: flex; flex-direction: column; gap: 4px;
}
.ap-map-ctrl-btn {
  width: 30px; height: 30px; border-radius: 7px;
  background: rgba(15,15,15,0.92); border: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #ccc; font-size: 11px; font-weight: 700;
  transition: all 0.2s; font-family: 'Inter',sans-serif;
}
.ap-map-ctrl-btn:hover { background: rgba(255,210,31,0.15); color: #FFD21F; border-color: rgba(255,210,31,0.3); }
.ap-ai-btn {
  position: absolute; bottom: 10px; right: 8px; z-index: 500;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg,#FFD21F,#e6a800);
  border: none; cursor: pointer; font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(255,210,31,0.4); animation: adAiPulse 3s ease-in-out infinite;
}
/* PAGINATION */
.ap-pagination { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
.ap-page-info { font-size: 11px; color: #555; }
.ap-page-btns { display: flex; gap: 4px; }
.ap-page-btn {
  width: 26px; height: 26px; border-radius: 6px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  color: #aaa; font-size: 11px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Inter',sans-serif; transition: all 0.15s;
}
.ap-page-btn:hover, .ap-page-btn.active { background: #FFD21F; color: #000; border-color: #FFD21F; }
/* TOAST */
.ap-toast {
  position: fixed; bottom: 20px; right: 20px; z-index: 9999;
  background: #111; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 12px 18px;
  font-size: 13px; font-weight: 600; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  animation: toastSlide 0.3s ease;
}
/* SECTION HEADER */
.ap-section-title { font-size: 13px; font-weight: 900; }
.ap-section-sub   { font-size: 10px; color: #555; margin-top: 1px; }
/* ANIMATIONS */
@keyframes adPulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,210,106,.4)} 50%{box-shadow:0 0 0 6px rgba(0,210,106,0)} }
@keyframes adAiPulse { 0%,100%{box-shadow:0 4px 18px rgba(255,210,31,.4)} 50%{box-shadow:0 4px 28px rgba(255,210,31,.7)} }
@keyframes toastSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

// ─── SPARKLINE SVG ────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data); const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100; const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`${color}18`} stroke="none"
      />
    </svg>
  );
}

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function BarChart({ data, color }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.value));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <div className="ap-revenue-chart">
      <div className="ap-chart-bars">
        {data.map((d, i) => (
          <div key={i} className="ap-chart-bar" style={{
            height: `${(d.value / max) * 100}%`,
            background: i === data.length - 2
              ? color
              : `${color}55`,
          }} title={`₹${d.value.toLocaleString()}`} />
        ))}
      </div>
      <div className="ap-chart-labels">
        {data.map((d, i) => <div key={i} className="ap-chart-label">{days[i]}</div>)}
      </div>
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ segments, total }) {
  const R = 40; const CX = 50; const CY = 50;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.pct / 100) * circumference;
    const gap  = circumference - dash;
    const arc  = { ...seg, dash, gap, offset };
    offset += dash;
    return arc;
  });
  return (
    <svg viewBox="0 0 100 100" style={{ width: 120, height: 120, flexShrink: 0 }}>
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1a1a1a" strokeWidth="14" />
      {arcs.map((arc, i) => (
        <circle key={i} cx={CX} cy={CY} r={R}
          fill="none" stroke={arc.color} strokeWidth="14"
          strokeDasharray={`${arc.dash} ${arc.gap}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
      ))}
      <text x={CX} y={CY - 4} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">{total}</text>
      <text x={CX} y={CY + 10} textAnchor="middle" fill="#555" fontSize="7">Total Trips</text>
    </svg>
  );
}

// ─── STATUS COLOR HELPER ──────────────────────────────────────────────────────
function statusStyle(s) {
  const m = {
    Completed:  { bg: 'rgba(0,210,106,0.12)',  color: '#00D26A' },
    InProgress: { bg: 'rgba(255,210,31,0.12)',  color: '#FFD21F' },
    Ongoing:    { bg: 'rgba(255,210,31,0.12)',  color: '#FFD21F' },
    Pending:    { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
    Searching:  { bg: 'rgba(139,92,246,0.12)',  color: '#8B5CF6' },
    Cancelled:  { bg: 'rgba(255,75,75,0.12)',   color: '#FF4B4B' },
    Accepted:   { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
  };
  return m[s] || { bg: 'rgba(255,255,255,0.08)', color: '#aaa' };
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_DRIVERS = [
  { name: 'Mohammed Arif', trips: 128, rating: 4.9, earning: 18420 },
  { name: 'Suresh Babu',   trips: 112, rating: 4.8, earning: 16230 },
  { name: 'Harish R.',     trips: 105, rating: 4.7, earning: 14890 },
  { name: 'Imran Khan',    trips: 98,  rating: 4.7, earning: 13400 },
];
const MOCK_CITIES = [
  { name: 'Bengaluru', rev: 452630, pct: 100 },
  { name: 'Mysuru',    rev: 125430, pct: 28 },
  { name: 'Mangaluru', rev: 98210,  pct: 22 },
  { name: 'Hubli',     rev: 75340,  pct: 17 },
  { name: 'Belagavi',  rev: 61230,  pct: 14 },
];
const MOCK_SOS = [
  { loc: 'HSR Layout, Bengaluru',      ago: '2 min ago',  passenger: 'Priya S.', driver: 'Arif K.' },
  { loc: 'Electronic City, Bengaluru', ago: '5 min ago',  passenger: 'Rahul M.', driver: 'Suresh B.' },
  { loc: 'Whitefield, Bengaluru',      ago: '10 min ago', passenger: 'Sneha R.', driver: 'Harish R.' },
  { loc: 'Koramangala, Bengaluru',     ago: '12 min ago', passenger: 'Karan P.', driver: 'Imran A.' },
];
const MOCK_TICKETS = [
  { id: '#TK2451', title: 'Payment failed',         priority: 'High',   ago: '2 min ago' },
  { id: '#TK2450', title: 'Driver behavior',         priority: 'Medium', ago: '10 min ago' },
  { id: '#TK2449', title: 'Wrong fare charged',      priority: 'High',   ago: '10 min ago' },
  { id: '#TK2448', title: 'Refund not received',     priority: 'Low',    ago: '15 min ago' },
  { id: '#TK2447', title: 'Vehicle issue',           priority: 'Medium', ago: '20 min ago' },
];
const SYS_ITEMS = [
  { name: 'Server',        ok: true },
  { name: 'Database',      ok: true },
  { name: 'API Services',  ok: true },
  { name: 'Socket Server', ok: true },
  { name: 'Redis Cache',   ok: true },
  { name: 'Storage',       ok: true },
];
const REVENUE_BARS = [
  { value: 58000 }, { value: 72000 }, { value: 61000 }, { value: 88000 },
  { value: 95000 }, { value: 126430 }, { value: 110000 },
];
const GHOST_DRIVERS = [
  { lat: 12.97, lng: 77.59, s: 0.0002 }, { lat: 12.93, lng: 77.63, s: 0.00015 },
  { lat: 12.99, lng: 77.56, s: 0.0003 }, { lat: 12.95, lng: 77.61, s: 0.00025 },
  { lat: 12.91, lng: 77.58, s: 0.0002 }, { lat: 12.96, lng: 77.65, s: 0.00018 },
];
const SURGE_ZONES = [
  { lat: 12.97, lng: 77.59, r: 900 }, { lat: 12.93, lng: 77.63, r: 650 },
  { lat: 12.91, lng: 77.57, r: 500 },
];
const ACTIVITY_TYPES = {
  ride_start: { emoji: '🚖', color: '#FFD21F', bg: 'rgba(255,210,31,0.12)' },
  ride_complete: { emoji: '✅', color: '#00D26A', bg: 'rgba(0,210,106,0.12)' },
  passenger_reg: { emoji: '👤', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  driver_online: { emoji: '🚕', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  payment: { emoji: '💳', color: '#00D26A', bg: 'rgba(0,210,106,0.12)' },
  sos: { emoji: '🆘', color: '#FF4B4B', bg: 'rgba(255,75,75,0.12)' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminPortal() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { dashboard, loading, error, socketConn: adminSocketConn, fetchDashboard } = useContext(AdminContext);

  const [activeSection, setActiveSection] = useState('dashboard');
  const [rides,         setRides]         = useState([]);
  const [passengers,    setPassengers]    = useState([]);
  const [driversList,   setDriversList]   = useState([]);
  const [ridePage,      setRidePage]      = useState(1);
  const [toast,         setToast]         = useState(null);
  const [socketConn,    setSocketConn]    = useState(false);
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const mapRef    = useRef(null);
  const mapInst   = useRef(null);
  const driversRef= useRef([]);
  const animRef   = useRef(null);

  const adminName    = user?.name || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  // Toast
  const showToast = useCallback((msg, color = '#FFD21F') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Fetch Rides ─────────────────────────────────────────────────────────────
  const fetchRides = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rides');
      if (res.ok) {
        const data = await res.json();
        setRides(data);
        let rev = 0, cancel = 0, total = data.length;
        data.forEach(r => {
          if (r.status === 'Completed') rev += r.fare || 0;
          if (r.status === 'Cancelled') cancel++;
        });
        // We rely on dashboard from context for stats, but keeping rides list updated here.
      }
    } catch (_) {}
  }, []);

  // ── Fetch Users & Drivers ────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (res.ok) { const d = await res.json(); setPassengers(d); }
    } catch (_) {}
    try {
      const res = await fetch('http://localhost:5000/api/users/drivers');
      if (res.ok) { const d = await res.json(); setDriversList(d); }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchRides();
    fetchUsers();
    const socket = io('http://localhost:5000');
    socket.on('connect', () => setSocketConn(true));
    socket.on('disconnect', () => setSocketConn(false));
    socket.on('newRide', ride => {
      setRides(prev => [ride, ...prev]);
      showToast(`🚖 New ride from ${ride.passengerName || 'Passenger'}!`);
      // Activity updates handled via admin_activity_update in AdminContext
    });
    socket.on('rideUpdated', () => fetchRides());
    return () => { socket.disconnect(); cancelAnimationFrame(animRef.current); };
  }, [fetchRides, fetchUsers, showToast]);

  // ── Map Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;
    const loadMap = () => {
      if (!window.L || !mapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([12.97, 77.59], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      mapInst.current = map;
      SURGE_ZONES.forEach(z => {
        L.circle([z.lat, z.lng], { radius: z.r, color: 'transparent', fillColor: 'rgba(255,75,75,0.3)', fillOpacity: 1 }).addTo(map);
        L.circle([z.lat, z.lng], { radius: z.r * 0.4, color: 'transparent', fillColor: 'rgba(255,120,0,0.45)', fillOpacity: 1 }).addTo(map);
      });
      // User blue dot
      L.marker([12.97, 77.59], { icon: L.divIcon({ html: '<div style="width:12px;height:12px;border-radius:50%;background:#4f8ef7;border:3px solid #fff;box-shadow:0 0 10px rgba(79,142,247,.8);"></div>', iconSize:[12,12], iconAnchor:[6,6], className:'' }) }).addTo(map);
      const drivers = GHOST_DRIVERS.map(d => {
        const icon = L.divIcon({ html: '<div style="font-size:16px;filter:drop-shadow(0 2px 6px #FFD21F);">🚕</div>', iconSize:[20,20], iconAnchor:[10,10], className:'' });
        const m = L.marker([d.lat, d.lng], { icon }).addTo(map);
        return { m, lat: d.lat, lng: d.lng, speed: d.s, angle: Math.random() * Math.PI * 2 };
      });
      driversRef.current = drivers;
      const animate = () => {
        driversRef.current.forEach(d => {
          d.lat += Math.sin(d.angle) * d.speed;
          d.lng += Math.cos(d.angle) * d.speed;
          d.angle += (Math.random() - 0.5) * 0.25;
          d.m.setLatLng([d.lat, d.lng]);
        });
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    };
    if (window.L) { loadMap(); return; }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link'); link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = loadMap;
    document.head.appendChild(script);
    return () => { cancelAnimationFrame(animRef.current); if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } };
  }, []);

  // ── Ride Actions ─────────────────────────────────────────────────────────────
  const handleCancelRide = async (rideId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/rides/${rideId}/cancel`, {
        method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      if (res.ok) { showToast('Ride cancelled.', '#FF4B4B'); fetchRides(); }
    } catch (_) {}
  };
  const handleDispatch = async (rideId) => {
    try {
      const res = await fetch('http://localhost:5000/api/rides/dispatch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId })
      });
      if (res.ok) { showToast('Driver dispatched!'); fetchRides(); }
    } catch (_) {}
  };

  // Donut segments
  const totalRides = rides.length || 1842;
  const completed  = rides.filter(r => r.status === 'Completed').length;
  const ongoing    = rides.filter(r => ['InProgress','Accepted'].includes(r.status)).length;
  const cancelled  = rides.filter(r => r.status === 'Cancelled').length;
  const noShow     = Math.max(0, totalRides - completed - ongoing - cancelled);
  const donutSegs  = [
    { label: 'Completed', pct: totalRides ? (completed/totalRides*100) : 78, color: '#00D26A', count: completed || 1436 },
    { label: 'Ongoing',   pct: totalRides ? (ongoing/totalRides*100)   : 15, color: '#FFD21F', count: ongoing || 276 },
    { label: 'Cancelled', pct: totalRides ? (cancelled/totalRides*100) : 5,  color: '#FF4B4B', count: cancelled || 92 },
    { label: 'No Show',   pct: 2, color: '#8B5CF6', count: noShow || 38 },
  ];

  // Paginated rides
  const PER_PAGE = 5;
  const pagedRides = rides.slice((ridePage - 1) * PER_PAGE, ridePage * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(rides.length / PER_PAGE));

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{FONT_IMPORT}{CSS}</style>
      <div className="ap-root">

        {/* ════════ HEADER ════════ */}
        <header className="ap-header">
          <div className="ap-search-wrap">
            <span style={{ color: '#555', fontSize: 14 }}>🔍</span>
            <input placeholder="Search rides, drivers, users..." />
            <span className="ap-kbd">Ctrl+K</span>
          </div>

          <div className="ap-hdr-stats">
            <div className="ap-hdr-stat">
              <span className="ap-hdr-stat-label">Today's Revenue</span>
              <span className="ap-hdr-stat-val" style={{ color: '#FFD21F' }}>₹{(dashboard?.stats?.revenue || 0).toLocaleString()}</span>
              {/* Note: Growth badge would be dynamic in future */}
              <span className="ap-hdr-stat-badge">▲ 18.6%</span>
            </div>
            <div className="ap-hdr-stat">
              <span className="ap-hdr-stat-label">Today's Trips</span>
              <span className="ap-hdr-stat-val">{(dashboard?.stats?.trips || 0).toLocaleString()}</span>
              <span className="ap-hdr-stat-badge">▲ 12.4%</span>
            </div>
            <div className="ap-hdr-stat">
              <span className="ap-hdr-stat-label">Active Drivers</span>
              <span className="ap-hdr-stat-val" style={{ color: '#00D26A' }}>{dashboard?.stats?.activeDrivers || 0}</span>
              <span style={{ fontSize: 10, color: '#00D26A', fontWeight: 700 }}>● Online</span>
            </div>
            <div className="ap-hdr-stat">
              <span className="ap-hdr-stat-label">Online Passengers</span>
              <span className="ap-hdr-stat-val">{(dashboard?.stats?.onlinePassengers || 0).toLocaleString()}</span>
            </div>
            <div className="ap-hdr-stat">
              <span className="ap-hdr-stat-label">System Health</span>
              <span className="ap-hdr-stat-val" style={{ fontSize: 11, color: '#00D26A' }}>
                {dashboard?.systemHealth?.every(h => h.ok) ? '● All Systems Operational' : '● Issues Detected'}
              </span>
            </div>
          </div>

          <div className="ap-hdr-right">
            <div className="ap-socket-badge">
              <div className="ap-socket-dot" style={{ background: adminSocketConn ? '#00D26A' : '#FF4B4B' }} />
              {adminSocketConn ? 'Live' : 'Offline'}
            </div>
            <button className="ap-icon-btn" title="Notifications">
              🔔
              <span className="ap-notif-dot">9</span>
            </button>
            <button className="ap-icon-btn" title="Language">🌐 EN</button>
            <button className="ap-icon-btn" title="Theme">🌙</button>
            <div style={{ position: 'relative' }}>
              <button className="ap-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>{adminInitial}</button>
              {avatarOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 999,
                  background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, overflow: 'hidden', minWidth: 160,
                  boxShadow: '0 16px 48px rgba(0,0,0,.6)'
                }}>
                  {['Profile', 'Settings', 'Activity Logs'].map(item => (
                    <button key={item} style={{
                      display: 'flex', width: '100%', padding: '10px 14px',
                      background: 'none', border: 'none', color: '#ccc',
                      cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      fontFamily: 'Inter,sans-serif', textAlign: 'left',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >{item}</button>
                  ))}
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.07)' }} />
                  <button onClick={logout} style={{
                    display: 'flex', width: '100%', padding: '10px 14px',
                    background: 'none', border: 'none', color: '#FF4B4B',
                    cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    fontFamily: 'Inter,sans-serif', textAlign: 'left',
                  }}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ════════ BODY ════════ */}
        <div className="ap-body">

          {/* ── SIDEBAR ── */}
          <aside className="ap-sidebar">
            <div className="ap-brand">
              {logoSrc
                ? <img src={logoSrc} alt="ucab" className="ap-brand-logo" />
                : <span style={{ fontSize: 24 }}>🚕</span>}
              <div>
                <div className="ap-brand-name">ucab</div>
                <div className="ap-brand-sub">Operations Center</div>
              </div>
            </div>

            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`ap-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="ap-nav-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="ap-nav-badge">{item.badge}</span>}
              </button>
            ))}

            <div className="ap-sidebar-footer">
              <div className="ap-admin-card">
                <div className="ap-admin-avatar">{adminInitial}</div>
                <div>
                  <div className="ap-admin-name">{adminName}</div>
                  <div className="ap-admin-role">Super Admin</div>
                </div>
              </div>
              <button className="ap-logout-btn" onClick={logout}>⬡ Logout</button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="ap-main">
            {/* Ride Management Page */}
            {activeSection === 'rides' && (
              <div className="ap-content">
                <RideManagement />
              </div>
            )}

            {/* Driver Management Page */}
            {activeSection === 'drivers' && (
              <div className="ap-content">
                <DriverManagement />
              </div>
            )}

            {/* Passenger User Management Page (Sprint 24) */}
            {activeSection === 'users' && (
              <div className="ap-content">
                <UserManagement />
              </div>
            )}

            {/* Compliance Dashboard Page (Sprint 25) */}
            {(activeSection === 'documents' || activeSection === 'vehicles' || activeSection === 'compliance') && (
              <div className="ap-content">
                <ComplianceDashboard />
              </div>
            )}

            {/* Financial Operations Page (Sprint 26) */}
            {(activeSection === 'finance' || activeSection === 'payments' || activeSection === 'earnings') && (
              <div className="ap-content">
                <FinanceDashboard />
              </div>
            )}

            {/* Promotions & Incentives Management Page (Sprint 27) */}
            {activeSection === 'promotions' && (
              <div className="ap-content">
                <PromotionsDashboard />
              </div>
            )}

            {/* Safety & Support Operations Center (Sprint 28) */}
            {activeSection === 'safety' && (
              <div className="ap-content">
                <SafetyDashboard />
              </div>
            )}

            {/* Analytics & Business Intelligence Center (Sprint 29) */}
            {activeSection === 'analytics' && (
              <div className="ap-content">
                <AnalyticsDashboard />
              </div>
            )}

            {/* Platform Settings & Configuration Center (Sprint 30) */}
            {activeSection === 'settings' && (
              <div className="ap-content">
                <SettingsDashboard />
              </div>
            )}

            {/* Notification & Communication Center (Sprint 31) */}
            {activeSection === 'notifications' && (
              <div className="ap-content">
                <NotificationsDashboard />
              </div>
            )}



            {/* Audit Center & Activity Timeline (Sprint 33) */}
            {activeSection === 'audit' && (
              <div className="ap-content">
                <AuditDashboard />
              </div>
            )}

            {/* Live Operations & Command Center (Sprint 34) */}
            {activeSection === 'operations' && (
              <div className="ap-content">
                <OperationsDashboard />
              </div>
            )}

            {/* Dashboard (default) */}
            {activeSection === 'dashboard' && (
            <div className="ap-content">

              {/* ── KPI CARDS ── */}
              <div className="ap-kpi-grid">
                {[
                  { icon: '💰', label: "Today's Revenue", value: `₹${(dashboard?.stats?.revenue || 0).toLocaleString()}`, growth: '+18.6%', dir: 'up', data: [40,55,45,68,72,58,80,90,85,96,88,100], color: '#FFD21F' },
                  { icon: '🚖', label: 'Trips Today',       value: (dashboard?.stats?.trips || 0).toLocaleString(),          growth: '+12.4%', dir: 'up', data: [30,40,35,55,60,48,62,58,70,75,68,80], color: '#00D26A' },
                  { icon: '❌', label: 'Cancelled Trips',   value: (dashboard?.stats?.cancelled || 0).toString(),             growth: '-8.2%',  dir: 'down', data: [18,15,20,14,16,12,10,14,11,9,10,8], color: '#FF4B4B' },
                  { icon: '✅', label: 'Completion Rate',   value: `${dashboard?.stats?.completion || 100}%`,                 growth: '+2.6%',  dir: 'up', data: [88,89,90,91,90,92,93,94,93,95,96,96.4], color: '#3B82F6' },
                ].map(kpi => (
                  <div key={kpi.label} className="ap-kpi-card">
                    <div className="ap-kpi-top">
                      <div>
                        <div className="ap-kpi-label">{kpi.label}</div>
                        <div className="ap-kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
                        <span className={`ap-kpi-growth ${kpi.dir}`}>{kpi.dir === 'up' ? '▲' : '▼'} {kpi.growth} vs yesterday</span>
                      </div>
                      <span className="ap-kpi-icon">{kpi.icon}</span>
                    </div>
                    <div className="ap-sparkline">
                      <Sparkline data={kpi.data} color={kpi.color} height={40} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ── ROW 2: Activity + Rides Table ── */}
              <div className="ap-row-custom">

                {/* Activity Feed */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div>
                      <div className="ap-section-title">Real-time Activity</div>
                      <div className="ap-section-sub">Live platform events</div>
                    </div>
                    <button className="ap-view-all">View All</button>
                  </div>
                  <div className="ap-feed">
                    {(dashboard?.activity || []).map((item, i) => {
                      const t = ACTIVITY_TYPES[item.type] || ACTIVITY_TYPES.ride_start;
                      return (
                        <div key={i} className="ap-feed-item">
                          <div className="ap-feed-icon" style={{ background: t.bg }}>{t.emoji}</div>
                          <div className="ap-feed-text">
                            <div className="ap-feed-title" style={{ color: t.color }}>{item.text}</div>
                            <div className="ap-feed-sub">{item.sub}</div>
                          </div>
                          <div className="ap-feed-time">{item.ago}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Bookings Table */}
                <div className="ap-card" style={{ overflow: 'hidden' }}>
                  <div className="ap-card-header">
                    <div>
                      <div className="ap-section-title">Recent Bookings</div>
                      <div className="ap-section-sub">Showing {pagedRides.length} of {rides.length} rides</div>
                    </div>
                    <button className="ap-view-all" onClick={() => setActiveSection('rides')}>View All</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Booking ID</th><th>Passenger</th><th>Driver</th>
                          <th>Fare</th><th>Status</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedRides.map((ride, i) => {
                          const sc = statusStyle(ride.status);
                          const rideNum = `TR${24558 + i}`;
                          return (
                            <tr key={ride._id}>
                              <td style={{ color: '#FFD21F', fontWeight: 700 }}>{rideNum}</td>
                              <td style={{ fontWeight: 600, color: '#fff' }}>{ride.passengerName || 'Passenger'}</td>
                              <td style={{ color: '#888' }}>{ride.driver?.name || '—'}</td>
                              <td style={{ fontWeight: 800, color: '#FFD21F' }}>₹{ride.fare || 0}</td>
                              <td>
                                <span className="ap-status-badge" style={{ background: sc.bg, color: sc.color }}>
                                  {ride.status}
                                </span>
                              </td>
                              <td>
                                <button className="ap-action-btn" title="View" onClick={() => navigate(`/live/${ride._id}`)}>👁</button>
                                <button className="ap-action-btn" title="Track">📍</button>
                                {['Pending','Searching'].includes(ride.status) && (
                                  <button className="ap-action-btn danger" title="Cancel" onClick={() => handleCancelRide(ride._id)}>✖</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {rides.length === 0 && (
                          <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 20 }}>No rides yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="ap-pagination">
                    <span className="ap-page-info">Showing {(ridePage-1)*PER_PAGE+1}–{Math.min(ridePage*PER_PAGE,rides.length)} of {rides.length}</span>
                    <div className="ap-page-btns">
                      {[1,2,3,'...',totalPages].filter((v,i,a)=> a.indexOf(v)===i && (typeof v==='number'&&v<=totalPages||v==='...')).slice(0,5).map((p, i) => (
                        <button key={i} className={`ap-page-btn ${ridePage===p?'active':''}`}
                          onClick={() => typeof p === 'number' && setRidePage(p)}>{p}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── ROW 3: Quick Actions + System Status + Support + Revenue ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.8fr 1fr 1fr', gap: 14 }}>

                {/* Quick Actions */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Quick Actions</div>
                  </div>
                  <div className="ap-qa-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                    {[
                      { icon: '🎟️', label: 'Create Promo' },
                      { icon: '🚕', label: 'Add Driver' },
                      { icon: '🛡️', label: 'Approve Vehicle' },
                      { icon: '📢', label: 'Broadcast' },
                      { icon: '🎫', label: 'Create Coupon' },
                      { icon: '📦', label: 'Export Reports' },
                    ].map(a => (
                      <div key={a.label} className="ap-qa-item">
                        <span className="ap-qa-icon">{a.icon}</span>
                        <span className="ap-qa-label">{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 14px 14px' }}>
                    <button style={{ padding: '8px 0', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      📋 Manage Cities
                    </button>
                    <button style={{ padding: '8px 0', borderRadius: 8, background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.2)', color: '#FF4B4B', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      🆘 Emergency Mode
                    </button>
                  </div>
                </div>

                {/* System Status */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">System Status</div>
                    <button className="ap-view-all">View Details</button>
                  </div>
                  {(dashboard?.systemHealth || []).map(s => (
                    <div key={s.name} className="ap-sys-item">
                      <div className="ap-sys-name">
                        <div className="ap-sys-dot" style={{ background: s.ok ? '#00D26A' : '#FF4B4B' }} />
                        {s.name}
                      </div>
                      <span className="ap-sys-status" style={{ color: s.ok ? '#00D26A' : '#FF4B4B' }}>
                        {s.ok ? 'Operational' : 'Down'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Support Tickets */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Support Tickets</div>
                    <button className="ap-view-all">View All</button>
                  </div>
                  {(dashboard?.tickets || []).map(t => {
                    const pc = t.priority === 'High' ? '#FF4B4B' : t.priority === 'Medium' ? '#FFD21F' : '#3B82F6';
                    return (
                      <div key={t.id} className="ap-ticket-item">
                        <span className="ap-ticket-id">{t.id}</span>
                        <div className="ap-ticket-info">
                          <div className="ap-ticket-title">{t.title}</div>
                          <div className="ap-ticket-sub">{t.ago}</div>
                        </div>
                        <span className="ap-priority-badge" style={{ background: `${pc}18`, color: pc }}>{t.priority}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Revenue Chart */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Revenue Overview</div>
                    <span style={{ fontSize: 10, color: '#555', fontWeight: 600 }}>This Week</span>
                  </div>
                  <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: '#FFD21F' }}>₹{(dashboard?.stats?.revenue || 0).toLocaleString()}</span>
                    <span style={{ fontSize: 10, color: '#00D26A', fontWeight: 700 }}>▲ 18.6%</span>
                  </div>
                  <BarChart data={dashboard?.charts?.bars || []} color="#FFD21F" />
                </div>
              </div>

              {/* ── ROW 4: Top Drivers + Top Cities + Ride Status + SOS ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>

                {/* Top Performing Drivers */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Top Performing Drivers</div>
                    <button className="ap-view-all">View All</button>
                  </div>
                  {(dashboard?.drivers || []).map((d, i) => (
                    <div key={i} className="ap-driver-item">
                      <div className="ap-driver-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</div>
                      <div className="ap-driver-avatar">{(d.name || 'D').charAt(0).toUpperCase()}</div>
                      <div className="ap-driver-info">
                        <div className="ap-driver-name">{d.name || 'Driver'}</div>
                        <div className="ap-driver-meta">⭐ {d.rating || 4.5} · {d.trips || 100} trips</div>
                      </div>
                      <div className="ap-driver-earn">₹{(d.earning || d.totalEarnings || 0).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Top Cities */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Top Cities by Revenue</div>
                    <button className="ap-view-all">View All</button>
                  </div>
                  {(dashboard?.cities || []).map((c, i) => (
                    <div key={i} className="ap-city-item">
                      <div className="ap-city-rank">{i + 1}</div>
                      <div className="ap-city-name">{c.name}</div>
                      <div className="ap-city-bar-wrap">
                        <div className="ap-city-bar" style={{ width: `${c.pct}%` }} />
                      </div>
                      <div className="ap-city-rev">₹{(c.rev / 1000).toFixed(0)}k</div>
                    </div>
                  ))}
                </div>

                {/* Ride Status Distribution */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Ride Status Distribution</div>
                  </div>
                  <div className="ap-donut-wrap">
                    <DonutChart segments={donutSegs} total={(rides.length || 1842).toLocaleString()} />
                    <div className="ap-donut-legend">
                      {donutSegs.map(s => (
                        <div key={s.label} className="ap-donut-leg-item">
                          <div className="ap-donut-dot" style={{ background: s.color }} />
                          <span style={{ color: '#888', flex: 1 }}>{s.label}</span>
                          <span style={{ color: '#555', fontSize: 10 }}>{s.pct.toFixed(0)}%</span>
                          <span className="ap-donut-leg-val" style={{ color: s.color }}>{s.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent SOS Alerts */}
                <div className="ap-card">
                  <div className="ap-card-header">
                    <div className="ap-section-title">Recent SOS Alerts</div>
                    <button className="ap-view-all">View All</button>
                  </div>
                  {(dashboard?.sos || []).map((s, i) => (
                    <div key={i} className="ap-sos-item">
                      <span className="ap-sos-badge">SOS</span>
                      <div className="ap-sos-info">
                        <div className="ap-sos-loc">{s.loc}</div>
                        <div className="ap-sos-sub">{s.passenger} · {s.driver}</div>
                      </div>
                      <div className="ap-sos-time">{s.ago}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            )}

            {/* ── MAP PANEL — dashboard only ── */}
            {activeSection === 'dashboard' && (
            <div className="ap-map-panel">
              {/* Map status bar */}
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#00D26A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00D26A', display: 'inline-block' }} />
                  {ongoing} Rides in Progress
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FF4B4B', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                  🆘 {(dashboard?.sos || []).length} SOS Alerts
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <div className="ap-map-chip">☀️ 28°C · Clear</div>
                  <div className="ap-map-chip" style={{ color: '#00D26A' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00D26A' }} />
                    Light Traffic
                  </div>
                </div>
              </div>

              <div className="ap-map-container">
                <div id="ap-live-map" ref={mapRef} />

                {/* Map controls */}
                <div className="ap-map-ctrl">
                  <button className="ap-map-ctrl-btn" title="Heatmap" style={{ fontSize: 13 }}>🗺</button>
                  <button className="ap-map-ctrl-btn" title="Surge">🔥</button>
                  <button className="ap-map-ctrl-btn" title="Drivers">🚕</button>
                  <button className="ap-map-ctrl-btn" onClick={() => mapInst.current?.zoomIn()}>+</button>
                  <button className="ap-map-ctrl-btn" onClick={() => mapInst.current?.zoomOut()}>−</button>
                  <button className="ap-map-ctrl-btn" onClick={() => { navigator.geolocation?.getCurrentPosition(({ coords }) => mapInst.current?.setView([coords.latitude, coords.longitude], 14)); }}>📍</button>
                </div>

                {/* Legend */}
                <div className="ap-map-legend">
                  {[
                    { dot: '#00D26A', label: 'Available Drivers' },
                    { dot: '#FF4B4B', label: 'High Demand' },
                    { dot: '#4f8ef7', label: 'You are here' },
                    { dot: '#FF4B4B', label: 'SOS Alerts' },
                  ].map(l => (
                    <div key={l.label} className="ap-map-leg-item">
                      <div className="ap-map-leg-dot" style={{ background: l.dot }} />
                      {l.label}
                    </div>
                  ))}
                </div>

                {/* AI Bubble */}
                <button className="ap-ai-btn">🤖</button>
              </div>
            </div>
            )}

          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="ap-toast" style={{ borderLeft: `3px solid ${toast.color}` }}>
          <span style={{ marginRight: 6 }}>●</span>{toast.msg}
        </div>
      )}
    </>
  );
}
