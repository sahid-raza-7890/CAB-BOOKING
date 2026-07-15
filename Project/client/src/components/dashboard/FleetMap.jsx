import React, { useState, useEffect, useContext, useMemo } from 'react';
import { PassengerContext } from '../../context/PassengerContext';
import { useMapContext } from '../../context/MapContext';
import { Shield, Sun, MessageSquare, Navigation } from 'lucide-react';

const ACTIVE_CAR_ICON = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#000" stroke-width="2"/><text x="16" y="21" font-size="16" text-anchor="middle">🚖</text></svg>'),
  scaledSize: { width: 32, height: 32 },
  anchor: { x: 16, y: 16 }
};

const USER_ICON = {
  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="#FFF" stroke-width="2"/></svg>'),
  scaledSize: { width: 32, height: 32 },
  anchor: { x: 16, y: 16 }
};

const FleetMap = () => {
  const centerCoords = useMemo(() => ({ lat: 12.9716, lng: 77.5946 }), []); // Bengaluru Center
  const { liveDrivers } = useContext(PassengerContext) || { liveDrivers: [] };
  const { isLoaded } = useMapContext();
  
  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm your Ucab AI co-pilot. How can I assist you with your journey today?" }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef(null);

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const userMsg = { sender: 'user', text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'I am the Ucab AI. I am currently operating in demo mode, but I will soon be able to assist you with live bookings and route adjustments!'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  // Auto scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, chatOpen]);

  const mapRef = React.useRef(null);
  const mapInst = React.useRef(null);
  const markersRef = React.useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;
    const loadMap = () => {
      if (!window.L || !mapRef.current) return;
      const L = window.L;
      if (!mapInst.current) {
        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false, preferCanvas: true }).setView([centerCoords.lat, centerCoords.lng], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
        mapInst.current = map;
      } else {
        mapInst.current.setView([centerCoords.lat, centerCoords.lng], mapInst.current.getZoom());
      }

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add user marker
      const userMarker = L.marker([centerCoords.lat, centerCoords.lng], {
        icon: L.divIcon({ html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:2px solid #FFF;"></div>', iconSize:[16,16], iconAnchor:[8,8], className:'' })
      }).addTo(mapInst.current);
      markersRef.current.push(userMarker);

      // Add live drivers
      if (liveDrivers && liveDrivers.length > 0) {
        liveDrivers.forEach(driver => {
          const lat = driver.location?.lat;
          const lng = driver.location?.lng;
          if (lat && lng) {
            const driverMarker = L.marker([lat, lng], {
              icon: L.divIcon({ html: '<div style="font-size:24px;filter:drop-shadow(0 2px 6px rgba(255,215,0,0.6));">🚖</div>', iconSize:[24,24], iconAnchor:[12,12], className:'' })
            }).addTo(mapInst.current);
            markersRef.current.push(driverMarker);
          }
        });
      }
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

  }, [centerCoords, liveDrivers]);

  return (
    <div className="premium-glass w-full h-full min-h-[600px] rounded-2xl overflow-hidden relative z-10">
      
      {/* ── OVERLAY 1: Dynamic Island ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-3 bg-black/90 border border-[#FFD700]/30 rounded-full px-4 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.6)] w-[90%] max-w-[350px] md:max-w-md text-xs pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-[#FFD700]/10 flex items-center justify-center text-[#FFD700] shrink-0 animate-pulse">
          <Navigation className="w-4 h-4 fill-[#FFD700]" />
        </div>
        <div className="flex flex-col text-left leading-tight pr-2">
          <span className="text-[9px] text-[#FFD700] font-bold uppercase tracking-wider">Driver is on the way</span>
          <span className="text-[11px] text-white font-extrabold mt-0.5">Arriving in 3 min • KA05AB1234</span>
        </div>
      </div>

      {/* ── OVERLAY 2: Weather & Traffic Pill ── */}
      <div className="absolute lg:top-4 lg:right-4 top-16 right-2 z-[500] flex items-center gap-2 bg-[#121212]/90 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 shadow-lg text-[9px] lg:text-[10px] font-bold text-white uppercase tracking-wider pointer-events-auto">
        <div className="flex items-center gap-1">
          <Sun className="w-3.5 h-3.5 text-yellow-400" />
          <span>28°C • Clear</span>
        </div>
        <span className="text-white/20">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
          <span className="text-green-400">Light Traffic</span>
        </div>
      </div>

      {/* ── OVERLAY 3: Safety Shield ── */}
      <div className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 scale-75 lg:scale-100 transform origin-right z-[500] flex flex-col items-center justify-center gap-1 bg-[#121212]/90 border border-white/10 rounded-2xl p-2.5 lg:p-3 shadow-xl w-16 text-center select-none pointer-events-auto">
        <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-500 fill-green-500/20" />
        </div>
        <span className="text-[8px] text-gray-500 font-extrabold uppercase mt-1">Safety</span>
        <span className="text-[10px] text-green-500 font-black uppercase tracking-wider leading-none">Armed</span>
      </div>

      {/* ── OVERLAY 4: Legend ── */}
      <div className="absolute bottom-16 lg:bottom-4 left-2 lg:left-4 z-[500] flex flex-col gap-2 bg-[#121212]/90 border border-white/10 backdrop-blur-md rounded-2xl p-2 lg:p-3 shadow-xl text-[9px] lg:text-[10px] font-bold text-gray-400 w-36 lg:w-44 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] shadow-[0_0_6px_#FFD700]" />
          <span className="text-white">Available Drivers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-white/40" />
          <span>Coming Soon (Predicted)</span>
        </div>
      </div>

      {/* ── OVERLAY 5: Open Chat Window overlay ── */}
      {chatOpen && (
        <div className="absolute bottom-24 right-6 w-80 lg:w-96 bg-[#121212] border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[1000] flex flex-col max-h-[380px] pointer-events-auto">
          {/* Header */}
          <div className="bg-[#FFD700] p-3 flex justify-between items-center shrink-0">
            <span className="font-bold text-black flex items-center gap-1.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center gap-0.5">
                <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
                <div className="w-1 h-1 rounded-full bg-[#FFD700]" />
              </div>
              Ucab AI Assistant
            </span>
            <button onClick={() => setChatOpen(false)} className="text-black hover:text-gray-800 font-bold text-xs">✕</button>
          </div>

          {/* Messages */}
          <div className="p-3 flex-1 overflow-y-auto flex flex-col gap-2.5 min-h-[200px] max-h-[250px]">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-2xl text-[11px] max-w-[85%] border leading-tight ${
                  msg.sender === 'user'
                    ? 'bg-[#FFD700] text-black border-[#FFD700]/30 self-end rounded-tr-none'
                    : 'bg-white/5 text-gray-300 border-white/5 self-start rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="bg-white/5 text-gray-400 border-white/5 p-2.5 rounded-2xl rounded-tl-none text-[11px] self-start italic animate-pulse">
                Ucab AI is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-2.5 border-t border-white/10 bg-black/20 flex gap-2 shrink-0"
          >
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#FFD700]"
            />
            <button 
              type="submit"
              className="bg-[#FFD700] px-3 py-1.5 rounded-xl text-black font-bold transition-all hover:bg-[#E6C200] text-xs"
            >
              ➔
            </button>
          </form>
        </div>
      )}

      {/* ── OVERLAY 6: AI Chatbot Avatar Pill (Trigger) ── */}
      <div 
        onClick={() => setChatOpen(!chatOpen)}
        className="absolute bottom-6 right-6 z-[1000] flex items-center gap-3 bg-[#121212]/95 border border-white/10 rounded-2xl p-3 shadow-2xl max-w-[200px] hover:border-[#FFD700]/30 transition-transform hover:scale-105 cursor-pointer select-none group pointer-events-auto"
      >
        <div className="relative w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center gap-1 shrink-0 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-black" />
          <div className="w-2 h-2 rounded-full bg-black" />
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-[#121212]" />
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[10px] font-extrabold text-white group-hover:text-[#FFD700] transition-colors">Hi! I'm Ucab AI</span>
          <span className="text-[9px] text-gray-400 font-medium mt-0.5">How can I help you today?</span>
        </div>
      </div>

      {/* Leaflet Map */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <div id="ucab-fleet-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default FleetMap;
