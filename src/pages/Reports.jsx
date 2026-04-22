import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
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
      const token = localStorage.getItem('token');
      const baseUrl = "https://money-app-back.onrender.com/api/transactions/download";
      const downloadUrl = `${baseUrl}?from=${dateRange.from}&to=${dateRange.to}&token=${token}`;
      window.open(downloadUrl, '_blank');
      setLoading(false);
    } catch (err) {
      console.error("Download failed:", err);
      setLoading(false);
      alert("Failed to generate report.");
    }
  };

  return (
    <div className="min-h-screen pb-12 select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      <header className="p-6 pt-12 flex justify-between items-center shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button 
          onClick={() => navigate('/home')} 
          className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Financial / Export</h1>
        <div className="w-10"></div>
      </header>

      <div className="px-6 mt-10">
        <section className="p-8 rounded-[3rem] border border-black/5 shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--brand-color)', color: 'var(--brand-text, #000)' }}>
              <Calendar size={20} strokeWidth={3} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-main)' }}>Select Range</h2>
          </div>

          <div className="space-y-6">
            <div className="relative border-b pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.1 }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-30" style={{ color: 'var(--text-main)' }}>Starting Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-bold text-lg cursor-pointer"
                style={{ color: 'var(--text-main)' }}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div className="relative border-b pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.1 }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2 opacity-30" style={{ color: 'var(--text-main)' }}>Ending Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-bold text-lg cursor-pointer"
                style={{ color: 'var(--text-main)' }}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-[2.5rem] border border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingUp className="text-emerald-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ color: 'var(--text-main)' }}>Inflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
          <div className="p-6 rounded-[2.5rem] border border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingDown className="text-rose-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ color: 'var(--text-main)' }}>Outflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
        </div>

        <button 
          onClick={handleDownload}
          disabled={loading}
          className="w-full mt-8 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-2xl"
          style={{ backgroundColor: 'var(--brand-color)', boxShadow: '0 20px 40px -10px var(--brand-color)' }}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-black/10 rounded-xl">
              <FileSpreadsheet size={24} strokeWidth={2.5} style={{ color: 'var(--brand-text, #000)' }} />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--brand-text, #000)' }}>
              {loading ? 'Compiling...' : 'Generate Report'}
            </span>
          </div>
          <Download className="group-hover:translate-y-1 transition-transform" size={20} strokeWidth={3} style={{ color: 'var(--brand-text, #000)' }} />
        </button>
      </div>

      <div className="px-10 mt-12 text-center opacity-10 font-black text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)' }}>
        Authorized Export Only
      </div>
    </div>
  );
};

export default Reports;