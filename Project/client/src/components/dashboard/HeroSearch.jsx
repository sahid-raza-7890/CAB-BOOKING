import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Home as HomeIcon, Briefcase, Plane, Info, ShieldCheck, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';

const HeroSearch = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    if (!socket) return;
    
    const handleRideAccepted = (ride) => {
      setIsSearching(false);
      setIsAccepted(true);
      triggerToast(`Driver is on the way!`, 'success');
    };

    socket.on('ride_accepted', handleRideAccepted);
    return () => socket.off('ride_accepted', handleRideAccepted);
  }, [socket]);

  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleBooking = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      triggerToast("Please enter both pickup and drop-off locations.", "error");
      return;
    }
    
    if (!token) {
      triggerToast("Please login to book a ride.", "error");
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/rides/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pickup, dropoff })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        triggerToast("Driver request sent!", "success");
        // Keep in searching state to simulate Dynamic Island loader
      } else {
        triggerToast(data.error || "Failed to book ride.", "error");
        setIsSearching(false);
      }
    } catch (error) {
      triggerToast("Network error. Please try again.", "error");
      setIsSearching(false);
    }
  };

  const handleSwap = () => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  return (
    <div className="premium-glass p-6 w-full mx-auto rounded-3xl flex flex-col gap-6 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-black font-bold z-[100] shadow-lg flex items-center gap-2 text-sm whitespace-nowrap ${toast.type === 'success' ? 'bg-[#FFD700]' : 'bg-red-500 text-white'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}
      
      {/* Title Area */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">
          Your Journey, Simplified.
        </h1>
        
        {/* Voice Booking Pill */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/5 hover:bg-[#FFD700]/10 text-[#FFD700] cursor-pointer shadow-[0_0_12px_rgba(255,215,0,0.1)] transition-all">
          <Mic className="w-4 h-4 animate-bounce text-[#FFD700]" />
          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] font-bold uppercase tracking-wider">Try Voice Booking</span>
            <span className="text-[8px] text-gray-400 font-semibold mt-0.5">Tap to speak your destination</span>
          </div>
        </button>
      </div>

      {/* Input Group Container */}
      <div className="relative flex items-center gap-4 bg-[#121212] border border-white/10 rounded-2xl p-4">
        {/* Dot Connector */}
        <div className="flex flex-col items-center justify-between py-2.5 h-20 w-4 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <div className="flex-1 border-l-2 border-dashed border-white/20 my-1" />
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        </div>
        
        {/* Inputs */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Pickup Input */}
          <div className="relative flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex-1">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Pickup Location</label>
              <input 
                type="text" 
                placeholder="Where are you starting from?" 
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none mt-0.5 font-medium" 
              />
            </div>
            <button className="text-gray-500 hover:text-white mr-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Dropoff Input */}
          <div className="relative flex items-center justify-between pt-1">
            <div className="flex-1">
              <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Drop-off Location</label>
              <input 
                type="text" 
                placeholder="Where would you like to go?" 
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none mt-0.5 font-medium" 
              />
            </div>
            <button className="text-gray-500 hover:text-white mr-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Swap Button (Absolute overlap on the right) */}
        <button 
          onClick={handleSwap}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1e1e1e] border border-white/10 flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all cursor-pointer z-10 shadow-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
          </svg>
        </button>
      </div>

      {/* Saved Places */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Saved Places</label>
        <div className="flex flex-wrap gap-2.5">
          <button className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 hover:border-[#FFD700] rounded-xl px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer">
            <HomeIcon className="w-3.5 h-3.5 text-[#FFD700]" />
            Home
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 hover:border-[#FFD700] rounded-xl px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer">
            <Briefcase className="w-3.5 h-3.5 text-[#FFD700]" />
            Office
          </button>
          <button className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 hover:border-[#FFD700] rounded-xl px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer">
            <Plane className="w-3.5 h-3.5 text-[#FFD700]" />
            Airport
          </button>
        </div>
      </div>

      {/* Pricing Indicator */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-semibold text-white">Pricing: Normal</span>
          <span className="text-[10px] text-gray-500 font-medium hidden sm:inline">• Fares are stable right now</span>
        </div>
        <button className="text-gray-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer group">
          Why prices may change?
          <Info className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Main CTA */}
      <button 
        onClick={handleBooking}
        disabled={isSearching || isAccepted}
        className={`w-full font-bold rounded-xl py-4 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,215,0,0.15)] text-base ${
          isAccepted
            ? 'bg-green-500 text-black cursor-default'
            : isSearching 
              ? 'bg-[#121212] border border-[#FFD700] text-[#FFD700] cursor-default' 
              : 'bg-[#FFD700] text-black hover:bg-[#E6C200] group cursor-pointer'
        }`}
      >
        {isAccepted ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Driver is on the way!
          </>
        ) : isSearching ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Searching for drivers near you...
          </>
        ) : (
          <>
            Estimate & Book
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        Secure booking • 256-bit encrypted
      </div>
      
    </div>
  );
};

export default HeroSearch;
