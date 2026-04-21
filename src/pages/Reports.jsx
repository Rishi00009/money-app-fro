import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import API from '../utils/api';

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!dateRange.from || !dateRange.to) {
      alert("Please select a valid date range");
      return;
    }

    setLoading(true);
    try {
      // We use the token from localStorage to authorize the download
      const token = localStorage.getItem('token');
      
      // Construct the URL with query parameters
      const baseUrl = "http://localhost:5000/api/transactions/download";
      const downloadUrl = `${baseUrl}?from=${dateRange.from}&to=${dateRange.to}&token=${token}`;
      
      // Open in a new tab to trigger the browser download
      window.open(downloadUrl, '_blank');
      
      setLoading(false);
    } catch (err) {
      console.error("Download failed:", err);
      setLoading(false);
      alert("Failed to generate report.");
    }
  };

  return (
    <div className="min-h-screen pb-12 select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center bg-[var(--bg-secondary)] rounded-b-[3rem] shadow-2xl">
        <button 
          onClick={() => navigate('/home')} 
          className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Financial / Export</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-6 mt-10">
        {/* DATE SELECTOR CARD */}
        <section className="bg-[var(--bg-secondary)] p-8 rounded-[3rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-[var(--brand-color)] text-black">
              <Calendar size={20} strokeWidth={3} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white/50">Select Range</h2>
          </div>

          <div className="space-y-6">
            <div className="relative border-b border-white/5 pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Starting Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent text-white outline-none font-bold text-lg cursor-pointer"
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div className="relative border-b border-white/5 pb-2">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 block mb-2">Ending Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent text-white outline-none font-bold text-lg cursor-pointer"
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* QUICK STATS PREVIEW (Visual Placeholder) */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
             <TrendingUp className="text-emerald-400 mb-2" size={20} />
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Inflow</p>
             <p className="text-sm font-bold text-white">Auto-Calculated</p>
          </div>
          <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
             <TrendingDown className="text-rose-400 mb-2" size={20} />
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Outflow</p>
             <p className="text-sm font-bold text-white">Auto-Calculated</p>
          </div>
        </div>

        {/* DOWNLOAD BUTTON */}
        <button 
          onClick={handleDownload}
          disabled={loading}
          className="w-full mt-8 p-6 bg-[var(--brand-color)] rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-2xl shadow-[var(--brand-color)]/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-black/10 rounded-xl text-black">
              <FileSpreadsheet size={24} strokeWidth={2.5} />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em] text-black">
              {loading ? 'Compiling CSV...' : 'Generate Report'}
            </span>
          </div>
          <Download className="text-black group-hover:translate-y-1 transition-transform" size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="px-10 mt-12 text-center opacity-10 font-black text-white text-[10px] uppercase tracking-[0.4em]">
        Authorized Export Only
      </div>
    </div>
  );
};

export default Reports;