import React, {
  useState, useEffect, useContext, useRef, useCallback
} from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Car, MapPin, Calendar, Wallet, Tag, Headphones,
  Shield, HelpCircle, Settings, ChevronDown, Bell, Globe,
  LogOut, User, CreditCard, Gift, ArrowRightLeft, Plus,
  Mic, Navigation, Star, Clock, RotateCcw, FileText,
  Train, Plane, Bus, Hospital, Hotel, ShoppingBag,
  GraduationCap, Building2, Layers, AlertTriangle,
  MessageCircle, ChevronUp, Zap, CheckCircle, Lock,
  Phone, Radio, X, Maximize2, RefreshCw, Flame,
  TrendingUp, Wind
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import LocationPicker from './LocationPicker';
import BookRide from './BookRide';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapContext } from '../context/MapContext';

// ─── LOGO ─────────────────────────────────────────────────────────────────────
let logoSrc = null;
try { logoSrc = new URL('../assets/logo-01.png', import.meta.url).href; } catch (_) {}

// ─── SIDEBAR ITEMS ────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { icon: Home,        label: 'Home',          tab: 'home' },
  { icon: Car,         label: 'My Rides',       tab: 'rides' },
  { icon: MapPin,      label: 'Intercity',      tab: 'intercity' },
  { icon: Calendar,    label: 'Rentals',        tab: 'rentals' },
  { icon: Clock,       label: 'Schedule',       tab: 'schedule' },
  { icon: Wallet,      label: 'Wallet',         tab: 'wallet' },
  { icon: Tag,         label: 'Offers',         tab: 'offers', badge: 'NEW' },
  { icon: Headphones,  label: 'Help & Support', tab: 'support' },
  { icon: Shield,      label: 'Safety',         tab: 'safety' },
  { icon: Settings,    label: 'Settings',       tab: 'settings' },
];

// ─── PROMO SLIDES ─────────────────────────────────────────────────────────────
const PROMO_SLIDES = [
  {
    id: 1, bg: 'linear-gradient(135deg,#1a0a00,#3d1f00)',
    accent: '#FFD400', emoji: '🛡️',
    title: 'Safety First, Always',
    desc: 'Your safety is our priority. Verified drivers, SOS & live tracking.',
    cta: 'Learn More →'
  },
  {
    id: 2, bg: 'linear-gradient(135deg,#0a0a1a,#1a1a3d)',
    accent: '#6366f1', emoji: '🎁',
    title: 'Refer & Earn ₹150',
    desc: 'Invite friends to Ucab and earn ₹150 for every successful referral.',
    cta: 'Refer Now →'
  },
  {
    id: 3, bg: 'linear-gradient(135deg,#001a0a,#003d1f)',
    accent: '#22C55E', emoji: '✈️',
    title: 'Airport Rides — Flat 20% Off',
    desc: 'Pre-book your airport transfer. Free flight tracking included.',
    cta: 'Book Airport Ride →'
  },
  {
    id: 4, bg: 'linear-gradient(135deg,#1a001a,#3d003d)',
    accent: '#a855f7', emoji: '⭐',
    title: 'Ucab Premium',
    desc: 'Luxury sedans. Premium drivers. Complimentary water & charging.',
    cta: 'Upgrade Now →'
  },
  {
    id: 5, bg: 'linear-gradient(135deg,#0d0d0d,#1a1a1a)',
    accent: '#FFD400', emoji: '🌙',
    title: 'Night Safety Shield',
    desc: 'Safe rides all night. Share live location with trusted contacts.',
    cta: 'Know More →'
  },
];

// ─── DESTINATIONS ─────────────────────────────────────────────────────────────
const DESTINATIONS = [
  { icon: Train,        label: 'Railway Station', sub: 'City Railway Station' },
  { icon: Plane,        label: 'Airport',          sub: 'International Airport' },
  { icon: Bus,          label: 'Bus Stand',        sub: 'Central Bus Stand' },
  { icon: Hospital,     label: 'Hospitals',        sub: 'General Hospital' },
  { icon: Hotel,        label: 'Hotels',           sub: 'Browse nearby hotels' },
  { icon: ShoppingBag,  label: 'Shopping Mall',    sub: 'Explore malls' },
  { icon: GraduationCap,label: 'University',       sub: 'Campus routes' },
];

// ─── GHOST DRIVER DATA ────────────────────────────────────────────────────────
const GHOST_DRIVERS = [
  { id: 1, startLat: 16.00, startLng: 80.08, speed: 0.0002, color: '#22C55E' },
  { id: 2, startLat: 15.98, startLng: 80.10, speed: 0.00015, color: '#22C55E' },
  { id: 3, startLat: 16.02, startLng: 80.06, speed: 0.00025, color: '#EF4444' },
  { id: 4, startLat: 15.97, startLng: 80.12, speed: 0.0003,  color: '#22C55E' },
  { id: 5, startLat: 16.03, startLng: 80.09, speed: 0.0002,  color: '#22C55E' },
];

// ─── SURGE ZONES ─────────────────────────────────────────────────────────────
const SURGE_ZONES = [
  { lat: 15.99, lng: 80.09, radius: 800, intensity: 0.8 },
  { lat: 16.01, lng: 80.07, radius: 600, intensity: 0.6 },
  { lat: 16.03, lng: 80.11, radius: 500, intensity: 0.7 },
];

