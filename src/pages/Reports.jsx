import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  TrendingUp,
  TrendingDown,
  Check,
  ChevronRight
} from 'lucide-react';
import { haptic } from '../utils/haptics';

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // --- Swipe Logic ---
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0]);
  // Color transitions from Gray to Brand color as user swipes
  const swipeBg = useTransform(x, [0, 200], ["rgba(0,0,0,0.05)", "var(--brand-color)"]);
  const iconColor = useTransform(x, [0, 200], ["#94a3b8", "#000000"]);

  const handleDownload = async () => {
    if (!dateRange.from || !dateRange.to) {
      haptic.error();
      alert("Please select a valid date range");
      x.set(0); // Snap back
      return;
    }

    setLoading(true);
    haptic.medium();
    
    try {
      const token = localStorage.getItem('token');
      const downloadUrl = `https://money-app-back.onrender.com/api/transactions/download?from=${dateRange.from}&to=${dateRange.to}&token=${token}`;
      
      window.open(downloadUrl, '_blank');
      
      setIsDownloaded(true);
      haptic.success();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsDownloaded(false);
        setLoading(false);
        x.set(0);
      }, 3000);
      
    } catch (err) {
      setLoading(false);
      haptic.error();
      alert("Download failed.");
      x.set(0);
    }
  };

  return (
    <div className="min-h-screen pb-12 select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => navigate('/home')} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Financial / Export</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-6 mt-10">
        {/* DATE SELECTOR CARD */}
        <section className="p-8 rounded-[3rem] border border-black/5 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--brand-color)', color: '#000' }}>
              <Calendar size={20} strokeWidth={3} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-main)', opacity: 0.6 }}>Date Parameters</h2>
          </div>

          <div className="space-y-8">
            {/* START DATE - Increased visibility */}
            <div className="relative border-b-2 pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.4 }}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--text-main)' }}>Starting Period</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-black text-xl cursor-pointer"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }} 
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            {/* END DATE - Increased visibility */}
            <div className="relative border-b-2 pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.4 }}>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--text-main)' }}>Ending Period</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-black text-xl cursor-pointer"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-[2.5rem] border border-black/5 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingUp className="text-emerald-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ color: 'var(--text-main)' }}>Inflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
          <div className="p-6 rounded-[2.5rem] border border-black/5 shadow-sm" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingDown className="text-rose-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ color: 'var(--text-main)' }}>Outflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
        </div>

        {/* SWIPE TO GENERATE REPORT */}
        <div className="mt-10">
          <label className="text-[10px] uppercase font-black tracking-widest block mb-4 text-center opacity-30" style={{ color: 'var(--text-main)' }}>System Authorization</label>
          
          <motion.div 
            className="relative h-20 w-full rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 shadow-inner" 
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)', backgroundColor: swipeBg }}
          >
            {/* Hint Text */}
            <motion.div 
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: 'var(--text-main)', opacity: 0.4 }}>
                Swipe to Export <ChevronRight size={14} className="animate-pulse" />
              </span>
            </motion.div>

            {/* Handle */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 240 }}
              dragElastic={0.1}
              dragSnapToOrigin={!isDownloaded}
              style={{ x }}
              onDragStart={() => haptic.light()}
              onDragEnd={(_, info) => {
                if (info.offset.x > 180 && !loading) {
                  handleDownload();
                } else {
                  haptic.light();
                  x.set(0); 
                }
              }}
              className="z-10 w-20 h-16 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2"
              style={{ 
                borderRadius: '2rem',
                backgroundColor: isDownloaded ? '#10b981' : 'var(--bg-secondary)',
                borderColor: 'var(--bg-primary)'
              }}
            >
              <AnimatePresence mode="wait">
                {isDownloaded ? (
                  <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="text-white" size={28} strokeWidth={4} />
                  </motion.div>
                ) : (
                  <motion.div key="idle" style={{ color: iconColor }}>
                    {loading ? <Loader2 className="animate-spin" size={26} /> : <FileSpreadsheet size={26} strokeWidth={2.5} />}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Success Message overlay */}
            <AnimatePresence>
              {isDownloaded && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-8 pointer-events-none"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Report Exported</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="px-10 mt-12 text-center font-black text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)', opacity: 0.1 }}>
        Secure Financial Export v1.0
      </div>
    </div>
  );
};

export default Reports;