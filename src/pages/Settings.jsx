import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Palette, Smartphone, Check, 
  UserCircle, Pipette, RefreshCw, ChevronRight 
} from 'lucide-react';
import { haptic } from '../utils/haptics';

const Settings = () => {
  const navigate = useNavigate();
  
  // --- Theme State ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('user-theme');
    return saved ? JSON.parse(saved) : {
      name: 'Rishi Light',
      brand: '#bef264',
      bgPrimary: '#F8F9FA',
      bgSecondary: '#FFFFFF',
      textMain: '#0f172a'
    };
  });

  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    return localStorage.getItem('haptic-enabled') !== 'false';
  });

  // --- Apply Theme to CSS Variables ---
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-color', theme.brand);
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--text-main', theme.textMain);
    
    localStorage.setItem('user-theme', JSON.stringify(theme));
  }, [theme]);

  const updateColor = (key, val) => {
    setTheme(prev => ({ ...prev, [key]: val, name: 'Custom' }));
  };

  // --- New Color Palettes ---
  const presets = [
    { name: 'Mint Fresh', brand: '#A7F3D0', bgPrimary: '#F0FDF4', bgSecondary: '#FFFFFF', textMain: '#064E3B' },
    { name: 'Sky High', brand: '#3B82F6', bgPrimary: '#EFF6FF', bgSecondary: '#FFFFFF', textMain: '#1E3A8A' },
    { name: 'Forest Deep', brand: '#03563b', bgPrimary: '#d7ebe6', bgSecondary: '#24765edf', textMain: '#ECFDF5' },
    { name: 'Desert Sun', brand: '#F97316', bgPrimary: '#FFF7ED', bgSecondary: '#FFFFFF', textMain: '#7C2D12' },
    { name: 'Royal Gold', brand: '#FACC15', bgPrimary: '#FEFCE8', bgSecondary: '#FFFFFF', textMain: '#713F12' },
    { name: 'Cyber Dark', brand: '#bef264', bgPrimary: '#0F172A', bgSecondary: '#1E293B', textMain: '#F8FAF9' }
  ];

  return (
    <div className="min-h-screen pb-20 select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <button 
          onClick={() => { haptic.light(); navigate('/home'); }} 
          className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)' }}>Terminal Config</h1>
        <button onClick={() => setTheme(presets[0])} className="p-3 opacity-20 hover:opacity-100">
          <RefreshCw size={18} style={{ color: 'var(--text-main)' }} />
        </button>
      </header>

      {/* New Presets Section */}
      <section className="px-6 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <Palette size={18} className="text-[var(--brand-color)]" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-main)' }}>Master Palettes</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {presets.map((p) => (
            <button 
              key={p.name}
              onClick={() => { haptic.medium(); setTheme(p); }}
              className="flex-shrink-0 w-28 p-4 rounded-[2.5rem] border-2 transition-all active:scale-95 shadow-sm"
              style={{ 
                backgroundColor: p.bgSecondary,
                borderColor: theme.name === p.name ? 'var(--brand-color)' : 'transparent'
              }}
            >
              <div className="flex flex-col gap-1 mb-3">
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: p.brand }} />
                <div className="w-full h-2 rounded-full opacity-20" style={{ backgroundColor: p.textMain }} />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-center" style={{ color: p.textMain }}>{p.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Manual Palette Controls */}
      <section className="px-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Pipette size={18} className="text-[var(--brand-color)]" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-main)' }}>Manual Overrides</h2>
        </div>

        <div className="space-y-3">
          <ColorInput label="Primary Brand" value={theme.brand} onChange={(v) => updateColor('brand', v)} />
          <ColorInput label="Background" value={theme.bgPrimary} onChange={(v) => updateColor('bgPrimary', v)} />
          <ColorInput label="Surface / Card" value={theme.bgSecondary} onChange={(v) => updateColor('bgSecondary', v)} />
          <ColorInput label="Typography" value={theme.textMain} onChange={(v) => updateColor('textMain', v)} />
        </div>
      </section>

      {/* System Preferences */}
      <section className="px-6 mt-10">
        <div 
          onClick={() => {
            const newState = !hapticsEnabled;
            setHapticsEnabled(newState);
            localStorage.setItem('haptic-enabled', newState);
            if (newState) haptic.medium();
          }}
          className="flex items-center justify-between p-5 rounded-[2rem] border border-black/[0.03] shadow-sm bg-white"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-4">
            <Smartphone size={20} className="opacity-40" style={{ color: 'var(--text-main)' }} />
            <span className="font-black text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Haptic Feedback</span>
          </div>
          <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${hapticsEnabled ? 'bg-[var(--brand-color)]' : 'bg-slate-200'}`}>
            <motion.div 
              animate={{ x: hapticsEnabled ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" 
            />
          </div>
        </div>
      </section>

      {/* Account Navigation */}
      <section className="px-6 mt-6">
         <button 
          onClick={() => { haptic.light(); navigate('/profile'); }}
          className="w-full p-6 border border-black/[0.03] rounded-[2.5rem] flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
         >
           <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--brand-color)] rounded-2xl">
                <UserCircle size={24} className="text-black" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>Security & Profile</p>
              </div>
           </div>
           <ChevronRight size={20} className="opacity-20" style={{ color: 'var(--text-main)' }} />
         </button>
      </section>
    </div>
  );
};

// --- Custom Components ---

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-5 rounded-[2rem] border border-black/[0.03] bg-white shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
    <div className="flex flex-col">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30 mb-1" style={{ color: 'var(--text-main)' }}>{label}</span>
      <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--text-main)' }}>{value}</span>
    </div>
    <div className="relative w-12 h-12 rounded-2xl shadow-inner overflow-hidden border-2 border-black/[0.05]">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => { haptic.light(); onChange(e.target.value); }}
        className="absolute inset-0 w-[200%] h-[200%] -top-1/2 -left-1/2 cursor-pointer"
      />
    </div>
  </div>
);

export default Settings;