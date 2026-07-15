import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, MapPin } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20">
      
      {/* Background with City Skyline Gradient (Dark mode style by default, but respects theme) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-dark via-[#1e293b] to-dark opacity-90" />
      
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Pane: Typography & CTA */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 shadow-xl">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-wide uppercase">Premium Ride-Hailing</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Elevate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
              Daily Transit.
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
            Experience the next generation of urban mobility. Fast, secure, and tailored to your preferences. Millions of rides, zero compromises.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/book-ride')}
              className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] transition-shadow flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              Book Now
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/services')}
              className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              Explore Services
            </motion.button>
          </div>
        </motion.div>

        {/* Right Pane: 3D Vehicle & Floating Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:flex justify-center items-center h-[500px]"
        >
          {/* Main Vehicle Image */}
          <motion.img 
            src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3"
            alt="Premium Sedan"
            className="w-full max-w-lg object-contain drop-shadow-2xl rounded-2xl z-10"
            initial={{ y: 0 }}
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))", mixBlendMode: 'screen', opacity: 0.8 }}
          />

          {/* Fallback image (if the unsplash one has background, we'll just style it nicely) 
              Actually, for a real transparent car render, we'd use a transparent PNG. 
              Let's use a known transparent car placeholder if possible, or just style this nicely. 
              Using an abstract glowing orb behind it for depth. */}
          <div className="absolute w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] z-0"></div>

          {/* Floating ETA Card */}
          <motion.div 
            className="absolute top-10 right-0 z-20 premium-glass px-4 py-3 flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
            initial={{ y: 0 }}
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="bg-primary/20 p-2 rounded-full">
              <Clock className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-300 font-semibold uppercase">ETA</p>
              <p className="text-white font-bold">3 mins</p>
            </div>
          </motion.div>

          {/* Floating Rating Card */}
          <motion.div 
            className="absolute bottom-20 left-0 z-20 premium-glass px-4 py-3 flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
            initial={{ y: 0 }}
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="bg-amber-500/20 p-2 rounded-full">
              <Star className="text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-300 font-semibold uppercase">Top Rated</p>
              <p className="text-white font-bold">4.9/5.0</p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
