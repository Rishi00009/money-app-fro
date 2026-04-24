import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import { haptic } from '../utils/haptics';

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const MASTER_PIN = "1234"; // Set your desired 4-digit PIN here

  const handleInput = (num) => {
    if (pin.length >= 4) return;
    
    const newPin = pin + num;
    setPin(newPin);
    haptic.light();

    if (newPin.length === 4) {
      if (newPin === MASTER_PIN) {
        setTimeout(() => onUnlock(), 300);
      } else {
        haptic.heavy();
        // Shake animation trigger can go here
        setTimeout(() => setPin(""), 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-black" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
          <ShieldCheck size={40} className="text-[var(--brand-color)]" />
        </div>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ color: 'var(--text-main)' }}>Security Shield</h2>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.3em] mb-12" style={{ color: 'var(--text-main)' }}>Protocol Required</p>

        {/* PIN INDICATORS */}
        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              animate={{ 
                scale: pin.length > i ? 1.2 : 1,
                backgroundColor: pin.length > i ? 'var(--brand-color)' : 'rgba(255,255,255,0.1)'
              }}
              className="w-4 h-4 rounded-full border border-white/5"
            />
          ))}
        </div>

        {/* NUMPAD */}
        <div className="grid grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((btn, i) => (
            <button
              key={i}
              onClick={() => btn !== "" && btn !== "back" ? handleInput(btn) : btn === "back" ? setPin(pin.slice(0, -1)) : null}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black transition-all active:scale-90 
                ${btn === "" ? "opacity-0 pointer-events-none" : "bg-[var(--bg-secondary)] border border-white/5 shadow-lg"}`}
              style={{ color: 'var(--text-main)' }}
            >
              {btn === "back" ? "←" : btn}
            </button>
          ))}
        </div>

        <button className="mt-12 opacity-20 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-main)' }}>
          <Fingerprint size={40} />
        </button>
      </motion.div>
    </div>
  );
};

export default LockScreen;