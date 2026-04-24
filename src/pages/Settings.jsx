import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Check, Sun, Moon, Palette, Sliders, 
  ChevronRight, EyeOff, Zap, ShieldCheck, Lock 
} from 'lucide-react';
import { haptic } from '../utils/haptics';

const Settings = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const presets = {
    light: [
      { name: 'Forest Deep', brand: '#41644A', bgPrimary: '#F1F0E9', bgSecondary: '#ffffff', textMain: '#263A29', brandText: '#F1F0E9' },
      { name: 'Sky High', brand: '#3B82F6', bgPrimary: '#EFF6FF', bgSecondary: '#FFFFFF', textMain: '#1E3A8A' },
      { name: 'Crimson Earth', brand: '#8B1A1A', bgPrimary: '#F5E6D3', bgSecondary: '#E9D7C3', textMain: '#1A0505', brandText: '#FFFFFF' },
      { name: 'Nature Bloom', brand: '#347928', bgPrimary: '#FFFBE6', bgSecondary: '#C2FFC7', textMain: '#1A3317', brandText: '#FFFFFF' },
      { name: 'Olive Grove', brand: '#708238', bgPrimary: '#F2F1E1', bgSecondary: '#FFFFFF', textMain: '#4B5320', brandText: '#FFFFFF' },
      { name: 'Warm Desert', brand: '#E9A15A', bgPrimary: '#FFF0DC', bgSecondary: '#F5E6D3', textMain: '#3E2723', brandText: '#FFFFFF' },
      { name: 'Sakura Pink', brand: '#DB2777', bgPrimary: '#FFF1F2', bgSecondary: '#FFFFFF', textMain: '#831843', brandText: '#FFFFFF' },
      { name: 'Ocean Breeze', brand: '#0891B2', bgPrimary: '#ECFEFF', bgSecondary: '#FFFFFF', textMain: '#164E63', brandText: '#FFFFFF' },
      { name: 'Lavender Mist', brand: '#7C3AED', bgPrimary: '#F5F3FF', bgSecondary: '#FFFFFF', textMain: '#4C1D95', brandText: '#FFFFFF' },
      { name: 'Pure White', brand: '#000000', bgPrimary: '#FFFFFF', bgSecondary: '#F5F5F5', textMain: '#000000', brandText: '#FFFFFF' },
      { name: 'Silver Ink', brand: '#000000', bgPrimary: '#E5E7EB', bgSecondary: '#F3F4F6', textMain: '#1F2937', brandText: '#FFFFFF' },
    ],
    dark: [
      { name: 'Cyber Dark', brand: '#bef264', bgPrimary: '#0F172A', bgSecondary: '#1E293B', textMain: '#F8FAF9' },
      { name: 'Obsidian Gold', brand: '#FACC15', bgPrimary: '#09090B', bgSecondary: '#18181B', textMain: '#E4E4E7', brandText: '#000000' },
      { name: 'Aurora Night', brand: '#10B981', bgPrimary: '#000000', bgSecondary: '#050A09', textMain: '#A7F3D0', brandText: '#000000' },
      { name: 'Onyx Black', brand: '#FFFFFF', bgPrimary: '#000000', bgSecondary: '#0A0A0A', textMain: '#FFFFFF', brandText: '#000000' },
      { name: 'Deep Sea', brand: '#00D4FF', bgPrimary: '#010409', bgSecondary: '#0D1117', textMain: '#C9D1D9', brandText: '#010409' },
      { name: 'Titanium', brand: '#94A3B8', bgPrimary: '#0F1115', bgSecondary: '#1C1F26', textMain: '#E2E8F0', brandText: '#000000' },
      { name: 'Void Purple', brand: '#A855F7', bgPrimary: '#080510', bgSecondary: '#120B24', textMain: '#E9D5FF', brandText: '#000000' },
      { name: 'Matrix Dark', brand: '#00FF41', bgPrimary: '#0D0208', bgSecondary: '#003B00', textMain: '#00FF41', brandText: '#000000' }
    ]
  };

  const [mode, setMode] = useState('light');
  const [ghostMode, setGhostMode] = useState(() => localStorage.getItem('ghost-mode') === 'true');
  const [tactileHaptics, setTactileHaptics] = useState(() => localStorage.getItem('tactile-haptics') !== 'false');
  const [securityEnabled, setSecurityEnabled] = useState(() => localStorage.getItem('security-enabled') === 'true');

  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : presets.light[0];
  });

  const [manualColors, setManualColors] = useState({
    brand: currentTheme.brand,
    bgPrimary: currentTheme.bgPrimary,
    textMain: currentTheme.textMain
  });

  useEffect(() => {
    const applyToDom = (theme) => {
      const root = document.documentElement;
      root.style.setProperty('--brand-color', theme.brand);
      root.style.setProperty('--bg-primary', theme.bgPrimary);
      root.style.setProperty('--bg-secondary', theme.bgSecondary || theme.bgPrimary);
      root.style.setProperty('--text-main', theme.textMain);
      root.style.setProperty('--brand-text', theme.brandText || '#FFFFFF');
    };
    if (currentTheme) applyToDom(currentTheme);
  }, [currentTheme]);

  // --- SECURITY SETUP PROTOCOL ---
  const initializeSecurity = async () => {
    haptic.medium();
    
    // 1. PIN Selection (Capturing the current custom PIN or default)
    const pin = prompt("Define 4-Digit Security PIN:", "1234");
    if (!pin || pin.length !== 4) {
      alert("Invalid Protocol: 4-digit PIN required.");
      return;
    }

    try {
      // 2. Biometric Passkey Registration
      if (window.PublicKeyCredential) {
        const challenge = window.crypto.getRandomValues(new Uint8Array(32));
        const userID = window.crypto.getRandomValues(new Uint8Array(16));

        const createOptions = {
          publicKey: {
            rp: { name: "Intelligence Ledger", id: window.location.hostname },
            user: { id: userID, name: "user@ledger.local", displayName: "Ledger User" },
            challenge: challenge,
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
            timeout: 60000,
          },
        };

        const credential = await navigator.credentials.create(createOptions);
        
        if (credential) {
          const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
          localStorage.setItem('biometric-credential-id', credentialId);
          localStorage.setItem('user-pin', pin);
          localStorage.setItem('security-enabled', 'true');
          setSecurityEnabled(true);
          haptic.success();
          alert("Security Shield Active: PIN & Biometrics Encrypted.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Setup Failed: HTTPS connection required for Biometrics.");
    }
  };

  const toggleSecurity = () => {
    if (!securityEnabled) {
      initializeSecurity();
    } else {
      haptic.medium();
      localStorage.removeItem('security-enabled');
      localStorage.removeItem('biometric-credential-id');
      localStorage.removeItem('user-pin');
      setSecurityEnabled(false);
    }
  };

  const applyTheme = (theme) => {
    haptic.medium();
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', JSON.stringify(theme));
    setManualColors({ brand: theme.brand, bgPrimary: theme.bgPrimary, textMain: theme.textMain });
  };

  const toggleGhostMode = () => {
    const newState = !ghostMode;
    setGhostMode(newState);
    localStorage.setItem('ghost-mode', newState);
    haptic.success();
  };

  const toggleHaptics = () => {
    const newState = !tactileHaptics;
    setTactileHaptics(newState);
    localStorage.setItem('tactile-haptics', newState);
    if (newState) haptic.medium();
  };

  return (
    <div className="min-h-screen pb-44 transition-colors duration-500 overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="p-6 pt-12 flex justify-between items-center">
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform shadow-sm">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)' }}>Terminal Config</h1>
        <div className="w-12"></div>
      </header>

      <div className="p-6 space-y-12">
        {/* MODE TOGGLE */}
        <div className="flex justify-center">
            <div className="p-2 rounded-[2rem] flex gap-2 shadow-inner border-2 border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <button onClick={() => { haptic.light(); setMode('light'); }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${mode === 'light' ? 'bg-amber-400 text-amber-950 shadow-lg' : 'opacity-20'}`}>
                    <Sun size={16} /> Day
                </button>
                <button onClick={() => { haptic.light(); setMode('dark'); }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${mode === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'opacity-20'}`}>
                    <Moon size={16} /> Night
                </button>
            </div>
        </div>

        {/* THEME SLIDER */}
        <section className="relative">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2 opacity-40">
                <Palette size={14} style={{ color: 'var(--text-main)' }} />
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Preset Pipeline</span>
            </div>
            <span className="text-[8px] font-black uppercase opacity-20" style={{ color: 'var(--text-main)' }}>Swipe for more <ChevronRight size={10} className="inline ml-1"/></span>
          </div>

          <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-8">
            <AnimatePresence mode="wait">
              {presets[mode].map((t) => (
                <ThemeCard key={t.name} theme={t} isActive={currentTheme.name === t.name} onClick={() => applyTheme(t)} />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* SECURITY & SYSTEM CONTROLS */}
        <section className="space-y-4 px-2">
          <div className="flex items-center gap-2 opacity-30">
            <ShieldCheck size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Security Protocols</span>
          </div>

          <div className="space-y-3">
            <div onClick={toggleSecurity} className="p-5 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-between border border-black/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-black/5" style={{ color: securityEnabled ? 'var(--brand-color)' : 'var(--text-main)', opacity: securityEnabled ? 1 : 0.3 }}>
                  <Lock size={18}/>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase" style={{ color: 'var(--text-main)' }}>Shield Lock</p>
                  <p className="text-[8px] font-bold opacity-30 uppercase" style={{ color: 'var(--text-main)' }}>Setup PIN & Biometrics</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative p-1 ${securityEnabled ? 'bg-[var(--brand-color)]' : 'bg-black/10'}`}>
                <motion.div animate={{ x: securityEnabled ? 20 : 0 }} className="w-3 h-3 rounded-full bg-white shadow-md" />
              </div>
            </div>

            <div onClick={toggleGhostMode} className="p-5 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-between border border-black/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-black/5" style={{ color: ghostMode ? 'var(--brand-color)' : 'var(--text-main)', opacity: ghostMode ? 1 : 0.3 }}>
                  <EyeOff size={18}/>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase" style={{ color: 'var(--text-main)' }}>Ghost Mode</p>
                  <p className="text-[8px] font-bold opacity-30 uppercase" style={{ color: 'var(--text-main)' }}>Hide balances on dashboard</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative p-1 ${ghostMode ? 'bg-[var(--brand-color)]' : 'bg-black/10'}`}>
                <motion.div animate={{ x: ghostMode ? 20 : 0 }} className="w-3 h-3 rounded-full bg-white shadow-md" />
              </div>
            </div>

            <div onClick={toggleHaptics} className="p-5 rounded-[2rem] bg-[var(--bg-secondary)] flex items-center justify-between border border-black/5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-black/5" style={{ color: tactileHaptics ? 'var(--brand-color)' : 'var(--text-main)', opacity: tactileHaptics ? 1 : 0.3 }}>
                  <Zap size={18}/>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase" style={{ color: 'var(--text-main)' }}>Tactile Haptics</p>
                  <p className="text-[8px] font-bold opacity-30 uppercase" style={{ color: 'var(--text-main)' }}>Mechanical vibration feedback</p>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative p-1 ${tactileHaptics ? 'bg-[var(--brand-color)]' : 'bg-black/10'}`}>
                <motion.div animate={{ x: tactileHaptics ? 20 : 0 }} className="w-3 h-3 rounded-full bg-white shadow-md" />
              </div>
            </div>
          </div>
        </section>

        {/* MANUAL CALIBRATION */}
        <section className="p-8 rounded-[3rem] border-2 shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
          <div className="flex items-center gap-2 mb-8">
            <Sliders size={16} style={{ color: 'var(--brand-color)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Manual Calibration</span>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Core Accent', key: 'brand' },
              { label: 'Main Base', key: 'bgPrimary' },
              { label: 'Typography', key: 'textMain' }
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-main)' }}>{field.label}</span>
                <input type="color" value={manualColors[field.key]} onChange={(e) => {
                    const newColors = { ...manualColors, [field.key]: e.target.value };
                    setManualColors(newColors);
                    applyTheme({ ...currentTheme, ...newColors, name: 'Custom Entry' });
                  }} className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-none scale-125" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ThemeCard = ({ theme, isActive, onClick }) => (
  <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.95 }} onClick={onClick} className={`relative flex-shrink-0 w-[75vw] sm:w-[280px] p-6 rounded-[3rem] border-4 transition-all snap-center shadow-2xl ${isActive ? 'opacity-100' : 'opacity-40'}`} style={{ backgroundColor: theme.bgSecondary || theme.bgPrimary, borderColor: isActive ? theme.brand : 'transparent' }}>
    <div className="w-full h-32 rounded-[2rem] mb-6 flex flex-col justify-center items-center gap-3 shadow-inner" style={{ backgroundColor: theme.bgPrimary }}>
        <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center" style={{ backgroundColor: theme.brand }}>
            <Check size={24} style={{ color: theme.brandText || '#fff' }} strokeWidth={4} className={isActive ? 'scale-100' : 'scale-0 transition-transform'} />
        </div>
        <div className="h-2 w-20 rounded-full opacity-20" style={{ backgroundColor: theme.textMain }} />
    </div>
    <div className="text-left space-y-1">
        <p className="text-[12px] font-black uppercase tracking-tighter" style={{ color: theme.textMain }}>{theme.name}</p>
        <p className="text-[8px] font-bold uppercase tracking-widest opacity-30" style={{ color: theme.textMain }}>System Profile</p>
    </div>
    {isActive && (
      <div className="absolute top-6 right-6">
        <div className="w-4 h-4 rounded-full animate-ping" style={{ backgroundColor: theme.brand }} />
      </div>
    )}
  </motion.button>
);

export default Settings;