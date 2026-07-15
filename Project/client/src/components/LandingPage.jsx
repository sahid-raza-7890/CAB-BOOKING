import React, { useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Award, Smartphone } from 'lucide-react';
import Hero from './Hero';
import Statistics from './Statistics';
import { useTranslation } from 'react-i18next';

// Lazy load the heavy map component
const InteractiveMapSection = React.lazy(() => import('./InteractiveMapSection'));

export default function LandingPage() {
  const { t } = useTranslation();
  const pageRef = useRef(null);

  // Implement the Cursor Glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (pageRef.current) {
        // Calculate percentages
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        pageRef.current.style.setProperty('--mouse-x', `${x}%`);
        pageRef.current.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Shield, title: "Enterprise Security", desc: "End-to-end encryption and geospatial validation protect every mile." },
    { icon: Zap, title: "Lightning Fast", desc: "Sub-second matchmaking algorithms get you moving instantly." },
    { icon: Award, title: "Premium Fleet", desc: "Curated vehicles ensuring a luxurious experience, every time." },
    { icon: Smartphone, title: "Seamless App", desc: "Award-winning interface designed for zero friction." }
  ];

  const categories = [
    { name: "Basic", price: "₹10", desc: "Affordable everyday rides", emoji: "🚗" },
    { name: "Premium", price: "₹25", desc: "Luxury sedans for business", emoji: "🚙" },
    { name: "SUV", price: "₹30", desc: "Extra space for groups", emoji: "🚐" },
    { name: "Electric", price: "₹15", desc: "Zero emissions transit", emoji: "⚡" }
  ];

  return (
    <div 
      ref={pageRef}
      className="relative min-h-screen bg-dark text-white font-sans overflow-x-hidden selection:bg-primary selection:text-white"
      style={{
        // The background radial gradient follows the mouse
        backgroundImage: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(34, 197, 94, 0.08) 0%, transparent 50%)`
      }}
    >
      <Hero />
      
      <Statistics />

      {/* Ride Categories Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">A Ride for Every Occasion</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From daily commutes to executive travel, select the tier that matches your exact needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="premium-glass group cursor-pointer p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                <p className="text-gray-400 text-sm mb-6">{cat.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</span>
                  <span className="text-2xl font-black text-primary">{cat.price}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Ucab Section */}
      <section className="py-24 relative z-10 bg-[#0b1121]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Ucab</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We've engineered the ultimate mobility platform from the ground up.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="text-primary" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Suspense wrapper for the Lazy Loaded Map */}
      <Suspense fallback={
        <div className="w-full h-[500px] flex items-center justify-center bg-dark/50">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-gray-400 font-semibold uppercase tracking-widest text-sm">Initializing Telemetry...</p>
          </div>
        </div>
      }>
        <InteractiveMapSection />
      </Suspense>

    </div>
  );
}
