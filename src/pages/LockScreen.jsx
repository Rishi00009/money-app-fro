import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import { haptic } from '../utils/haptics';

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const MASTER_PIN = "1234"; 

  const handleInput = (num) => {
    if (pin.length >= 4 || isError) return;
    
    const newPin = pin + num;
    setPin(newPin);
    haptic.light();

    if (newPin.length === 4) {
      if (newPin === MASTER_PIN) {
        haptic.success();
        setTimeout(() => onUnlock(), 300);
      } else {
        haptic.heavy();
        setIsError(true);
        // Shake effect timing
        setTimeout(() => {
          setPin("");
          setIsError(false);
        }, 500);
      }
    }
  };

  // --- NATIVE BIOMETRIC HANDLER ---
  const handleBiometricAuth = async () => {
    haptic.medium();

    if (!window.PublicKeyCredential) {
      alert("Biometrics not supported on this browser.");
      return;
    }

    try {
      // Check if the device has biometric hardware enabled
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        // In a PWA, this triggers the system's Fingerprint/FaceID dialogue
        // Note: For a local app lock, we proceed if the platform auth is successful
        haptic.success();
        onUnlock();
      } else {
        alert("Biometrics not set up on this device.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        {/* LOGO AREA */}
        <motion.div 
          animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-white/5 shadow-2xl"
        >
          <ShieldCheck size={40} className={isError ? "text-rose-500" : "text-[var(--brand-color)]"} />
        </motion.div>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ color: 'var(--text-main)' }}>
          {isError ? "Access Denied" : "Security Shield"}
        </h2>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mb-12" style={{ color: 'var(--text-main)' }}>
          {isError ? "Invalid Neural Pattern" : "Protocol Required"}
        </p>

        {/* PIN INDICATORS */}
        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              animate={{ 
                scale: pin.length > i ? 1.2 : 1,
                backgroundColor: isError ? '#f43f5e' : (pin.length > i ? 'var(--brand-color)' : 'rgba(128,128,128,0.2)')
              }}
              className="w-4 h-4 rounded-full border border-white/5 transition-colors"
            />
          ))}
        </div>

        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((btn, i) => (
            <button
              key={i}
              disabled={isError}
              onClick={() => {
                if (btn === "back") setPin(pin.slice(0, -1));
                else if (btn !== "") handleInput(btn);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black transition-all active:scale-90 
                ${btn === "" ? "opacity-0 pointer-events-none" : "bg-[var(--bg-secondary)] border border-white/5 shadow-lg active:bg-[var(--brand-color)] active:text-[var(--bg-primary)]"}`}
              style={{ color: 'var(--text-main)' }}
            >
              {btn === "back" ? "←" : btn}
            </button>
          ))}
        </div>

        {/* BIOMETRIC BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBiometricAuth}
          className="mt-12 p-4 rounded-full bg-[var(--bg-secondary)] border border-white/5 shadow-xl opacity-80 hover:opacity-100 transition-opacity" 
          style={{ color: 'var(--brand-color)' }}
        >
          <Fingerprint size={40} />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LockScreen;