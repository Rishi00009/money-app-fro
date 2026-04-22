import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sun, Moon, Palette, Sliders, Pipette } from 'lucide-react';
import { haptic } from '../utils/haptics';

const Settings = () => {
  const navigate = useNavigate();

  const presets = [
    // --- Originals ---
    { name: 'Forest Deep', brand: '#41644A', bgPrimary: '#F1F0E9', bgSecondary: '#ffffff', textMain: '#263A29', brandText: '#F1F0E9' },
    { name: 'Sky High', brand: '#3B82F6', bgPrimary: '#EFF6FF', bgSecondary: '#FFFFFF', textMain: '#1E3A8A' },
    
    // --- New Palettes from Images (Nature & Earth) ---
    { name: 'Crimson Earth', brand: '#8B1A1A', bgPrimary: '#F5E6D3', bgSecondary: '#E9D7C3', textMain: '#1A0505', brandText: '#FFFFFF' }, // Based on #8B1A1A
    { name: 'Nature Bloom', brand: '#347928', bgPrimary: '#FFFBE6', bgSecondary: '#C2FFC7', textMain: '#1A3317', brandText: '#FFFFFF' }, // Based on #347928 & #C2FFC7
    { name: 'Olive Grove', brand: '#708238', bgPrimary: '#F2F1E1', bgSecondary: '#FFFFFF', textMain: '#4B5320', brandText: '#FFFFFF' }, // Based on Olive Image
    { name: 'Warm Desert', brand: '#E9A15A', bgPrimary: '#FFF0DC', bgSecondary: '#F5E6D3', textMain: '#3E2723', brandText: '#FFFFFF' }, // Based on #FFF0DC
    
    // --- Monochrome & Monochrome Dark ---
    { name: 'Pure White', brand: '#000000', bgPrimary: '#FFFFFF', bgSecondary: '#F5F5F5', textMain: '#000000', brandText: '#FFFFFF' },
    { name: 'Onyx Black', brand: '#FFFFFF', bgPrimary: '#000000', bgSecondary: '#0A0A0A', textMain: '#FFFFFF', brandText: '#000000' },
    { name: 'Silver Ink', brand: '#000000', bgPrimary: '#E5E7EB', bgSecondary: '#F3F4F6', textMain: '#1F2937', brandText: '#FFFFFF' },
    
    // --- Apt Dark Modes ---
    { name: 'Cyber Dark', brand: '#bef264', bgPrimary: '#0F172A', bgSecondary: '#1E293B', textMain: '#F8FAF9' },
    { name: 'Obsidian Gold', brand: '#FACC15', bgPrimary: '#09090B', bgSecondary: '#18181B', textMain: '#E4E4E7', brandText: '#000000' },
    { name: 'Blood Moon', brand: '#FF4D4D', bgPrimary: '#000000', bgSecondary: '#0D0202', textMain: '#FFB3B3', brandText: '#000000' }
  ];

  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : presets[0];
  });

  const [manualColors, setManualColors] = useState({
    brand: currentTheme.brand,
    bgPrimary: currentTheme.bgPrimary,
    textMain: currentTheme.textMain
  });

  const applyTheme = (theme) => {
    haptic.medium();
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', JSON.stringify(theme));

    const root = document.documentElement;
    root.style.setProperty('--brand-color', theme.brand);
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary || theme.bgPrimary);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--brand-text', theme.brandText || '#FFFFFF');
    
    setManualColors({
      brand: theme.brand,
      bgPrimary: theme.bgPrimary,
      textMain: theme.textMain
    });
  };

  const handleManualChange = (key, val) => {
    const newColors = { ...manualColors, [key]: val };
    setManualColors(newColors);
    
    const customTheme = {
      name: 'Custom Terminal',
      brand: newColors.brand,
      bgPrimary: newColors.bgPrimary,
      bgSecondary: newColors.bgPrimary,
      textMain: newColors.textMain,
      brandText: '#FFFFFF'
    };
    
    applyTheme(customTheme);
  };

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500 select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      <header className="p-6 pt-12 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Visual Terminal</h1>
        <div className="w-12"></div>
      </header>

      <div className="p-6 space-y-10">
        
        {/* MANUAL OVERRIDE */}
        <section className="p-6 rounded-[2.5rem] border-2 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
          <div className="flex items-center gap-2 mb-6 opacity-40">
            <Sliders size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Manual Override</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Primary Accent', key: 'brand' },
              { label: 'Base Canvas', key: 'bgPrimary' },
              { label: 'Text / Ink', key: 'textMain' }
            ].map((field) => (
              <div key={field.key} className="flex items-center justify-between p-3 rounded-2xl bg-black/5">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: 'var(--text-main)' }}>{field.label}</span>
                <input 
                  type="color" 
                  value={manualColors[field.key]} 
                  onChange={(e) => handleManualChange(field.key, e.target.value)}
                  className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVE PREVIEW */}
        <section className="p-8 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--brand-color)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--brand-color)' }}>
                <Check size={32} style={{ color: 'var(--brand-text)' }} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: 'var(--text-main)' }}>{currentTheme.name}</h2>
        </section>

        {/* PRESETS GRID */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 opacity-30 px-2">
            <Palette size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>System Presets</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {presets.map((t) => (
              <ThemeCard 
                key={t.name} 
                theme={t} 
                isActive={currentTheme.name === t.name} 
                onClick={() => applyTheme(t)} 
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const ThemeCard = ({ theme, isActive, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative p-4 rounded-[2.2rem] border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${isActive ? 'scale-105' : 'opacity-70'}`}
    style={{ 
      backgroundColor: theme.bgSecondary || theme.bgPrimary, 
      borderColor: isActive ? theme.brand : 'transparent' 
    }}
  >
    <div className="w-full h-12 rounded-2xl flex items-center justify-around overflow-hidden border border-black/5" style={{ backgroundColor: theme.bgPrimary }}>
      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.brand }} />
      <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: theme.textMain, opacity: 0.2 }} />
    </div>
    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: theme.textMain }}>{theme.name}</span>
    {isActive && (
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.brand }}>
        <Check size={12} style={{ color: theme.brandText || '#fff' }} strokeWidth={4} />
      </div>
    )}
  </motion.button>
);

export default Settings;