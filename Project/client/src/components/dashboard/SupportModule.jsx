import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VisualFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    
    const faqs = [
        { q: "Where is my ride?", a: "Your driver is currently 3 minutes away on 5th Avenue." },
        { q: "How do I report a fare dispute?", a: "Click on 'Trip Details' in your ride history and select 'Dispute Fare'. Our team will review it within 24 hours." },
        { q: "Can I add a stop during my trip?", a: "Yes, you can add up to 3 stops using the '+' icon in the active trip view." }
    ];

    return (
        <div className="mt-4 flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-gray-300 mb-2 px-1">Frequent Questions</h4>
            {faqs.map((faq, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button 
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full text-left p-3 text-sm font-medium hover:bg-white/10 transition-colors flex justify-between items-center"
                    >
                        {faq.q}
                        <span className="text-[#FFD700]">{openIndex === idx ? '−' : '+'}</span>
                    </button>
                    <AnimatePresence>
                        {openIndex === idx && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-3 pb-3 text-xs text-gray-400"
                            >
                                {faq.a}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

const ChatbotBubble = ({ onToggle }) => (
    <button 
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-110 transition-transform flex items-center justify-center z-50"
    >
        <span className="text-2xl">💬</span>
    </button>
);

const SupportModule = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <ChatbotBubble onToggle={() => setIsOpen(!isOpen)} />
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-80 premium-glass bg-[#050505]/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        <div className="bg-[#FFD700] p-4 flex justify-between items-center">
                            <span className="font-bold text-black">Ucab AI Assistant</span>
                            <button onClick={() => setIsOpen(false)} className="text-black hover:text-gray-800">✕</button>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm w-[85%] mb-4 border border-white/5">
                                Hello! I'm your AI co-pilot. How can I assist you with your journey today?
                            </div>
                            
                            <VisualFAQ />
                        </div>
                        
                        <div className="p-3 border-t border-white/10 bg-black/20 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Type a message..." 
                                className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FFD700]"
                            />
                            <button className="bg-[#FFD700] p-2 rounded-xl text-black font-bold transition-all hover:bg-[#E6C200]">
                                ➔
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SupportModule;
