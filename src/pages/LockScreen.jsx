import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Fingerprint, ShieldCheck } from 'lucide-react';
import { haptic } from '../utils/haptics';

const LockScreen = ({ onUnlock }) => {
  const [input, setInput] = useState([]);
  const MASTER_PIN = "1234"; // In a real app, hash this in localStorage

  const handleDotClick = (num) => {
    haptic.light();
    const newPath = [...input, num];
    setInput(newPath);

    if (newPath.length === 4) {
      if (newPath.join('') === MASTER_PIN) {
        onUnlock();
      } else {
        haptic.heavy();
        setInput([]); // Reset on failure
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center w-full max-w-xs"
      >
        <div className="w-16 h-16 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mb-6 shadow-xl border border-white/5">
          <ShieldCheck size={32} className="text-[var(--brand-color)]" />
        </div>
        
        <h2 className="text-xl font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-main)' }}>Secure Entry</h2>
        <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mb-12" style={{ color: 'var(--text-main)' }}>Enter Neural Pattern</p>

        {/* PIN/Pattern Dots Visualizer */}
        <div className="flex gap-4 mb-12">
          {[1, 2, 3, 4].map((_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${input.length > i ? 'bg-[var(--brand-color)] scale-125' : 'bg-[var(--bg-secondary)] border border-white/10'}`}
            />
          ))}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDotClick(num)}
              className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] border border-white/5 flex items-center justify-center text-xl font-black active:scale-90 active:bg-[var(--brand-color)] active:text-[var(--bg-primary)] transition-all"
              style={{ color: 'var(--text-main)' }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Biometric Trigger (Optional) */}
        <button 
          onClick={() => {
            haptic.medium();
            // Trigger native WebAuthn if available
            alert("Biometric auth triggered (FaceID/Fingerprint)");
          }}
          className="mt-12 p-4 opacity-40 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-main)' }}
        >
          <Fingerprint size={32} />
        </button>
      </motion.div>
    </div>
  );
};

export default LockScreen;