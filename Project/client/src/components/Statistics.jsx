import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Users, Car, Map, ShieldCheck } from 'lucide-react';

const StatCard = ({ icon: Icon, end, label, suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const incrementTime = 20;
    const totalSteps = duration / incrementTime;
    const increment = end / totalSteps;
    
    let timer;
    if (inView) {
      timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, incrementTime);
    }

    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition-colors"
    >
      <div className="p-4 bg-primary/20 rounded-full mb-4">
        <Icon className="text-primary" size={32} />
      </div>
      <h3 className="text-4xl font-extrabold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </h3>
      <p className="text-gray-400 font-medium tracking-wide uppercase text-sm text-center">
        {label}
      </p>
    </motion.div>
  );
};

export default function Statistics() {
  return (
    <section className="py-24 relative overflow-hidden bg-dark">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Numbers that matter</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We are rapidly expanding our global footprint to provide the most reliable transit network.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} end={2500000} label="Active Users" />
          <StatCard icon={Car} end={150000} label="Verified Drivers" />
          <StatCard icon={Map} end={420} label="Cities Covered" />
          <StatCard icon={ShieldCheck} end={99} suffix="%" label="Safety Score" />
        </div>
      </div>
    </section>
  );
}
