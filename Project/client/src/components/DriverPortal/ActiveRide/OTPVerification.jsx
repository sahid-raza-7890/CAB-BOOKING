import React, { useState, useRef } from 'react';
import { useDriver } from '../DriverContext';

const OTPVerification = ({ onVerified }) => {
    const { verifyOTP, activeRide } = useDriver();
    const [otp, setOtp] = useState(['', '', '', '']);
    const testOtp = activeRide?.otp || '1234';
    const [error, setError] = useState('');
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    const handleChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        } else if (value && index === 3) {
            // Auto submit when 4 digits are entered
            const fullOtp = newOtp.join('');
            if (fullOtp.length === 4) {
                handleVerify(fullOtp);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleVerify = async (fullOtp) => {
        try {
            await verifyOTP(fullOtp);
            if (onVerified) onVerified();
        } catch (err) {
            setError('Invalid OTP. Please try again.');
            setOtp(['', '', '', '']);
            inputRefs[0].current.focus();
        }
    };

    return (
        <div className="otp-container">
            <h3 className="otp-title">Enter Passenger OTP</h3>
            <p className="otp-subtitle">Ask the passenger for their 4-digit pin</p>
            <div style={{ textAlign: 'center', color: '#ffb900', fontWeight: 'bold', letterSpacing: 4, fontSize: 18, marginBottom: 16 }}>
                Test OTP: {testOtp}
            </div>
            
            <div className="otp-inputs">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={inputRefs[index]}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="otp-input"
                    />
                ))}
            </div>
            
            {error && <p style={{ color: '#ff4444', margin: 0, fontSize: '14px' }}>{error}</p>}
            
            <button 
                className="ride-btn primary" 
                onClick={() => handleVerify(otp.join(''))}
                disabled={otp.join('').length !== 4}
                style={{ width: '100%' }}
            >
                Verify
            </button>
        </div>
    );
};

export default OTPVerification;
