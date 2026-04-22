import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sun, Moon, Palette } from 'lucide-react';
import { haptic } from '../utils/haptics';

const Settings = () => {
  const navigate = useNavigate();

  // Monochrome Presets
  const presets = {
    light: [
      { name: 'Pure White', brand: '#000000', bgPrimary: '#FFFFFF', bgSecondary: '#F5F5F5', textMain: '#000000', brandText: '#FFFFFF' },
      { name: 'Soft Gray', brand: '#4B5563', bgPrimary: '#F9FAFB', bgSecondary: '#FFFFFF', textMain: '#111827', brandText: '#FFFFFF' },
      { name: 'Silver Ink', brand: '#000000', bgPrimary: '#E5E7EB', bgSecondary: '#F3F4F6', textMain: '#1F2937', brandText: '#FFFFFF' }
    ],
    dark: [
      { name: 'Onyx Black', brand: '#FFFFFF', bgPrimary: '#000000', bgSecondary: '#0A0A0A', textMain: '#FFFFFF', brandText: '#000000' },
      { name: 'Midnight', brand: '#F3F4F6', bgPrimary: '#18181B', bgSecondary: '#27272A', textMain: '#FAFAFA', brandText: '#18181B' },
      { name: 'Charcoal', brand: '#9CA3AF', bgPrimary: '#111827', bgSecondary: '#1F2937', textMain: '#F9FAFB', brandText: '#111827' },
      { name: 'Obsidian', brand: '#FFFFFF', bgPrimary: '#09090B', bgSecondary: '#18181B', textMain: '#E4E4E7', brandText: '#09090B' }
    ]
  };

  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved ? JSON.parse(saved) : presets.light[0];
  });

  const applyTheme = (theme) => {
    haptic.medium();
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', JSON.stringify(theme));

    const root = document.documentElement;
    root.style.setProperty('--brand-color', theme.brand);
    root.style.setProperty('--bg-primary', theme.bgPrimary);
    root.style.setProperty('--bg-secondary', theme.bgSecondary);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--brand-text', theme.brandText || '#FFFFFF');
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500 select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Visual Terminal</h1>
        <div className="w-12"></div>
      </header>

      <div className="p-6 space-y-10">
        
        {/* CURRENT ACTIVE PREVIEW */}
        <section>
          <div className="flex items-center gap-2 mb-4 opacity-30">
            <Palette size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Active Configuration</span>
          </div>
          <div className="p-8 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-4 shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--brand-color)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: 'var(--brand-color)' }}>
                <Check size={32} style={{ color: 'var(--brand-text)' }} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter" style={{ color: 'var(--text-main)' }}>{currentTheme.name}</h2>
          </div>
        </section>

        {/* LIGHT MODES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 opacity-30">
            <Sun size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Light Modes</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {presets.light.map((t) => (
              <ThemeCard 
                key={t.name} 
                theme={t} 
                isActive={currentTheme.name === t.name} 
                onClick={() => applyTheme(t)} 
              />
            ))}
          </div>
        </section>

        {/* DARK MODES */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 opacity-30">
            <Moon size={14} style={{ color: 'var(--text-main)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Dark Modes</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {presets.dark.map((t) => (
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

// HELPER COMPONENT: Theme Card
const ThemeCard = ({ theme, isActive, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 shadow-sm ${isActive ? 'scale-105' : 'opacity-80'}`}
      style={{ 
        backgroundColor: theme.bgSecondary, 
        borderColor: isActive ? theme.brand : 'transparent' 
      }}
    >
      {/* Small UI Preview inside card */}
      <div className="w-full h-12 rounded-2xl flex items-center justify-around overflow-hidden border border-black/5" style={{ backgroundColor: theme.bgPrimary }}>
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.brand }} />
        <div className="w-10 h-2 rounded-full" style={{ backgroundColor: theme.textMain, opacity: 0.2 }} />
      </div>
      
      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: theme.textMain }}>
        {theme.name}
      </span>

      {isActive && (
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: theme.brand }}>
          <Check size={12} style={{ color: theme.brandText }} strokeWidth={4} />
        </div>
      )}
    </motion.button>
  );
};

export default Settings;