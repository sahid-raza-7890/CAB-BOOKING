import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { motion } from 'framer-motion';
import { useMapContext } from '../context/MapContext';
import { useRef } from 'react';
import { 
  Home, User, Map as MapIcon, CircleDollarSign, BarChart2, Star, 
  Wallet, FileText, Car, Users, HeadphonesIcon, Settings,
  AlertTriangle, ChevronDown, Bell, Globe, Coffee, Fuel,
  Utensils, Droplets, Minus, Plus, Target, Focus,
  MessageSquare, ArrowRight, MapPin, Navigation, TrendingUp, X, Check, Shield, Flame, Battery, ShieldCheck, Watch, LogOut
} from 'lucide-react';
import DriverEarningsDashboard from './DriverEarnings/DriverEarningsDashboard';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3 cursor-pointer transition-all ${
      active 
        ? 'border-l-4 border-[#FFD700] bg-gradient-to-r from-[#FFD700]/20 to-transparent text-[#FFD700] font-bold' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);


function DriverDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const { isLoaded } = useMapContext();
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const animRef = useRef(null);
  const driversRef = useRef([]);
  
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const fetchRides = async () => {
    if (!isOnline || !token) return;
    try {
      const response = await fetch('http://localhost:5000/api/rides/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRides(data);
      }
    } catch (error) {
      console.error("Failed to fetch rides");
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchRides();
    } else {
      setRides([]); // Clear queue if offline
    }
  }, [isOnline, token]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewRide = () => {
      if (isOnline) fetchRides();
    };
    
    socket.on('new_ride_request', handleNewRide);
    socket.on('new_ride_request', handleNewRide);
    return () => socket.off('new_ride_request', handleNewRide);
  }, [isOnline, socket, token]);

  useEffect(() => {
    if (activeTab !== 'Dashboard') return;
    if (mapInst.current || !mapRef.current) return;
    const loadMap = () => {
      if (!window.L || !mapRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, preferCanvas: true }).setView([14.4426, 79.9865], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
      mapInst.current = map;
      
      // Driver blue dot
      L.marker([14.4426, 79.9865], { icon: L.divIcon({ html: '<div style="width:14px;height:14px;border-radius:50%;background:#4f8ef7;border:3px solid #fff;box-shadow:0 0 12px rgba(79,142,247,.8);"></div>', iconSize:[14,14], iconAnchor:[7,7], className:'' }) }).addTo(map);
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

    return () => { 
      if (animRef.current) cancelAnimationFrame(animRef.current); 
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null; } 
    };
  }, [activeTab]);

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/accept`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        triggerToast("Ride Accepted! Initiating navigation...", "success");
        setActiveRide(data.ride);
        setRides(rides.filter(r => r._id !== rideId));
        setActiveTab('Live Map'); 
      } else {
        triggerToast(data.error || "Failed to accept ride", "error");
      }
    } catch (error) {
      triggerToast("Network error", "error");
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl text-black font-bold z-[2000] shadow-2xl transition-all ${toast.type === 'success' ? 'bg-[#FFD700]' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between py-4 z-50 shrink-0">
        <div>
          {/* Logo */}
          <div className="flex flex-col px-6 mb-8 mt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#FFD700] fill-[#FFD700]" />
              <span className="text-3xl font-bold tracking-tight text-white">ucab</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 pl-8">Drive. Earn. Inspire.</span>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
            <SidebarItem icon={Home} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <SidebarItem icon={Car} label="Ride Requests" active={activeTab === 'Ride Requests'} onClick={() => setActiveTab('Ride Requests')} />
            <SidebarItem icon={MapPin} label="Live Map" active={activeTab === 'Live Map'} onClick={() => setActiveTab('Live Map')} />
            <SidebarItem icon={Wallet} label="Earnings" active={activeTab === 'Earnings'} onClick={() => setActiveTab('Earnings')} />
            <SidebarItem icon={Navigation} label="Trips" active={activeTab === 'Trips'} onClick={() => setActiveTab('Trips')} />
            <SidebarItem icon={BarChart2} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
            <SidebarItem icon={Star} label="Bonuses" active={activeTab === 'Bonuses'} onClick={() => setActiveTab('Bonuses')} />
            <SidebarItem icon={Star} label="Ratings" active={activeTab === 'Ratings'} onClick={() => setActiveTab('Ratings')} />
            <SidebarItem icon={Wallet} label="Wallet" active={activeTab === 'Wallet'} onClick={() => setActiveTab('Wallet')} />
            <SidebarItem icon={Car} label="Vehicle" active={activeTab === 'Vehicle'} onClick={() => setActiveTab('Vehicle')} />
            <SidebarItem icon={FileText} label="Documents" active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
            <SidebarItem icon={Users} label="Referrals" active={activeTab === 'Referrals'} onClick={() => setActiveTab('Referrals')} />
            <SidebarItem icon={HeadphonesIcon} label="Support" active={activeTab === 'Support'} onClick={() => setActiveTab('Support')} />
            <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
          </div>
        </div>

        {/* SOS Emergency */}
        <div className="px-4 mt-2 flex flex-col gap-2">
          <button className="w-full bg-[#1a0505] border border-red-900 text-red-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-red-900/40 transition-colors">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <span className="font-bold text-lg">SOS</span>
            </div>
            <span className="text-xs text-red-500/70">Emergency</span>
          </button>
          
          <button 
            onClick={logout}
            className="w-full bg-[#111] border border-white/5 text-gray-400 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white transition-colors mt-2"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm">Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <div className="h-[72px] bg-[#0a0a0a] border-b border-white/10 flex justify-between items-center px-6 shrink-0">
          
          {/* Left: Online Toggle */}
          <div className="flex items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-1.5 px-3">
            <div 
              onClick={() => setIsOnline(!isOnline)}
              className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors flex items-center ${isOnline ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <motion.div 
                layout
                className="w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: isOnline ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
            <div className="flex flex-col">
              <span className={isOnline ? 'text-white font-bold text-sm' : 'text-gray-400 font-bold text-sm'}>{isOnline ? 'Online' : 'Offline'}</span>
              <span className="text-[10px] text-gray-400">You are available for rides</span>
            </div>
          </div>

          {/* Middle/Right Header items */}
          <div className="flex items-center gap-4">
            
            {/* Profile Pill */}
            <div className="flex items-center gap-3 bg-[#111] border border-white/10 rounded-2xl p-1.5 pr-4">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop" alt="Driver" className="w-9 h-9 rounded-full object-cover" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold leading-none">{user?.name || 'Driver'}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-[#FFD700] fill-[#FFD700]" />
                    <span className="text-xs font-bold">4.9</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#FFD700] font-medium mt-0.5">Gold Driver</span>
              </div>
            </div>

            {/* Earnings Pill */}
            <div className="flex items-center gap-3 bg-[#111] border border-[#FFD700]/20 rounded-2xl p-1.5 px-4 cursor-pointer hover:bg-white/5 transition">
              <Wallet className="w-5 h-5 text-[#FFD700]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-medium">Today's Earnings</span>
                <span className="text-sm font-bold text-[#FFD700]">₹3,420.00</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
            </div>

            {/* Notifications */}
            <div className="flex flex-col items-center justify-center cursor-pointer mx-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FFD700] text-black text-[10px] font-bold rounded-full flex items-center justify-center border border-[#0a0a0a]">8</span>
              </div>
              <span className="text-[9px] text-gray-400 mt-1">Notifications</span>
            </div>

            {/* Language */}
            <div className="flex items-center gap-1 cursor-pointer bg-[#111] border border-white/10 rounded-xl px-3 py-1.5 hover:bg-white/5 transition">
              <Globe className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-400">Language</span>
                <div className="flex items-center text-xs font-bold text-white">EN <ChevronDown className="w-3 h-3 ml-1" /></div>
              </div>
            </div>

            {/* Book a Ride Button */}
            <button className="bg-[#FFD700] text-black font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#e6c200] transition shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              Book a Ride
            </button>
            
            {/* User Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-black text-lg shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>

          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'Earnings' ? (
            <DriverEarningsDashboard />
          ) : (
            <div className="grid grid-cols-12 gap-4 h-full min-h-[700px]">
              
              {/* Middle Column (Command Center) - col-span-4 */}
              <div className="col-span-4 flex flex-col gap-4">
              
              {/* 1. Today's Performance */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">Today's Performance</h3>
                  <span className="text-xs text-[#FFD700] cursor-pointer">View All</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[#161616] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mb-1" />
                    <span className="text-lg font-black text-white">₹3,420</span>
                    <span className="text-[10px] text-gray-400">Earnings</span>
                    <span className="text-[9px] text-green-500 mt-1">↑ 18% vs yesterday</span>
                  </div>
                  <div className="bg-[#161616] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Car className="w-5 h-5 text-blue-500 mb-1" />
                    <span className="text-lg font-black text-white">12</span>
                    <span className="text-[10px] text-gray-400">Trips</span>
                    <span className="text-[9px] text-green-500 mt-1">↑ 9% vs yesterday</span>
                  </div>
                  <div className="bg-[#161616] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Watch className="w-5 h-5 text-gray-300 mb-1" />
                    <span className="text-lg font-black text-white">6h 24m</span>
                    <span className="text-[10px] text-gray-400">Online Time</span>
                    <span className="text-[9px] text-green-500 mt-1">↑ 12% vs yesterday</span>
                  </div>
                  <div className="bg-[#161616] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    <Star className="w-5 h-5 text-[#8b5cf6] fill-[#8b5cf6] mb-1" />
                    <span className="text-lg font-black text-white">4.9</span>
                    <span className="text-[10px] text-gray-400">Rating</span>
                    <span className="text-[9px] text-green-500 mt-1">Excellent</span>
                  </div>
                </div>
              </div>

              {/* 2. Active Quest */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full border border-red-500/30 flex items-center justify-center bg-red-500/10 shrink-0">
                      <Flame className="w-6 h-6 text-red-500 fill-red-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">Active Quest</span>
                      <span className="text-[11px] text-gray-400 mt-0.5 pr-2">Complete 2 more rides before 5 PM to unlock <strong>₹250 bonus!</strong></span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="bg-black border border-[#FFD700]/30 rounded-lg px-3 py-1 flex flex-col items-center">
                      <span className="text-sm font-black text-[#FFD700]">₹250</span>
                      <span className="text-[9px] text-[#FFD700]">Bonus</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Flame className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                      <span className="text-xs font-bold text-white">12</span>
                      <span className="text-[9px] text-gray-400">Days Streak</span>
                      <span className="text-[8px] text-green-500">Keep it up!</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 z-10 w-2/3">
                  <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#FFD700] w-[80%] h-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-2">
                    <span className="text-green-500">8 / 10 Rides Completed</span>
                    <span className="text-gray-400">Ends in 02:15:30</span>
                  </div>
                </div>
              </div>

              {/* 3. New Ride Request (Dynamic Binding) */}
              {rides.length > 0 && !activeRide && (
                <div className="bg-[#1a0a0a] border border-red-500/40 rounded-2xl p-4 flex flex-col shadow-[0_0_15px_rgba(220,38,38,0.1)]">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-white text-lg">New Ride Request</h3>
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/50">New!</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-[#FFD700] font-bold shrink-0 text-xl border border-white/10">
                        {rides[0].userId?.name ? rides[0].userId.name.charAt(0).toUpperCase() : rides[0].passengerName?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-lg">{rides[0].userId?.name || rides[0].passengerName || 'Passenger'}</span>
                        <div className="flex items-center gap-1 text-sm text-[#FFD700] font-bold">
                          <Star className="w-3 h-3 fill-[#FFD700]" /> 4.8
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-400">Estimated Distance</span>
                        <span className="font-bold text-white">4.2 km</span>
                        <span className="text-[10px] text-gray-400 mt-1">ETA</span>
                        <span className="font-bold text-white">8 mins</span>
                      </div>
                      <div className="w-14 h-14 rounded-full border-[3px] border-red-500 flex flex-col items-center justify-center shrink-0 shadow-[0_0_10px_rgba(220,38,38,0.5)] bg-black/40">
                        <span className="text-xl font-black text-white leading-none">14</span>
                        <span className="text-[9px] text-red-500 font-bold">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="flex flex-col gap-0 mt-4 pl-1">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center mt-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 z-10 shrink-0" />
                        <div className="w-px h-6 bg-white/20" />
                      </div>
                      <span className="text-sm font-medium text-gray-300 truncate">{typeof rides[0].pickupLocation === 'object' ? rides[0].pickupLocation?.address || 'Unknown' : rides[0].pickupLocation}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 z-10 shrink-0" />
                      </div>
                      <span className="text-sm font-medium text-gray-300 truncate">{typeof rides[0].dropoffLocation === 'object' ? rides[0].dropoffLocation?.address || 'Unknown' : rides[0].dropoffLocation}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-2 mt-4">
                    <span className="bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/30">Cash</span>
                    <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-1 rounded">₹{rides[0].fare}</span>
                    <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-1 rounded">{rides[0].vehicleType || 'Standard'}</span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => setRides(rides.filter(r => r._id !== rides[0]._id))}
                      className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/30 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" /> Decline
                    </button>
                    <button 
                      onClick={() => handleAcceptRide(rides[0]._id)}
                      className="flex-1 bg-[#FFD700] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e6c200] transition shadow-lg cursor-pointer"
                    >
                      <Check className="w-5 h-5" /> Accept Ride
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Quick Actions */}
              <div className="bg-[#111] border border-white/5 rounded-2xl p-4 shadow-lg">
                <h3 className="font-bold text-white mb-3">Quick Actions</h3>
                <div className="flex justify-between px-2">
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Break</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Fuel</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Lunch</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Restroom</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors text-[#FFD700]">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Going Home</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[#FFD700] group-hover:text-black transition-colors">
                      <Navigation className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Navigation</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column (Map & Bottom Cards) - col-span-8 */}
            <div className="col-span-8 flex flex-col gap-4">
              
              {/* Map Container */}
              <div className="flex-1 rounded-2xl overflow-hidden relative border border-white/10 shadow-lg bg-[#0d0d0d] min-h-[400px]">
                
                {/* Map Overlays */}
                <div className="absolute top-4 left-4 z-[500] bg-black/80 backdrop-blur-md border border-[#FFD700]/30 rounded-full px-4 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center shrink-0">
                    <Navigation className="w-3 h-3 text-black fill-black -rotate-45" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#FFD700] uppercase tracking-wider">Driver is on the way</span>
                    <span className="text-xs font-medium text-white">Arriving in 3 min • KA05AB1234</span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-[500] flex flex-col items-end gap-2">
                  <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FFD700]" /> 28°C • CLEAR
                    </span>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> LIGHT TRAFFIC
                    </span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-md border border-[#FFD700]/30 rounded-xl px-4 py-2 flex flex-col items-center mt-2">
                    <span className="text-xl font-black text-[#FFD700]">2.2x</span>
                    <span className="text-[10px] text-[#FFD700] uppercase tracking-wider">High Demand</span>
                  </div>
                </div>

                {/* Map Tools */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[500] flex flex-col gap-2">
                  <button className="w-12 h-12 bg-black/80 backdrop-blur border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#FFD700] hover:text-black transition group text-gray-400">
                    <div className="w-4 h-4 bg-[#FFD700] opacity-50 group-hover:opacity-100 rounded rotate-45" />
                    <span className="text-[8px] font-bold">Heatmap</span>
                  </button>
                  <button className="w-12 h-12 bg-black/80 backdrop-blur border border-white/10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#FFD700] hover:text-black transition group text-gray-400">
                    <Home className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Home Filter</span>
                  </button>
                  <button className="w-12 h-12 bg-black/80 backdrop-blur border border-white/10 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition text-gray-300 mt-4">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 bg-black/80 backdrop-blur border border-white/10 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition text-gray-300">
                    <Minus className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 bg-black/80 backdrop-blur border border-white/10 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition text-gray-300 mt-4">
                    <Focus className="w-5 h-5" />
                  </button>
                </div>

                {/* Left Middle Overlay */}
                <div className="absolute left-4 top-1/3 z-[500] bg-black/80 backdrop-blur border border-white/10 rounded-2xl p-3 flex gap-3 shadow-lg">
                  <div className="flex flex-col items-center justify-end w-4 bg-gray-800 rounded-full overflow-hidden h-12">
                    <div className="w-full h-2/3 bg-[#FFD700]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">High Demand Zone</span>
                    <span className="text-[9px] text-gray-400 leading-tight">Move here for<br/>more rides</span>
                    <span className="text-[10px] text-green-500 font-bold mt-1">+35% Earnings</span>
                  </div>
                </div>

                {/* Bottom Left Legend */}
                <div className="absolute bottom-4 left-4 z-[500] bg-black/80 backdrop-blur border border-white/10 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]" /><span className="text-[10px] text-gray-300">Available Drivers</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-600" /><span className="text-[10px] text-gray-300">High Demand</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-[10px] text-gray-300">Upcoming Demand</span></div>
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-300">You are here</span></div>
                </div>

                {/* Bottom Right AI Suggestion */}
                <div className="absolute bottom-20 right-20 z-[500] bg-black/80 backdrop-blur border border-[#FFD700]/30 rounded-2xl p-3 flex items-center gap-3 shadow-lg max-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-[#FFD700] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#FFD700] font-bold uppercase tracking-wider mb-0.5">AI Suggestion</span>
                    <span className="text-xs text-white leading-tight">High demand near Railway Station.<br/>Move 1.2 km east</span>
                  </div>
                </div>

                {/* Bottom Right Chatbot */}
                <div className="absolute bottom-4 right-20 z-[500] bg-black/90 backdrop-blur border border-white/10 rounded-full pl-2 pr-4 py-1.5 flex items-center gap-3 shadow-xl cursor-pointer hover:bg-white/5 transition">
                  <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center shrink-0">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white">Hi! I'm Ucab AI</span>
                    <span className="text-[9px] text-green-400">How can I help you today?</span>
                  </div>
                </div>

                {/* Map */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                  <div id="ucab-driver-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
                </div>
              </div>

              {/* Bottom Cards Row (Grid of 5) */}
              <div className="grid grid-cols-5 gap-4">
                
                {/* 1. Earnings Trend */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 font-bold">Earnings Trend</span>
                    <span className="text-[9px] text-gray-500 flex items-center">This Week <ChevronDown className="w-3 h-3 ml-0.5" /></span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">₹18,750 <Check className="w-3 h-3 text-green-500 inline" /></div>
                    <div className="text-[9px] text-green-500 mt-0.5">↑ 22% vs last week</div>
                  </div>
                  {/* Mock Bar Chart */}
                  <div className="flex items-end gap-1.5 h-8 mt-2">
                    <div className="w-full bg-[#FFD700]/30 rounded-t-sm h-3" />
                    <div className="w-full bg-[#FFD700]/50 rounded-t-sm h-5" />
                    <div className="w-full bg-[#FFD700]/40 rounded-t-sm h-4" />
                    <div className="w-full bg-[#FFD700]/80 rounded-t-sm h-7" />
                    <div className="w-full bg-[#FFD700] rounded-t-sm h-full" />
                    <div className="w-full bg-[#FFD700]/20 rounded-t-sm h-2" />
                    <div className="w-full bg-[#FFD700]/40 rounded-t-sm h-5" />
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                {/* 2. Upcoming Bookings */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 font-bold">Upcoming Bookings</span>
                    <span className="text-[9px] text-gray-500 flex items-center">Today <ChevronDown className="w-3 h-3 ml-0.5" /></span>
                  </div>
                  <span className="text-[9px] text-gray-400 mb-2">2 Bookings</span>
                  
                  <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-1 top-2 bottom-2 w-px bg-white/10 z-0" />
                    <div className="flex justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 border border-[#111]" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white">10:30 AM</span>
                          <span className="text-[9px] text-gray-400">Airport Drop</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white">₹342</span>
                    </div>
                    <div className="flex justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 border border-[#111]" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white">12:15 PM</span>
                          <span className="text-[9px] text-gray-400">Scheduled Ride</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white">₹256</span>
                    </div>
                  </div>
                  <div className="text-right mt-1"><span className="text-[9px] text-[#FFD700] cursor-pointer">View All</span></div>
                </div>

                {/* 3. Driver Level */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">Driver Level</span>
                  <div className="flex items-center gap-2 mt-2">
                    <Shield className="w-8 h-8 text-[#FFD700]" />
                    <span className="text-sm font-bold text-[#FFD700]">Gold Driver</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FFD700] w-[80%] h-full rounded-full" />
                    </div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-[9px] text-gray-400">2450 / 3000 XP</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-400 mt-1">Next: Platinum</div>
                </div>

                {/* 4. Vehicle Status */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400 font-bold mb-1">Vehicle Status</span>
                  <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold mb-3">
                    <Check className="w-3 h-3" /> All Good
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 flex items-center gap-1"><Fuel className="w-3 h-3" /> Fuel</span>
                      <span className="text-green-500">80%</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" /> Tyre Pressure</span>
                      <span className="text-green-500">Good</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-400 flex items-center gap-1"><Settings className="w-3 h-3" /> Engine</span>
                      <span className="text-green-500">Good</span>
                    </div>
                  </div>
                  <div className="text-right mt-1"><span className="text-[9px] text-[#FFD700] cursor-pointer">View Details</span></div>
                </div>

                {/* 5. Wallet Balance */}
                <div className="bg-[#111] border border-white/5 rounded-2xl p-3 flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">Wallet Balance</span>
                  <div className="text-lg font-black text-white mt-1">₹3,420.00</div>
                  
                  <button className="w-full border border-[#FFD700] text-[#FFD700] text-[10px] font-bold py-1.5 rounded-lg hover:bg-[#FFD700] hover:text-black transition mt-4 mb-2">
                    WITHDRAW
                  </button>
                  <div className="text-right"><span className="text-[9px] text-[#FFD700] cursor-pointer">View Details</span></div>
                </div>

              </div>

            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;
