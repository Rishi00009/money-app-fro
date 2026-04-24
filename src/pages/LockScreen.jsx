import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Fingerprint } from 'lucide-react';
import { haptic } from '../utils/haptics';

const LockScreen = ({ onUnlock }) => {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  
  // Fallback to default if localStorage fails or is empty
  const getSavedPin = () => {
    try {
      return localStorage.getItem('user-pin') || "1234";
    } catch (e) {
      return "1234";
    }
  };

  const handleInput = (num) => {
    if (pin.length >= 4 || isError) return;
    
    const newPin = pin + num;
    setPin(newPin);
    if (haptic?.light) haptic.light();

    if (newPin.length === 4) {
      if (newPin === getSavedPin()) {
        if (haptic?.success) haptic.success();
        setTimeout(() => onUnlock(), 300);
      } else {
        if (haptic?.heavy) haptic.heavy();
        setIsError(true);
        setTimeout(() => {
          setPin("");
          setIsError(false);
        }, 500);
      }
    }
  };

  const handleBiometricAuth = async () => {
    if (haptic?.medium) haptic.medium();

    // Check for Credential support safely
    if (!window.PublicKeyCredential || !navigator.credentials) {
      alert("Biometrics not supported on this browser.");
      return;
    }

    const savedBioId = localStorage.getItem('biometric-credential-id');
    if (!savedBioId) {
      alert("Setup biometrics in Settings first.");
      return;
    }

    try {
      const rawId = Uint8Array.from(atob(savedBioId), c => c.charCodeAt(0));
      const challenge = new Uint8Array(32);
      if (window.crypto) window.crypto.getRandomValues(challenge);

      const authOptions = {
        publicKey: {
          challenge: challenge,
          allowCredentials: [{ id: rawId, type: 'public-key' }],
          userVerification: "required",
          timeout: 60000,
        }
      };

      const assertion = await navigator.credentials.get(authOptions);

      if (assertion) {
        if (haptic?.success) haptic.success();
        onUnlock();
      }
    } catch (err) {
      console.error(err);
      if (haptic?.heavy) haptic.heavy();
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 bg-black" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xs flex flex-col items-center"
      >
        <motion.div 
          animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-center mb-8 border border-white/5 shadow-2xl"
        >
          <ShieldCheck size={40} className={isError ? "text-rose-500" : "text-[var(--brand-color)]"} />
        </motion.div>

        <h2 className="text-2xl font-black uppercase tracking-tighter mb-12" style={{ color: 'var(--text-main)' }}>
          {isError ? "Denied" : "Security Shield"}
        </h2>

        <div className="flex gap-6 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-4 h-4 rounded-full border border-white/10 transition-all duration-200"
              style={{ backgroundColor: pin.length > i ? 'var(--brand-color)' : 'transparent', transform: pin.length > i ? 'scale(1.2)' : 'scale(1)' }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((btn, i) => (
            <button
              key={i}
              onClick={() => {
                if (btn === "back") setPin(pin.slice(0, -1));
                else if (btn !== "") handleInput(btn);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black transition-all active:scale-90 
                ${btn === "" ? "opacity-0 pointer-events-none" : "bg-[var(--bg-secondary)] border border-white/5 shadow-lg"}`}
              style={{ color: 'var(--text-main)' }}
            >
              {btn === "back" ? "←" : btn}
            </button>
          ))}
        </div>

        {localStorage.getItem('biometric-credential-id') && (
          <button 
            onClick={handleBiometricAuth}
            className="p-4 rounded-full bg-[var(--bg-secondary)] border border-white/5 shadow-xl"
            style={{ color: 'var(--brand-color)' }}
          >
            <Fingerprint size={40} />
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default LockScreen;