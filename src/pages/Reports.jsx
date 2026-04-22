import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowLeft, Calendar, FileSpreadsheet, 
  Check, ChevronRight, Loader2, Sparkles, EyeOff, Eye
} from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  
  // Privacy State
  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');

  // --- Colorful Swipe Logic ---
  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, 80], [1, 0]);
  const swipeBg = useTransform(
    x, 
    [0, 100, 240], 
    ["rgba(15, 23, 42, 0.05)", "rgba(59, 130, 246, 0.3)", "var(--brand-color)"]
  );
  const fillWidth = useTransform(x, [0, 240], ["0%", "100%"]);
  const iconScale = useTransform(x, [0, 200], [1, 1.2]);

  const handleDownload = async () => {
    if (!dateRange.from || !dateRange.to) {
      haptic.error();
      alert("Terminal Sync Required: Select Dates");
      x.set(0);
      return;
    }

    setLoading(true);
    haptic.medium();
    
    try {
      const response = await API.get(`/transactions/download`, {
        params: { from: dateRange.from, to: dateRange.to },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${dateRange.from}_to_${dateRange.to}.csv`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      setIsDownloaded(true);
      haptic.success();
      
      setTimeout(() => {
        setIsDownloaded(false);
        setLoading(false);
        x.set(0);
      }, 3000);
      
    } catch (err) {
      setLoading(false);
      haptic.error();
      alert("Protocol Interrupted: Connection Lost");
      x.set(0);
    }
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center shadow-2xl border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3.5rem 3.5rem' }}>
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40" style={{ color: 'var(--text-main)' }}>Intelligence</h1>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--brand-color)' }}>Data Extraction</span>
        </div>
        <button 
          onClick={() => { haptic.light(); setIsGhosted(!isGhosted); }}
          className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform"
          style={{ color: isGhosted ? 'var(--brand-color)' : 'var(--text-main)' }}
        >
          {isGhosted ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </header>

      <div className="px-8 mt-10 space-y-10">
        {/* Range Selection Card */}
        <section className="p-8 rounded-[3rem] border-2 border-black/5 shadow-inner relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3 mb-10 opacity-30">
            <Calendar size={18} style={{ color: 'var(--text-main)' }} />
            <h2 className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>Launch Sequence</h2>
          </div>

          <div className="space-y-10 relative z-10">
            <div className="relative border-l-4 pl-6 transition-all" style={{ borderColor: dateRange.from ? 'var(--brand-color)' : 'rgba(0,0,0,0.1)' }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Initial Vector (From)</label>
              <input 
                type="date" 
                className={`w-full bg-transparent outline-none font-black text-2xl transition-all ${isGhosted ? 'blur-md' : 'blur-0'}`}
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }} 
                onChange={(e) => { haptic.light(); setDateRange({ ...dateRange, from: e.target.value }); }}
              />
            </div>

            <div className="relative border-l-4 pl-6 transition-all" style={{ borderColor: dateRange.to ? 'var(--brand-color)' : 'rgba(0,0,0,0.1)' }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Terminal Vector (To)</label>
              <input 
                type="date" 
                className={`w-full bg-transparent outline-none font-black text-2xl transition-all ${isGhosted ? 'blur-md' : 'blur-0'}`}
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }}
                onChange={(e) => { haptic.light(); setDateRange({ ...dateRange, to: e.target.value }); }}
              />
            </div>
          </div>
        </section>

        {/* Swipe to Export Area */}
        <div className="relative">
          <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none">
             <div className="px-4 py-1.5 rounded-full bg-black/5 flex items-center gap-2 border border-black/5">
                <Sparkles size={10} className="text-amber-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-main)' }}>Secure Pipeline Ready</span>
             </div>
          </div>
          
          <motion.div 
            className="relative h-24 w-full rounded-[3rem] flex items-center p-3 overflow-hidden border-2 shadow-2xl" 
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}
          >
            {/* PROGRESS FILL */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none origin-left"
              style={{ width: fillWidth, backgroundColor: swipeBg }}
            />

            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3 opacity-30" style={{ color: 'var(--text-main)' }}>
                {loading ? 'Processing...' : <>Swipe to Export <ChevronRight size={16} className="animate-pulse" /></>}
              </span>
            </motion.div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 240 }}
              dragElastic={0.02}
              dragSnapToOrigin={!isDownloaded}
              style={{ x, scale: iconScale }}
              onDragStart={() => haptic.light()}
              onDragEnd={(_, info) => {
                if (info.offset.x > 200 && !loading) handleDownload();
                else { haptic.light(); x.set(0); }
              }}
              className="z-10 w-24 h-full shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2"
              style={{ 
                borderRadius: '2.5rem',
                backgroundColor: isDownloaded ? '#10b981' : 'var(--bg-secondary)',
                borderColor: 'var(--bg-primary)'
              }}
            >
              <AnimatePresence mode="wait">
                {isDownloaded ? (
                  <motion.div key="s" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="text-white" size={32} strokeWidth={4} /></motion.div>
                ) : (
                  <motion.div key="i" style={{ color: 'var(--text-main)' }}>
                    {loading ? <Loader2 className="animate-spin" size={28} /> : <FileSpreadsheet size={30} strokeWidth={2.5} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {isDownloaded && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="absolute right-10 pointer-events-none">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Authorized</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <footer className="mt-20 px-10 text-center opacity-10">
         <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: 'var(--text-main)' }}>Session Encrypted • v2.4.0</p>
      </footer>
    </div>
  );
};

export default Reports;