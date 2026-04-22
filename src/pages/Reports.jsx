import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';

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
      const downloadUrl = `https://money-app-back.onrender.com/api/transactions/download?from=${dateRange.from}&to=${dateRange.to}&token=${token}`;
      window.open(downloadUrl, '_blank');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert("Failed to generate report.");
    }
  };

  return (
    <div className="min-h-screen pb-12 select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER - Uses secondary bg and main text */}
      <header className="p-6 pt-12 flex justify-between items-center shadow-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
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
        {/* DATE SELECTOR CARD */}
        <section className="p-8 rounded-[3rem] border border-black/5 shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--brand-color)', color: '#000' }}>
              <Calendar size={20} strokeWidth={3} />
            </div>
            {/* FIXED: Added var(--text-main) with opacity */}
            <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-main)', opacity: 0.5 }}>Select Range</h2>
          </div>

          <div className="space-y-6">
            <div className="relative border-b pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.2 }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--text-main)', opacity: 0.4 }}>Starting Date</label>
              {/* FIXED: Added color and color-scheme to ensure the calendar icon is visible in dark/light mode */}
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-bold text-lg cursor-pointer"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }} 
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>

            <div className="relative border-b pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.2 }}>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] block mb-2" style={{ color: 'var(--text-main)', opacity: 0.4 }}>Ending Date</label>
              <input 
                type="date" 
                className="w-full bg-transparent outline-none font-bold text-lg cursor-pointer"
                style={{ color: 'var(--text-main)', colorScheme: 'light dark' }}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* QUICK STATS - Removed white/5 and text-white */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-6 rounded-[2.5rem] border border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingUp className="text-emerald-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)', opacity: 0.3 }}>Inflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
          <div className="p-6 rounded-[2.5rem] border border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
             <TrendingDown className="text-rose-500 mb-2" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)', opacity: 0.3 }}>Outflow</p>
             <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Auto-Calc</p>
          </div>
        </div>

        {/* DOWNLOAD BUTTON */}
        <button 
          onClick={handleDownload}
          disabled={loading}
          className="w-full mt-8 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all shadow-xl"
          style={{ backgroundColor: 'var(--brand-color)' }}
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-black/10 rounded-xl text-black">
              <FileSpreadsheet size={24} strokeWidth={2.5} />
            </div>
            <span className="font-black text-xs uppercase tracking-[0.2em] text-black">
              {loading ? 'Compiling...' : 'Generate Report'}
            </span>
          </div>
          <Download className="text-black group-hover:translate-y-1 transition-transform" size={20} strokeWidth={3} />
        </button>
      </div>

      <div className="px-10 mt-12 text-center font-black text-[10px] uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)', opacity: 0.1 }}>
        Authorized Export Only
      </div>
    </div>
  );
};

export default Reports;