const TAB_ROUTES = {
  home:      '/',
  rides:     '/my-rides',
  intercity: '/intercity',
  rentals:   '/rentals',
  schedule:  '/schedule',
  wallet:    '/wallet',
  referrals: '/referrals',
  offers:    '/offers',
  support:   '/support',
  safety:    '/safety',
  help:      '/help',
  settings:  '/settings',
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pd-root {
    font-family: 'Inter', sans-serif;
    background: #080808;
    color: #fff;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── HEADER ── */
  .pd-header {
    height: 68px;
    min-height: 68px;
    background: rgba(12,12,12,0.92);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 12px;
    z-index: 200;
    flex-shrink: 0;
  }

  .pd-logo-wrap { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
  .pd-logo-img { width: 36px; height: 36px; object-fit: contain; }
  .pd-logo-text { font-size: 18px; font-weight: 900; color: #FFD400; letter-spacing: -0.5px; }
  .pd-logo-tag { font-size: 9px; color: #666; font-weight: 500; margin-top: -2px; }

  .pd-city-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 6px 12px;
    color: #fff; cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all 0.2s; white-space: nowrap;
  }
  .pd-city-btn:hover { background: rgba(255,212,0,0.08); border-color: rgba(255,212,0,0.3); }

  .pd-header-center {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  }

  .pd-chip {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 6px 12px;
    font-size: 12px; font-weight: 600; color: #fff;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .pd-chip:hover { background: rgba(255,255,255,0.09); }
  .pd-chip-gold { color: #FFD400; }

  .pd-notif-btn {
    position: relative; display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; color: #fff; transition: all 0.2s;
  }
  .pd-notif-btn:hover { background: rgba(255,255,255,0.1); }
  .pd-notif-badge {
    position: absolute; top: -4px; right: -4px;
    background: #EF4444; color: #fff;
    font-size: 9px; font-weight: 800;
    width: 16px; height: 16px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #080808;
  }

  .pd-book-btn {
    background: #FFD400; color: #000; font-weight: 800;
    font-size: 13px; padding: 9px 18px; border-radius: 10px;
    border: none; cursor: pointer; transition: all 0.2s; white-space: nowrap;
    font-family: 'Inter', sans-serif;
  }
  .pd-book-btn:hover { background: #e6c200; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,212,0,0.3); }

  .pd-avatar-wrap { position: relative; }
  .pd-avatar-btn {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #FFD400, #e6a800);
    color: #000; font-weight: 900; font-size: 15px;
    border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.2s;
  }
  .pd-avatar-btn:hover { transform: scale(1.05); box-shadow: 0 0 0 3px rgba(255,212,0,0.3); }

  .pd-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: #141414; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; overflow: hidden;
    min-width: 180px; z-index: 999;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6);
    animation: fadeSlideDown 0.2s ease;
  }
  .pd-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; font-size: 13px; font-weight: 500;
    color: #ccc; cursor: pointer; transition: all 0.15s;
    border: none; background: transparent; width: 100%; text-align: left;
    font-family: 'Inter', sans-serif;
  }
  .pd-dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .pd-dropdown-item.danger { color: #EF4444; }
  .pd-dropdown-item.danger:hover { background: rgba(239,68,68,0.1); }
  .pd-dropdown-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }

  /* ── BODY LAYOUT ── */
  .pd-body {
    flex: 1; display: flex; overflow: hidden;
  }

  /* ── SIDEBAR ── */
  .pd-sidebar {
    width: 210px; min-width: 210px;
    background: rgba(10,10,10,0.98);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex; flex-direction: column;
    overflow-y: auto; overflow-x: hidden;
    padding: 14px 10px;
    gap: 2px;
    scrollbar-width: none;
  }
  .pd-sidebar::-webkit-scrollbar { display: none; }

  .pd-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: #888;
    cursor: pointer; transition: all 0.18s;
    position: relative; border: none; background: transparent;
    font-family: 'Inter', sans-serif; width: 100%; text-align: left;
  }
  .pd-nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .pd-nav-item.active { background: rgba(255,212,0,0.12); color: #FFD400; font-weight: 700; }
  .pd-nav-item.active svg { color: #FFD400; }
  .pd-nav-badge {
    margin-left: auto; background: #22C55E; color: #000;
    font-size: 8px; font-weight: 800; padding: 2px 5px; border-radius: 5px;
  }

  .pd-refer-card {
    margin-top: auto; padding-top: 12px;
    background: linear-gradient(135deg, rgba(255,212,0,0.1), rgba(255,212,0,0.04));
    border: 1px solid rgba(255,212,0,0.2);
    border-radius: 14px; padding: 14px 12px;
    text-align: center;
  }
  .pd-refer-title { font-size: 12px; font-weight: 700; color: #FFD400; }
  .pd-refer-sub { font-size: 10px; color: #888; margin: 3px 0 8px; }
  .pd-coins { font-size: 28px; animation: coinBounce 2s ease-in-out infinite; }
  .pd-refer-btn {
    display: block; width: 100%; margin-top: 8px;
    background: #FFD400; color: #000; font-weight: 800;
    font-size: 11px; padding: 7px 0; border-radius: 8px;
    border: none; cursor: pointer; font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }
  .pd-refer-btn:hover { background: #e6c200; }

  .pd-sidebar-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .pd-user-card {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 10px 8px;
    border-radius: 12px;
    background: rgba(255,255,255,0.04);
    margin-bottom: 8px;
  }
  .pd-user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #FFD400, #e6a800);
    color: #000; font-weight: 900; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pd-user-name  { font-size: 12px; font-weight: 800; color: #fff; }
  .pd-user-email { font-size: 10px; color: #555; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
  .pd-logout-btn {
    width: 100%;
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 0; border-radius: 10px;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.18);
    color: #EF4444; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .pd-logout-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.35); transform: translateY(-1px); }

  /* ── MAIN AREA ── */
  .pd-main {
    flex: 1; display: flex;
    overflow: hidden;
  }

  .pd-content-col {
    flex: 0 1 850px;
    display: flex; flex-direction: column; gap: 14px;
    padding: 16px 12px 16px 16px;
    overflow-y: auto; overflow-x: hidden;
    scrollbar-width: thin; scrollbar-color: #222 transparent;
  }
  .pd-content-col::-webkit-scrollbar { width: 4px; }
  .pd-content-col::-webkit-scrollbar-track { background: transparent; }
  .pd-content-col::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }

  /* Two-column inner grid */
  .pd-inner-grid {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 14px;
    align-items: start;
  }

  .pd-left-col { display: flex; flex-direction: column; gap: 14px; }
  .pd-mid-col  { display: flex; flex-direction: column; gap: 14px; }

  /* ── CARD BASE ── */
  .pd-card {
    background: #121212;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    overflow: visible;
  }

  /* ── CAROUSEL ── */
  .pd-carousel {
    border-radius: 16px; overflow: hidden;
    position: relative; height: 140px; flex-shrink: 0;
  }
  .pd-carousel-slide {
    position: absolute; inset: 0;
    display: flex; align-items: center;
    padding: 20px;
    gap: 14px;
    opacity: 0; transition: opacity 0.6s ease;
  }
  .pd-carousel-slide.active { opacity: 1; }
  .pd-carousel-emoji { font-size: 48px; flex-shrink: 0; }
  .pd-carousel-text h3 { font-size: 15px; font-weight: 800; margin-bottom: 4px; }
  .pd-carousel-text p  { font-size: 11px; color: rgba(255,255,255,0.75); line-height: 1.5; }
  .pd-carousel-cta {
    display: inline-block; margin-top: 8px;
    font-size: 11px; font-weight: 700; cursor: pointer;
  }
  .pd-carousel-dots {
    position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 5px;
  }
  .pd-carousel-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.3); transition: all 0.3s;
    cursor: pointer;
  }
  .pd-carousel-dot.active { width: 14px; border-radius: 3px; background: #FFD400; }

  /* ── BOOKING CARD ── */
  .pd-booking-card { padding: 18px; }
  .pd-booking-title { font-size: 17px; font-weight: 900; margin-bottom: 14px; }
  .pd-booking-title span { color: #FFD400; }

  .pd-voice-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,212,0,0.1); border: 1px solid rgba(255,212,0,0.25);
    border-radius: 8px; padding: 6px 10px; font-size: 11px; font-weight: 700;
    color: #FFD400; cursor: pointer; margin-bottom: 14px; transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .pd-voice-btn:hover { background: rgba(255,212,0,0.18); }

  .pd-input-row { display: flex; flex-direction: column; gap: 8px; position: relative; }
  .pd-input-label { font-size: 9px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; }

  .pd-swap-btn {
    position: absolute; right: -12px; top: 50%; transform: translateY(-50%);
    width: 26px; height: 26px; border-radius: 50%;
    background: #1e1e1e; border: 1px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; z-index: 10; transition: all 0.2s;
  }
  .pd-swap-btn:hover { color: #FFD400; border-color: #FFD400; }

  .pd-saved-places { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .pd-saved-label { font-size: 10px; color: #666; font-weight: 600; }
  .pd-place-chip {
    display: flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 4px 9px; font-size: 11px; font-weight: 600; color: #aaa;
    cursor: pointer; transition: all 0.2s;
  }
  .pd-place-chip:hover { background: rgba(255,212,0,0.08); border-color: rgba(255,212,0,0.25); color: #FFD400; }
  .pd-place-chip span { font-size: 12px; }

  .pd-fare-row {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px; border-radius: 9px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
    margin-top: 10px;
  }
  .pd-fare-dot { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; flex-shrink: 0; }
  .pd-fare-text { font-size: 11px; font-weight: 700; color: #22C55E; }
  .pd-fare-sub  { font-size: 10px; color: #555; margin-left: auto; }

  .pd-cta-btn {
    width: 100%; margin-top: 12px;
    background: #FFD400; color: #000; font-weight: 900;
    font-size: 14px; padding: 13px 0; border-radius: 12px;
    border: none; cursor: pointer; font-family: 'Inter', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
  }
  .pd-cta-btn:hover { background: #e6c200; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,212,0,0.35); }

  /* ── QUICK ACTIONS ── */
  .pd-quick-actions { padding: 14px 16px; }
  .pd-section-title { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px; }
  .pd-qa-grid { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
  .pd-qa-grid::-webkit-scrollbar { display: none; }
  .pd-qa-item {
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    flex-shrink: 0; cursor: pointer; padding: 8px 10px; border-radius: 11px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.2s; min-width: 70px;
  }
  .pd-qa-item:hover { background: rgba(255,212,0,0.08); border-color: rgba(255,212,0,0.2); transform: translateY(-2px); }
  .pd-qa-icon { font-size: 22px; }
  .pd-qa-label { font-size: 10px; font-weight: 600; color: #999; text-align: center; line-height: 1.3; }

  /* ── DESTINATIONS ── */
  .pd-dest-card { padding: 14px 16px; }
  .pd-dest-title { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
  .pd-dest-sub   { font-size: 10px; color: #666; margin-bottom: 10px; }
  .pd-dest-list  { display: flex; flex-direction: column; gap: 2px; }
  .pd-dest-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 9px; cursor: pointer;
    transition: all 0.18s;
  }
  .pd-dest-item:hover { background: rgba(255,255,255,0.04); }
  .pd-dest-icon-wrap {
    width: 34px; height: 34px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,212,0,0.1); flex-shrink: 0;
  }
  .pd-dest-text { flex: 1; min-width: 0; }
  .pd-dest-name  { font-size: 12px; font-weight: 700; color: #fff; }
  .pd-dest-place { font-size: 10px; color: #666; margin-top: 1px; }
  .pd-view-more {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 700; color: #FFD400;
    margin-top: 8px; cursor: pointer; padding: 4px 0; background: none; border: none;
    font-family: 'Inter', sans-serif;
  }

  /* ── SAFETY CARD ── */
  .pd-safety-card { padding: 14px 16px; }
  .pd-safety-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pd-safety-item:last-child { border-bottom: none; }
  .pd-safety-icon {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .pd-safety-text { flex: 1; }
  .pd-safety-name { font-size: 12px; font-weight: 700; }
  .pd-safety-desc { font-size: 10px; color: #666; margin-top: 1px; }
  .pd-know-more {
    display: flex; align-items: center; gap: 4px;
    margin-top: 10px; font-size: 11px; font-weight: 700; color: #FFD400;
    cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif;
    padding: 0;
  }

  /* ── FEATURE STRIP ── */
  .pd-feature-strip {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; padding: 0 0 8px;
  }
  .pd-feature-card {
    background: #121212; border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 12px;
    display: flex; align-items: center; gap: 10px;
    transition: all 0.2s; cursor: default;
  }
  .pd-feature-card:hover { border-color: rgba(255,212,0,0.2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .pd-feature-icon-wrap {
    width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .pd-feature-text h4 { font-size: 11px; font-weight: 800; }
  .pd-feature-text p  { font-size: 9px; color: #666; margin-top: 1px; }

  /* ── MAP COLUMN ── */
  .pd-map-col {
    flex: 1; min-width: 310px;
    background: #0a0a0a;
    border-left: 1px solid rgba(255,255,255,0.06);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .pd-map-container { flex: 1; position: relative; }
  #ucab-dashboard-map { width: 100%; height: 100%; }

  /* Map Overlays */
  .pd-map-status {
    position: absolute; top: 10px; left: 10px; z-index: 500;
    background: rgba(18,18,18,0.92); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 8px 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .pd-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFD400; animation: pulse 2s infinite; }
  .pd-status-text { font-size: 11px; font-weight: 700; }
  .pd-status-sub  { font-size: 9px; color: #888; margin-top: 1px; }

  .pd-map-weather {
    position: absolute; top: 10px; right: 50px; z-index: 500;
    display: flex; gap: 6px;
  }
  .pd-weather-chip {
    background: rgba(18,18,18,0.92); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
    padding: 5px 10px; font-size: 10px; font-weight: 600; color: #ccc;
    display: flex; align-items: center; gap: 4px;
  }

  .pd-map-controls {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 5px; z-index: 500;
  }
  .pd-map-ctrl-btn {
    width: 32px; height: 32px; border-radius: 8px;
    background: rgba(18,18,18,0.92); border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #fff; font-size: 10px; font-weight: 700;
    transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .pd-map-ctrl-btn:hover { background: rgba(255,212,0,0.15); border-color: rgba(255,212,0,0.4); color: #FFD400; }

  .pd-map-legend {
    position: absolute; bottom: 10px; left: 10px; z-index: 500;
    background: rgba(18,18,18,0.92); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 8px 12px;
  }
  .pd-legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #ccc; margin-bottom: 4px; }
  .pd-legend-item:last-child { margin-bottom: 0; }
  .pd-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .pd-ai-bubble {
    position: absolute; bottom: 10px; right: 8px; z-index: 500;
    width: 48px; height: 48px; border-radius: 50%;
    background: linear-gradient(135deg, #FFD400, #e6a800);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; box-shadow: 0 4px 20px rgba(255,212,0,0.4);
    transition: all 0.2s; animation: aiPulse 3s ease-in-out infinite;
  }
  .pd-ai-bubble:hover { transform: scale(1.08); }
  .pd-ai-bubble span { font-size: 22px; }

  .pd-ai-panel {
    position: absolute; bottom: 66px; right: 8px; z-index: 600;
    width: 220px;
    background: rgba(18,18,18,0.97); backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
    padding: 14px; animation: fadeSlideDown 0.25s ease;
    box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  }
  .pd-ai-header { font-size: 12px; font-weight: 800; margin-bottom: 3px; }
  .pd-ai-sub    { font-size: 10px; color: #666; margin-bottom: 10px; }
  .pd-ai-replies { display: flex; flex-wrap: wrap; gap: 5px; }
  .pd-ai-reply {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 5px 9px; font-size: 10px; font-weight: 600;
    color: #ccc; cursor: pointer; transition: all 0.15s;
    font-family: 'Inter', sans-serif;
  }
  .pd-ai-reply:hover { background: rgba(255,212,0,0.1); border-color: rgba(255,212,0,0.3); color: #FFD400; }

  /* Surge badge */
  .pd-surge-badge {
    position: absolute; right: 50px; bottom: 50%; z-index: 500;
    background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px; padding: 8px 12px; text-align: center;
  }
  .pd-surge-val { font-size: 20px; font-weight: 900; color: #EF4444; }
  .pd-surge-lbl { font-size: 9px; color: #EF4444; font-weight: 700; }

  /* ── BOOKING MODAL ── */
  .pd-modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .pd-modal {
    background: #0e0e0e; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: #222 transparent;
    box-shadow: 0 24px 80px rgba(0,0,0,0.8);
    animation: scaleIn 0.25s ease;
  }
  .pd-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 0;
  }
  .pd-modal-title { font-size: 16px; font-weight: 900; }
  .pd-modal-close {
    width: 30px; height: 30px; border-radius: 8px;
    background: rgba(255,255,255,0.06); border: none;
    color: #888; cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.2s; font-family: 'Inter', sans-serif;
  }
  .pd-modal-close:hover { background: rgba(239,68,68,0.15); color: #EF4444; }

  /* ── FLOATING SOS ── */
  .pd-sos {
    position: fixed; bottom: 24px; right: 80px; z-index: 999;
    width: 48px; height: 48px; border-radius: 50%;
    background: #EF4444; border: none; color: #fff;
    font-weight: 900; font-size: 11px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(239,68,68,0.5);
    display: flex; align-items: center; justify-content: center;
    animation: sosGlow 2s ease-in-out infinite;
    font-family: 'Inter', sans-serif;
  }

  /* ── RECENT RIDES ── */
  .pd-rides-list { display: flex; flex-direction: column; gap: 6px; }
  .pd-ride-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer; transition: all 0.18s;
  }
  .pd-ride-item:hover { background: rgba(255,255,255,0.06); }
  .pd-ride-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,212,0,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; }
  .pd-ride-info { flex: 1; min-width: 0; }
  .pd-ride-route { font-size: 11px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pd-ride-meta  { font-size: 10px; color: #666; margin-top: 1px; }
  .pd-ride-fare  { font-size: 12px; font-weight: 800; color: #FFD400; }
  .pd-status-badge {
    font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 5px; text-transform: uppercase;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,212,0,0.5); }
    50% { box-shadow: 0 0 0 6px rgba(255,212,0,0); }
  }
  @keyframes aiPulse {
    0%, 100% { box-shadow: 0 4px 20px rgba(255,212,0,0.4); }
    50% { box-shadow: 0 4px 32px rgba(255,212,0,0.7); }
  }
  @keyframes sosGlow {
    0%, 100% { box-shadow: 0 4px 20px rgba(239,68,68,0.5); }
    50% { box-shadow: 0 4px 32px rgba(239,68,68,0.8); }
  }
  @keyframes coinBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PassengerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const { t } = useLanguage();
  const { isLoaded } = useMapContext();
  
  const isDashboardHome = location.pathname === '/';

  // State
  const [activeTab,    setActiveTab]    = useState('home');

  useEffect(() => {
    const activeEntry = Object.entries(TAB_ROUTES).find(([_, route]) => location.pathname === route || (route !== '/' && location.pathname.startsWith(route)));
    if (activeEntry) {
      setActiveTab(activeEntry[0]);
    } else {
      setActiveTab('home');
    }
  }, [location.pathname]);
  const [avatarOpen,   setAvatarOpen]   = useState(false);
  const [carouselIdx,  setCarouselIdx]  = useState(0);
  const [pickup,       setPickup]       = useState('');
  const [dropoff,      setDropoff]      = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords,setDropoffCoords]= useState(null);
  const [city,         setCity]         = useState('Your Location');
  const [showBooking,  setShowBooking]  = useState(false);
  const [showSOS,      setShowSOS]      = useState(false);
  const [aiOpen,       setAiOpen]       = useState(false);
  const [showTraffic,  setShowTraffic]  = useState(false);
  const [showHeatmap,  setShowHeatmap]  = useState(false);
  const [rides,        setRides]        = useState([]);
  const [weather,      setWeather]      = useState({ temp: '28°C', condition: 'Clear' });
  const [traffic,      setTraffic]      = useState('Light Traffic');
  const [notifCount,   setNotifCount]   = useState(3);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [walletBal,    setWalletBal]    = useState('1,250.00');

  const mapRef      = useRef(null);
  const mapInst     = useRef(null);
  const driversRef  = useRef([]);
  const animFrameRef= useRef(null);
  const avatarRef   = useRef(null);
  
  const [prefillData, setPrefillData] = useState(null);

  // ── Prefill Booking from Router State (e.g. from Repeat Ride) ─────────────
  useEffect(() => {
    if (location.state?.prefillBooking) {
      setPrefillData(location.state.prefillBooking);
      setShowBooking(true);
      // Clear state so it doesn't reopen on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const userName = user?.name || 'Passenger';
  const userInitial = userName.charAt(0).toUpperCase();

  // ── GPS City Detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const detectCity = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
              try {
                const res = await fetch(
                  `http://localhost:5000/api/maps/reverse-geocode`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: coords.latitude, lon: coords.longitude })
                  }
                );
                const data = await res.json();
                if (data.address) {
                  // Extract city/town from address
                  const parts = data.address.split(',');
                  const shortCity = parts.find(p => p.trim().length > 2 && p.trim().length < 25)?.trim();
                  if (shortCity) setCity(shortCity);
                }
              } catch (_) { fallbackIPCity(); }
            },
            () => fallbackIPCity()
          );
        } else { fallbackIPCity(); }
      } catch (_) { fallbackIPCity(); }
    };

    const fallbackIPCity = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.city) setCity(data.city);
      } catch (_) {}
    };

    detectCity();
  }, []);

  // ── Auto-advance carousel ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setCarouselIdx(i => (i + 1) % PROMO_SLIDES.length);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  // ── Fetch recent rides ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    const fetchRides = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rides/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const all = await res.json();
          const mine = all.slice(0, 3);
          setRides(mine);
        }
      } catch (_) {}
    };
    fetchRides();
  }, [token, userName]);

  // ── Socket: listen for ride events ──────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    socket.on('rideUpdated', () => {
      setNotifCount(n => n + 1);
    });
    socket.on('rideAccepted', (payload) => {
      alert(`Your ride has been accepted! Driver is on the way.`);
      setNotifCount(n => n + 1);
    });
    socket.on('noDriversAvailable', (payload) => {
      alert(`Sorry, no drivers are currently available for your ride request.`);
      setNotifCount(n => n + 1);
    });
    return () => {
      socket.off('rideUpdated');
      socket.off('rideAccepted');
      socket.off('noDriversAvailable');
    };
  }, [socket]);

  // ── Map Initialization ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDashboardHome) return;
    if (mapInst.current || !mapRef.current) return;
    const loadMap = () => {
      if (!window.L || !mapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([12.97, 77.59], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      mapInst.current = map;
      
      // User blue dot
      L.marker([12.97, 77.59], { icon: L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#4f8ef7;border:3px solid #fff;box-shadow:0 0 12px rgba(79,142,247,.8);"></div>', iconSize:[14,14], iconAnchor:[7,7], className:'' }) }).addTo(map);
      
      // Nearby drivers
      const drivers = [
        { lat: 12.975, lng: 77.595, s: 0.0003 },
        { lat: 12.965, lng: 77.585, s: 0.0002 },
        { lat: 12.980, lng: 77.590, s: 0.0004 },
      ].map(d => {
        const icon = L.divIcon({ html: '<div style="font-size:16px;filter:drop-shadow(0 2px 6px rgba(34,197,94,0.6));">🚕</div>', iconSize:[20,20], iconAnchor:[10,10], className:'' });
        const m = L.marker([d.lat, d.lng], { icon }).addTo(map);
        return { m, lat: d.lat, lng: d.lng, speed: d.s, angle: Math.random() * Math.PI * 2 };
      });
      driversRef.current = drivers;
      
      const animate = () => {
        driversRef.current.forEach(d => {
          d.lat += Math.sin(d.angle) * d.speed;
          d.lng += Math.cos(d.angle) * d.speed;
          d.angle += (Math.random() - 0.5) * 0.1;
          d.m.setLatLng([d.lat, d.lng]);
        });
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
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

    return () => { cancelAnimationFrame(animFrameRef.current); };
  }, [isDashboardHome]);

  // ── Close avatar dropdown on outside click ───────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const swapLocations = () => {
    setPickup(dropoff); setDropoff(pickup);
    setPickupCoords(dropoffCoords); setDropoffCoords(pickupCoords);
  };

  const handleSavedPlace = (place) => {
    setPickup(place);
  };

  const handleBookRide = () => {
    setShowBooking(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const route = TAB_ROUTES[tab];
    if (route) navigate(route);
  };

  const handleDestinationClick = (dest) => {
    setDropoff(dest.label + ', ' + dest.sub);
    setShowBooking(true);
  };

  const zoomIn  = () => {
    if (mapInst.current) mapInst.current.setZoom(mapInst.current.getZoom() + 1);
  };
  const zoomOut = () => {
    if (mapInst.current) mapInst.current.setZoom(mapInst.current.getZoom() - 1);
  };
  const locateMe= () => {
    if (!mapInst.current) return;
    navigator.geolocation?.getCurrentPosition(({ coords }) => {
      mapInst.current.panTo({ lat: coords.latitude, lng: coords.longitude });
      mapInst.current.setZoom(15);
    });
  };

  // ── STATUS BADGE ─────────────────────────────────────────────────────────────
  const statusColor = (s) => {
    if (s === 'Completed')  return { bg: 'rgba(34,197,94,0.15)',  color: '#22C55E' };
    if (s === 'Cancelled')  return { bg: 'rgba(239,68,68,0.15)',  color: '#EF4444' };
    if (s === 'InProgress') return { bg: 'rgba(255,212,0,0.15)',  color: '#FFD400' };
    return                         { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' };
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      <div className="pd-root">

        {/* ══════════════════ HEADER ══════════════════ */}
        <header className="pd-header">
          {/* LEFT: Logo + Location */}
          <div className="pd-logo-wrap">
            {logoSrc
              ? <img src={logoSrc} alt="Ucab" className="pd-logo-img" />
              : <span style={{ fontSize: 26 }}>🚕</span>
            }
            <div>
              <div className="pd-logo-text">ucab</div>
              <div className="pd-logo-tag">Your Journey, Simplified.</div>
            </div>
          </div>

          <button className="pd-city-btn">
            <MapPin size={13} color="#FFD400" />
            {city}
            <ChevronDown size={13} color="#888" />
          </button>

          {/* CENTER */}
          <div className="pd-header-center">
            <button className="pd-chip" onClick={() => handleTabChange('wallet')}>
              <Wallet size={13} color="#FFD400" />
              <span className="pd-chip-gold">{t('wallet_balance')}</span>
              <span style={{ fontWeight: 900 }}>₹{walletBal}</span>
              <ChevronDown size={11} color="#888" />
            </button>

            <button className="pd-chip" onClick={() => handleTabChange('referrals')}>
              <Gift size={13} color="#22C55E" />
              <span style={{ color: '#22C55E' }}>{t('refer_earn')}</span>
              <span style={{ color: '#aaa', fontSize: 11 }}>{t('earn_150')}</span>
              <ChevronDown size={11} color="#888" />
            </button>

            <button className="pd-notif-btn" onClick={() => { setNotifOpen(!notifOpen); setNotifCount(0); }}>
              <Bell size={16} />
              {notifCount > 0 && <span className="pd-notif-badge">{notifCount}</span>}
            </button>
            {notifOpen && (
              <div style={{
                position: 'absolute', top: '70px', right: '120px',
                width: '320px', background: 'rgba(18,18,18,0.98)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 1000, overflow: 'hidden'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 800 }}>Notifications</div>
                <div style={{ padding: '30px 16px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
                  No new notifications at this time.
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button className="pd-book-btn" onClick={handleBookRide}>
              {t('book_ride')}
            </button>

            <div className="pd-avatar-wrap">
              <button className="pd-avatar-btn" onClick={() => handleTabChange('settings')}>
                {userInitial}
              </button>
            </div>
          </div>
        </header>

        {/* ══════════════════ BODY ══════════════════ */}
        <div className="pd-body">

          {/* ── SIDEBAR ── */}
          <aside className="pd-sidebar">
            {SIDEBAR_ITEMS.map(item => {
              // Map tab to translation key
              const dictKey = item.tab === 'rides' ? 'my_rides' : item.tab;
              return (
              <button
                key={item.tab}
                className={`pd-nav-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => handleTabChange(item.tab)}
              >
                <item.icon size={16} />
                {t(dictKey)}
                {item.badge && <span className="pd-nav-badge">{item.badge}</span>}
              </button>
              );
            })}

            <div className="pd-sidebar-footer">
              <div className="pd-refer-card" style={{ marginBottom: '12px', cursor: 'pointer' }} onClick={() => handleTabChange('referrals')}>
                <div className="pd-refer-title">{t('invite_friends')}</div>
                <div className="pd-refer-sub">{t('earn_150')}</div>
                <div className="pd-coins">🪙</div>
                <button className="pd-refer-btn" onClick={(e) => { e.stopPropagation(); handleTabChange('referrals'); }}>{t('invite_friends')}</button>
              </div>

              <div className="pd-user-card">
                <div className="pd-user-avatar">{userInitial}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="pd-user-name">{userName}</div>
                  <div className="pd-user-email">{user?.email || 'passenger@ucab.com'}</div>
                </div>
              </div>
              <button className="pd-logout-btn" onClick={logout}>
                <LogOut size={14} />
                {t('sign_out')}
              </button>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <div className="pd-main">
            {isDashboardHome ? (
              <>
                {/* ── SCROLLABLE CONTENT ── */}
                <div className="pd-content-col">
                  <div className="pd-inner-grid">

                    {/* LEFT COLUMN */}
                    <div className="pd-left-col">

                      {/* Promo Carousel */}
                      <div className="pd-carousel">
                        {PROMO_SLIDES.map((slide, idx) => (
                          <div
                            key={slide.id}
                            className={`pd-carousel-slide ${idx === carouselIdx ? 'active' : ''}`}
                            style={{ background: slide.bg, cursor: 'pointer' }}
                            onClick={() => {
                              if (slide.title.includes('Refer')) handleTabChange('referrals');
                              else if (slide.title.includes('Airport')) handleTabChange('intercity');
                              else if (slide.title.includes('Premium')) handleTabChange('rentals');
                              else if (slide.title.includes('Safety')) handleTabChange('safety');
                            }}
                          >
                            <div className="pd-carousel-emoji">{slide.emoji}</div>
                            <div className="pd-carousel-text">
                              <h3 style={{ color: slide.accent }}>{slide.title}</h3>
                              <p>{slide.desc}</p>
                              <span className="pd-carousel-cta" style={{ color: slide.accent }}>
                                {slide.cta}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="pd-carousel-dots">
                          {PROMO_SLIDES.map((_, i) => (
                            <div
                              key={i}
                              className={`pd-carousel-dot ${i === carouselIdx ? 'active' : ''}`}
                              onClick={() => setCarouselIdx(i)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Booking Card */}
                      <div className="pd-card pd-booking-card">
                        <div className="pd-booking-title">
                          Your Journey, <span>Simplified.</span>
                        </div>

                        <button className="pd-voice-btn" onClick={() => alert('Voice booking initiated. Please speak your destination...')}>
                          <Mic size={13} /> VOICE BOOKING — Tap to speak
                        </button>

                        <div className="pd-input-row" style={{ position: 'relative' }}>
                          <div>
                            <div className="pd-input-label">📍 Pickup Location</div>
                            <LocationPicker
                              id="pd-pickup"
                              placeholder="Where are you starting from?"
                              value={pickup}
                              onChange={setPickup}
                              onCoords={setPickupCoords}
                              showPinDrop={true}
                            />
                          </div>

                          <button className="pd-swap-btn" onClick={swapLocations} title="Swap locations">
                            <ArrowRightLeft size={12} />
                          </button>

                          <div>
                            <div className="pd-input-label">🔴 Drop-off Location</div>
                            <LocationPicker
                              id="pd-dropoff"
                              placeholder="Where would you like to go?"
                              value={dropoff}
                              onChange={setDropoff}
                              onCoords={setDropoffCoords}
                              showPinDrop={true}
                            />
                          </div>
                        </div>

                        <div className="pd-saved-places">
                          <span className="pd-saved-label">Saved Places</span>
                          {[
                            { icon: '🏠', label: 'Home' },
                            { icon: '💼', label: 'Office' },
                            { icon: '✈️', label: 'Airport' },
                            { icon: '+', label: 'Add New' },
                          ].map(p => (
                            <button
                              key={p.label}
                              className="pd-place-chip"
                              onClick={() => p.label !== 'Add New' && handleSavedPlace(p.label)}
                            >
                              <span>{p.icon}</span> {p.label}
                            </button>
                          ))}
                        </div>

                        <div className="pd-fare-row">
                          <div className="pd-fare-dot" />
                          <div>
                            <div className="pd-fare-text">Pricing: Normal</div>
                            <div className="pd-fare-sub">Fares are stable right now</div>
                          </div>
                          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#555', fontWeight: 600 }}>Why prices may change?</div>
                            <div className="pd-fare-sub">High demand in your area</div>
                          </div>
                        </div>

                        <button className="pd-cta-btn" onClick={handleBookRide}>
                          Estimate Fare &amp; Book Ride
                          <span style={{ fontSize: 16 }}>→</span>
                        </button>
                      </div>

                      {/* Quick Actions */}
                      <div className="pd-card pd-quick-actions">
                        <div className="pd-section-title">Quick Actions</div>
                        <div className="pd-qa-grid">
                          {[
                            { icon: '🛣️', label: 'Book Intercity', onClick: () => handleTabChange('intercity') },
                            { icon: '🔑', label: 'Rentals', onClick: () => handleTabChange('rentals') },
                            { icon: '📦', label: 'Package', onClick: () => handleBookRide({ bookingType: 'Package' }) },
                            { icon: '👥', label: 'Ride for Others', onClick: () => handleBookRide({ isGuestBooking: true }) },
                            { icon: '···', label: 'More', onClick: () => handleTabChange('home') },
                          ].map(a => (
                            <div key={a.label} className="pd-qa-item" onClick={a.onClick}>
                              <div className="pd-qa-icon">{a.icon}</div>
                              <div className="pd-qa-label">{a.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Rides */}
                      {rides.length > 0 && (
                        <div className="pd-card" style={{ padding: '14px 16px' }}>
                          <div className="pd-section-title">Recent Rides</div>
                          <div className="pd-rides-list">
                            {rides.map(ride => {
                              const sc = statusColor(ride.status);
                              return (
                                <div
                                  key={ride._id}
                                  className="pd-ride-item"
                                  onClick={() => ride.status !== 'Completed' && navigate(`/live/${ride._id}`)}
                                >
                                  <div className="pd-ride-icon">🚕</div>
                                  <div className="pd-ride-info">
                                    <div className="pd-ride-route">
                                      {ride.pickupLocation?.slice(0, 18) || '—'} → {ride.dropoffLocation?.slice(0, 18) || '—'}
                                    </div>
                                    <div className="pd-ride-meta">{ride.cabType || 'Standard'} · {new Date(ride.createdAt).toLocaleDateString()}</div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <div className="pd-ride-fare">₹{ride.fare || '—'}</div>
                                    <div className="pd-status-badge" style={{ background: sc.bg, color: sc.color }}>{ride.status}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MIDDLE COLUMN */}
                    <div className="pd-mid-col">

                      {/* Destination Explorer */}
                      <div className="pd-card pd-dest-card">
                        <div className="pd-dest-title">Go Anywhere</div>
                        <div className="pd-dest-sub">Explore popular destinations</div>
                        <div className="pd-dest-list">
                          {DESTINATIONS.map(dest => (
                            <div
                              key={dest.label}
                              className="pd-dest-item"
                              onClick={() => handleDestinationClick(dest)}
                            >
                              <div className="pd-dest-icon-wrap">
                                <dest.icon size={16} color="#FFD400" />
                              </div>
                              <div className="pd-dest-text">
                                <div className="pd-dest-name">{dest.label}</div>
                                <div className="pd-dest-place">{dest.sub}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="pd-view-more">View More →</button>
                      </div>

                      {/* Safety & Security */}
                      <div className="pd-card pd-safety-card">
                        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>Safety &amp; Security</div>
                        <div style={{ fontSize: 10, color: '#666', marginBottom: 8 }}>Your safety is our priority</div>
                        {[
                          { icon: MapPin,        color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  name: 'Share Live Location',   desc: 'Share your trip with family' },
                          { icon: AlertTriangle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  name: 'Emergency SOS',         desc: '24/7 emergency assistance' },
                          { icon: Shield,        color: '#6366f1', bg: 'rgba(99,102,241,0.1)', name: 'Trip Safety',           desc: 'Our safety features' },
                        ].map(item => (
                          <div key={item.name} className="pd-safety-item">
                            <div className="pd-safety-icon" style={{ background: item.bg }}>
                              <item.icon size={15} color={item.color} />
                            </div>
                            <div className="pd-safety-text">
                              <div className="pd-safety-name">{item.name}</div>
                              <div className="pd-safety-desc">{item.desc}</div>
                            </div>
                          </div>
                        ))}
                        <button className="pd-know-more" onClick={() => navigate('/settings/security')}>
                          Know More →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── BOTTOM FEATURE STRIP ── */}
                  <div className="pd-feature-strip">
                    {[
                      { icon: Navigation,   bg: 'rgba(34,197,94,0.12)',  color: '#22C55E',  title: 'Live Tracking',     sub: 'Real-time trip tracking' },
                      { icon: CheckCircle,  bg: 'rgba(99,102,241,0.12)', color: '#818cf8',  title: 'Verified Drivers',  sub: '100% Background Verified' },
                      { icon: Lock,         bg: 'rgba(255,212,0,0.12)',  color: '#FFD400',  title: 'Secure Payments',   sub: 'Multiple safe options' },
                      { icon: Headphones,   bg: 'rgba(239,68,68,0.12)',  color: '#f87171',  title: '24/7 Support',      sub: "We're here for you" },
                    ].map(f => (
                      <div key={f.title} className="pd-feature-card">
                        <div className="pd-feature-icon-wrap" style={{ background: f.bg }}>
                          <f.icon size={18} color={f.color} />
                        </div>
                        <div className="pd-feature-text">
                          <h4>{f.title}</h4>
                          <p>{f.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── MAP COLUMN ── */}
                <div className="pd-map-col">
                  <div className="pd-map-container">
                    <div id="ucab-dashboard-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />

                    {/* Driver status overlay */}
                    <div className="pd-map-status">
                      <div>
                        <div className="pd-status-dot" style={{ background: '#FFD400' }} />
                      </div>
                      <div>
                        <div className="pd-status-text">Driver is on the way</div>
                        <div className="pd-status-sub">Arriving in 3 min · KA05AB1234</div>
                      </div>
                    </div>

                    {/* Weather + Traffic */}
                    <div className="pd-map-weather">
                      <div className="pd-weather-chip">☀️ {weather.temp} · {weather.condition}</div>
                      <div className="pd-weather-chip" style={{ color: '#22C55E' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                        {traffic}
                      </div>
                    </div>

                    {/* Surge badge */}
                    <div className="pd-surge-badge" style={{ top: '38%', right: 44 }}>
                      <div className="pd-surge-val">2.2x</div>
                      <div className="pd-surge-lbl">High Demand</div>
                    </div>

                    {/* Map controls */}
                    <div className="pd-map-controls">
                      <button className="pd-map-ctrl-btn" onClick={zoomIn} title="Zoom In">+</button>
                      <button className="pd-map-ctrl-btn" onClick={zoomOut} title="Zoom Out">-</button>
                      <button className="pd-map-ctrl-btn" onClick={locateMe} title="Locate Me">
                        <Navigation size={13} />
                      </button>
                      <button className="pd-map-ctrl-btn" onClick={() => setShowHeatmap(!showHeatmap)} title="Toggle Heatmap" style={{ color: showHeatmap ? '#FFD400' : '#fff' }}>
                        <Layers size={12} />
                      </button>
                      <button className="pd-map-ctrl-btn" onClick={() => setShowTraffic(!showTraffic)} title="Toggle Traffic" style={{ color: showTraffic ? '#FFD400' : '#fff' }}>
                        <Home size={12} />
                      </button>
                    </div>

                    {/* Legend */}
                    <div className="pd-map-legend">
                      <div className="pd-legend-item"><div className="pd-legend-dot" style={{ background: '#22C55E' }} /> Available Drivers</div>
                      <div className="pd-legend-item"><div className="pd-legend-dot" style={{ background: '#EF4444' }} /> High Demand</div>
                      <div className="pd-legend-item"><div className="pd-legend-dot" style={{ background: '#4f8ef7' }} /> You are here</div>
                    </div>

                    {/* AI Chatbot */}
                    {aiOpen && (
                      <div className="pd-ai-panel">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <div className="pd-ai-header">Hi! I'm Ucab AI 👋</div>
                            <div className="pd-ai-sub">How can I help you today?</div>
                          </div>
                          <button
                            onClick={() => setAiOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="pd-ai-replies">
                          {['Book a ride', 'Track my driver', 'SOS Help', 'Cancel ride', 'Payment issue'].map(r => (
                            <button key={r} className="pd-ai-reply">{r}</button>
                          ))}
                        </div>
                      </div>
                    )}

                <div className="pd-ai-bubble" onClick={() => setAiOpen(o => !o)}>
                  <span>🤖</span>
                </div>
              </div>
            </div>

            {/* ══════════════════ FLOATING SOS ══════════════════ */}
            {/* 🔴 FLOATING SOS 🔴 */}
            <button className="pd-sos" onClick={() => setShowSOS(true)}>
              SOS
            </button>
          </>
        ) : (
          <div className="pd-page-content" style={{ flex: 1, overflowY: 'auto', background: '#080808' }}>
            <Outlet />
          </div>
        )}
          </div>
        </div>
      </div>

      {/* ══════════════════ BOOKING MODAL ══════════════════ */}
      {/* MODALS */}
      {showSOS && (
        <div className="pd-modal-overlay" onClick={() => setShowSOS(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, border: '1px solid rgba(239,68,68,0.5)', boxShadow: '0 24px 80px rgba(239,68,68,0.2)' }}>
            <div className="pd-modal-header">
              <div className="pd-modal-title" style={{ color: '#EF4444' }}>🚨 Emergency SOS Triggered</div>
              <button className="pd-modal-close" onClick={() => setShowSOS(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '20px', color: '#ccc', fontSize: '13px', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 15 }}>
                Your current location, trip details, and live tracking link have been instantly shared with your designated emergency contacts and local authorities.
              </p>
              <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'sosGlow 1.5s infinite' }} />
                Support team is dialing your number...
              </div>
            </div>
          </div>
        </div>
      )}

      {showBooking && (
        <div className="pd-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="pd-modal" onClick={e => e.stopPropagation()}>
            <div className="pd-modal-header">
              <div className="pd-modal-title">🚖 Book Your Ride</div>
              <button className="pd-modal-close" onClick={() => setShowBooking(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px 20px 20px' }}>
              <BookRide
                prefillData={prefillData}
                onSuccess={(ride) => {
                  setShowBooking(false);
                  setPrefillData(null);
                  if (ride?._id) navigate(`/live/${ride._id}`);
                }}
              />
            </div>
          </div>
        </div>
      )}

    </>
  );
}
