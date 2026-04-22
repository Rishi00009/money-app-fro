import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Download, FileSpreadsheet, 
  TrendingUp, TrendingDown, Check, ChevronRight, Loader2, Sparkles
} from 'lucide-react';
import API from '../utils/api'; // Ensure this points to your axios instance
import { haptic } from '../utils/haptics';

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // --- Colorful Swipe Logic ---
  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, 80], [1, 0]);
  
  // Background morphs through a colorful gradient as you swipe
  const swipeBg = useTransform(
    x, 
    [0, 100, 200], 
    ["rgba(15, 23, 42, 0.05)", "rgba(59, 130, 246, 0.5)", "var(--brand-color)"]
  );
  
  const fillWidth = useTransform(x, [0, 240], ["0%", "100%"]);
  const iconScale = useTransform(x, [0, 200], [1, 1.3]);

  const handleDownload = async () => {
    if (!dateRange.from || !dateRange.to) {
      haptic.error();
      alert("Select dates first");
      x.set(0);
      return;
    }

    setLoading(true);
    haptic.medium();
    
    try {
      // 1. Fetch data as a Blob (Secure method)
      const response = await API.get(`/transactions/download`, {
        params: { from: dateRange.from, to: dateRange.to },
        responseType: 'blob', // Critical for file downloads
      });

      // 2. Create a temporary download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${dateRange.from}_to_${dateRange.to}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // 3. Cleanup
      link.parentNode.removeChild(link);
      setIsDownloaded(true);
      haptic.success();
      
      setTimeout(() => {
        setIsDownloaded(false);
        setLoading(false);
        x.set(0);
      }, 4000);
      
    } catch (err) {
      setLoading(false);
      haptic.error();
      alert("Server sync failed. Check your connection.");
      x.set(0);
    }
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      <header className="p-6 pt-12 flex justify-between items-center shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => navigate('/home')} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div className="text-center">
            <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Intelligence</h1>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Data Export</span>
        </div>
        <div className="w-10"></div>
      </header>

      <div className="px-6 mt-10">
        {/* Date Selector */}
        <section className="p-8 rounded-[3rem] border-2 border-black/5 shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Calendar size={20} strokeWidth={3} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-main)', opacity: 0.6 }}>Range Selection</h2>
          </div>

          <div className="space-y-10 relative z-10">
            <div className="relative border-l-4 pl-6" style={{ borderColor: 'var(--brand-color)' }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Launch Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-black text-2xl"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }} 
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div className="relative border-l-4 pl-6" style={{ borderColor: 'var(--text-main)', opacity: 0.2 }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Terminal Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-black text-2xl"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Swipe Control */}
        <div className="mt-12 relative">
          <div className="absolute -top-6 left-0 right-0 flex justify-center">
             <div className="px-4 py-1 rounded-full bg-black/5 flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--text-main)' }}>Secure Encrypted Pipeline</span>
             </div>
          </div>
          
          <motion.div 
            className="relative h-24 w-full rounded-[3rem] flex items-center p-3 overflow-hidden border-2 shadow-2xl" 
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}
          >
            {/* COLORFUL FILL AREA */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none origin-left"
              style={{ width: fillWidth, backgroundColor: swipeBg }}
            />

            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3" style={{ color: 'var(--text-main)', opacity: 0.3 }}>
                Swipe to Export <ChevronRight size={16} className="animate-pulse" />
              </span>
            </motion.div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 240 }}
              dragElastic={0.05}
              dragSnapToOrigin={!isDownloaded}
              style={{ x, scale: iconScale }}
              onDragStart={() => haptic.light()}
              onDragEnd={(_, info) => {
                if (info.offset.x > 180 && !loading) handleDownload();
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
                    {loading ? <Loader2 className="animate-spin" size={28} /> : <FileSpreadsheet size={28} strokeWidth={2.5} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {isDownloaded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-10 pointer-events-none">
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Success</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <footer className="mt-16 px-10 text-center opacity-10">
         <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: 'var(--text-main)' }}>Authorized Terminal Access Only</p>
      </footer>
    </div>
  );
};

export default Reports;