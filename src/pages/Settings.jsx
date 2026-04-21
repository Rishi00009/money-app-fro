import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Palette, Moon, Smartphone, Check, RotateCcw, Zap, UserCircle 
} from 'lucide-react';
import { haptic } from '../utils/haptics';

const Settings = () => {
  const navigate = useNavigate();
  
  const [customColor, setCustomColor] = useState(() => {
    return localStorage.getItem('brand-color') || '#bef264';
  });

  // Load haptic preference
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    return localStorage.getItem('haptic-enabled') !== 'false';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', customColor);
    document.documentElement.style.setProperty('--brand-shadow', `${customColor}33`);
    localStorage.setItem('brand-color', customColor);
  }, [customColor]);

  const updateTheme = (color) => {
    haptic.light();
    setCustomColor(color);
  };

  const handleHapticToggle = (val) => {
    setHapticsEnabled(val);
    localStorage.setItem('haptic-enabled', val);
    if (val) haptic.medium(); // Feedback for enabling
  };

  const presets = [
    { name: 'Lime Neon', color: '#bef264' },
    { name: 'Sky Blue', color: '#60a5fa' },
    { name: 'Sunset Pink', color: '#fb7185' },
    { name: 'Royal Gold', color: '#facc15' },
    { name: 'Cyber Purple', color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen pb-12 select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <header className="p-6 pt-12 flex justify-between items-center">
        <button 
          onClick={() => { haptic.light(); navigate('/home'); }} 
          className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-lg font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Settings</h1>
        <div className="w-10"></div>
      </header>

      <section className="px-6 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-black/[0.03] text-[var(--brand-color)]">
            <Palette size={20} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-main)' }}>Appearance</h2>
        </div>

        <div className="p-6 rounded-[2.5rem] border border-black/[0.03] mb-6 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-[10px] font-black mb-4 opacity-30 uppercase tracking-[0.2em]" style={{ color: 'var(--text-main)' }}>Quick Presets</p>
          <div className="flex flex-wrap gap-4">
            {presets.map((p) => (
              <button 
                key={p.name}
                onClick={() => updateTheme(p.color)}
                className="w-12 h-12 rounded-2xl border-2 transition-all active:scale-90 flex items-center justify-center"
                style={{ 
                  backgroundColor: p.color, 
                  borderColor: customColor === p.color ? 'var(--text-main)' : 'transparent' 
                }}
              >
                {customColor === p.color && <Check size={20} className="text-black" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-8 space-y-4">
        <SettingToggle icon={<Moon size={20}/>} label="Dark Mode" enabled={false} />
        <SettingToggle 
          icon={<Smartphone size={20}/>} 
          label="Haptic Feedback" 
          enabled={hapticsEnabled} 
          onToggle={handleHapticToggle}
        />
      </section>

      <section className="px-6 mt-12">
         <button 
          onClick={() => { haptic.light(); navigate('/profile'); }}
          className="w-full p-6 border border-black/[0.03] rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-sm"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
         >
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--brand-color)] rounded-2xl text-[var(--brand-text)]">
                <UserCircle size={24} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Account Identity</p>
              </div>
           </div>
           <ArrowLeft className="rotate-180 opacity-20 group-hover:translate-x-1 transition-transform" size={20} style={{ color: 'var(--text-main)' }} />
         </button>
      </section>
    </div>
  );
};

const SettingToggle = ({ icon, label, enabled = false, onToggle }) => {
  const [isOn, setIsOn] = useState(enabled);
  
  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) onToggle(newState);
    else haptic.light(); // Default feedback if no custom handler
  };

  return (
    <div 
      onClick={handleToggle}
      className="flex items-center justify-between p-5 rounded-[2rem] border border-black/[0.03] cursor-pointer active:scale-[0.98] transition-all shadow-sm"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-xl bg-black/[0.03] text-slate-400">{icon}</div>
        <span className="font-black text-xs uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>{label}</span>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isOn ? 'bg-[var(--brand-color)]' : 'bg-slate-200'}`}>
        <motion.div 
          animate={{ x: isOn ? 24 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" 
        />
      </div>
    </div>
  );
};

export default Settings;