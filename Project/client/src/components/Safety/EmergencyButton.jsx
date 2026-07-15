import React from 'react';
import { motion } from 'framer-motion';

export default function EmergencyButton({ disabled, onClick }) {
    return (
        <motion.button 
            className="btn-sos"
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
            SOS
        </motion.button>
    );
}
