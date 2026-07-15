import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Menu, Wallet, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import logo from '../assets/logo-01.png'; 
import Notifications from './Notifications';
import notificationService from '../services/notificationService';

const NAV_LINKS = [
  { labelKey: 'home', path: '/' },
  { labelKey: 'my_rides', path: '/my-rides' },
  { labelKey: 'services', path: '/services' },
  { labelKey: 'support', path: '/support' },
  { labelKey: 'contact', path: '/contact' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const { token, user, logout, authenticated } = useAuth();
  const userName = user?.name || '';
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (authenticated && user) {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.count))
        .catch(err => console.error(err));

      const socket = io('http://localhost:5000');
      const userId = user.userId || user.id;
      socket.emit('register', userId);
      
      const roomName = `notification_${userId}`;
      socket.on(roomName, (payload) => {
        if (payload.event === 'notification:new') {
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        socket.off(roomName);
        socket.disconnect();
      };
    }
  }, [authenticated, user]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="premium-glass sticky top-0 z-[999] flex items-center justify-between h-20 w-full px-4 lg:px-6 rounded-none border-b border-white/5 select-none">
      
      {/* LEFT: Logo */}
      <Link to="/" className="flex items-center shrink-0">
        <img 
          src={logo} 
          alt="Ucab Logo" 
          className="h-10 md:h-12 w-auto object-contain" 
        />
      </Link>

      {/* CENTER: Navigation Links */}
      <div className="hidden lg:flex items-center gap-8">
        {NAV_LINKS.map(({ labelKey, path }) => (
          <Link
            key={path}
            to={path}
            className={`text-sm font-semibold transition-all ${
              isActive(path) ? 'text-[#FFD700]' : 'text-gray-400 hover:text-[#FFD700]'
            }`}
          >
            {t(labelKey)}
          </Link>
        ))}
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <select 
          className="hidden lg:block bg-transparent text-xs text-gray-400 cursor-pointer outline-none hover:text-[#FFD700]" 
          value={i18n.language} 
          onChange={(e) => {
            i18n.changeLanguage(e.target.value);
            localStorage.setItem('ucab_lang', e.target.value);
          }}
        >
          <option value="en" className="bg-[#121212] text-white">EN</option>
          <option value="hi" className="bg-[#121212] text-white">HI</option>
          <option value="te" className="bg-[#121212] text-white">TE</option>
        </select>

        {/* Ucab Wallet Pill */}
        <div className="flex items-center gap-1.5 bg-[#121212] border border-white/10 rounded-xl px-2.5 py-1.5 cursor-pointer hover:border-white/20 transition-all shrink-0">
          <Wallet className="w-3.5 h-3.5 text-[#FFD700]" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Wallet</span>
            <span className="text-[10px] text-green-500 font-bold mt-0.5">₹1,250</span>
          </div>
        </div>

        <button
          className="bg-[#FFD700] text-black font-bold rounded-xl px-3 py-2 text-xs md:px-5 md:py-2.5 md:text-sm hover:bg-[#E6C200] transition-all shadow-[0_4px_14px_rgba(255,215,0,0.2)] shrink-0"
          onClick={() => authenticated ? navigate('/book-ride') : navigate('/login')}
        >
          {t('book')}
        </button>

        {authenticated ? (
          <div className="relative hidden lg:block" ref={dropdownRef}>
            <button 
              className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center font-bold text-[#FFD700] hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 premium-glass bg-[#121212]/95 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-2 flex flex-col z-[60]">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <div className="font-bold text-white text-sm">{userName || 'User'}</div>
                  <div className="text-xs text-[#FFD700]">Ucab Member</div>
                </div>
                <Link to="/settings" className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#FFD700] transition-colors" onClick={() => setDropdownOpen(false)}>{t('wallet')}</Link>
                <Link to="/settings" className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#FFD700] transition-colors" onClick={() => setDropdownOpen(false)}>{t('profile')}</Link>
                <Link to="/support" className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#FFD700] transition-colors" onClick={() => setDropdownOpen(false)}>🎧 {t('support')}</Link>
                <Link to="/settings" className="px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-[#FFD700] transition-colors" onClick={() => setDropdownOpen(false)}>{t('settings')}</Link>
                <div className="border-t border-white/10 my-1"></div>
                <button className="px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left" onClick={handleLogout}>{t('logout')}</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="hidden lg:block text-sm font-bold text-[#FFD700] border border-[#FFD700] px-4 py-2 rounded-xl hover:bg-[#FFD700] hover:text-black transition-all shrink-0">
            {t('login')}
          </Link>
        )}

        {/* Mobile Hamburger menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white hover:text-[#FFD700] transition-colors p-1 cursor-pointer shrink-0"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#0d0d0d] border-b border-white/10 shadow-2xl flex flex-col z-[1000] px-6 py-8 lg:hidden">
          
          {/* Main Navigation Links */}
          <div className="flex flex-col gap-5">
            {NAV_LINKS.map(({ labelKey, path }) => (
              <Link
                key={path}
                to={path}
                className={`text-lg font-medium transition-all ${
                  isActive(path) ? 'text-[#FFD700]' : 'text-white hover:text-[#FFD700]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(labelKey)}
              </Link>
            ))}
          </div>

          {/* Account Settings Divider & Section */}
          <div className="flex flex-col mt-6 pt-6 border-t border-white/10 gap-5">
            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">
              ACCOUNT SETTINGS
            </span>
            
            {/* Language Selector Row */}
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-300">Language:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { i18n.changeLanguage('en'); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                    i18n.language === 'en' 
                      ? 'bg-[#FFD700] text-black border-[#FFD700]' 
                      : 'border-white/10 text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  EN
                </button>
                <button 
                  onClick={() => { i18n.changeLanguage('hi'); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                    i18n.language === 'hi' 
                      ? 'bg-[#FFD700] text-black border-[#FFD700]' 
                      : 'border-white/10 text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  HI
                </button>
                <button 
                  onClick={() => { i18n.changeLanguage('te'); setMobileMenuOpen(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all ${
                    i18n.language === 'te' 
                      ? 'bg-[#FFD700] text-black border-[#FFD700]' 
                      : 'border-white/10 text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  TE
                </button>
              </div>
            </div>

            {/* Profile and Logout Links */}
            <Link 
              to="/settings" 
              className="text-sm text-gray-300 hover:text-white flex items-center" 
              onClick={() => setMobileMenuOpen(false)}
            >
              My Profile
            </Link>
            
            {authenticated && (
              <button 
                className="text-sm text-red-500 font-bold hover:text-red-400 mt-2 text-left" 
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS DRAWER */}
      <Notifications isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </nav>
  );
}
