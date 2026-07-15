import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import driverReferral from '../../assets/driver_referral.png';

const ads = [
  { id: 1, title: 'Refer a Friend', description: 'Earn ₹51 in credits for every successful referral.', link: '/referrals' },
  { id: 2, title: 'Ucab Premium', description: 'Upgrade your commute with top-tier luxury sedans.', link: '/premium' },
  { id: 3, title: 'Eco Friendly', description: 'Choose our green EV fleet and reduce carbon footprint.', link: '/eco' },
  { id: 4, title: 'Airport Special', description: 'Enjoy flat rates on airport transfers with tracking.', link: '/airport' },
  { id: 5, title: 'Safety First', description: 'Dual-dashcam vehicles with 24/7 active SOS tracking.', link: '/safety' },
];

const AdBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);

  const handleDragEnd = (e, { offset }) => {
    const swipe = offset.x;
    if (swipe < -50) {
      handleNext();
    } else if (swipe > 50) {
      handlePrev();
    }
  };

  return (
    <div className="premium-glass relative w-full overflow-hidden rounded-3xl h-48 group select-none">
      
      {/* Background Graphic and Fading Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800" />
      
      {/* Right Side Image with Blend Overlay */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] md:w-[35%] overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent z-10" />
        <img 
          src={driverReferral} 
          alt="Driver Promo" 
          className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 opacity-90"
        />
      </div>

      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 w-[60%] md:w-[70%] h-full py-8 px-10 flex flex-col justify-center z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            {ads[currentIndex].title}
          </h2>
          <p className="text-sm text-gray-300 mb-3 line-clamp-2 max-w-sm">
            {ads[currentIndex].description}
          </p>
          <a 
            href={ads[currentIndex].link} 
            className="text-[#FFD700] text-sm font-bold w-max hover:underline cursor-pointer flex items-center gap-1 group/btn"
            onClick={(e) => e.preventDefault()}
          >
            Learn More <span className="group-hover/btn:translate-x-1 transition-transform">➔</span>
          </a>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFD700] hover:text-black z-20 cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFD700] hover:text-black z-20 cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-10 flex gap-1.5 z-20">
        {ads.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'bg-[#FFD700] w-5' : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
