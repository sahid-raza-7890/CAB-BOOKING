import React from 'react';
import { motion } from 'framer-motion';

const BadgeComponent = ({ badges }) => {
    return (
        <div className="premium-glass p-6 rounded-2xl mt-6">
            <h3 className="text-xl font-bold mb-4">Your Badges</h3>
            <div className="flex flex-wrap gap-4">
                {badges.length === 0 ? (
                    <p className="text-gray-400 text-sm">No badges unlocked yet. Keep riding!</p>
                ) : (
                    badges.map((badge, index) => (
                        <motion.div 
                            key={badge.id}
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.15, type: "spring", stiffness: 100 }}
                            className="flex flex-col items-center justify-center bg-[#121212] border border-white/5 rounded-xl p-3 w-24 h-24 text-center group cursor-pointer hover:border-[#FFD700]/50 transition-colors shadow-lg"
                            title={badge.description}
                        >
                            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</span>
                            <span className="text-xs font-semibold text-gray-300">{badge.name}</span>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};
export default BadgeComponent;
