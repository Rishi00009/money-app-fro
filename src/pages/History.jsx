import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Filter, Trash2, Landmark, Loader2, Eye, EyeOff } from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Privacy State from Settings
  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/transactions');
        setTransactions(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const deleteTx = async (id) => {
    haptic.medium(); // Tactile feedback for deletion intent
    if (!window.confirm("Authorize permanent deletion of this record?")) return;
    
    try {
      await API.delete(`/transactions/${id}`);
      setTransactions(transactions.filter(t => t._id !== id));
      haptic.success();
    } catch (err) {
      haptic.error();
      console.error("Delete failed:", err);
    }
  };

  const filteredItems = filter === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === filter.toLowerCase());

  // Helper to mask numbers if Ghost Mode is active
  const formatAmount = (num) => {
    return isGhosted ? "••••" : `₹${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center bg-[var(--bg-secondary)] rounded-b-[3rem] shadow-2xl border-b border-black/5">
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ChevronLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-1" style={{ color: 'var(--text-main)' }}>Database</p>
          <h1 className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--brand-color)' }}>Transaction Log</h1>
        </div>
        <button 
          onClick={() => { haptic.light(); setIsGhosted(!isGhosted); }} 
          className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform"
          style={{ color: isGhosted ? 'var(--brand-color)' : 'var(--text-main)' }}
        >
          {isGhosted ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </header>

      {/* FILTER PILLS */}
      <div className="flex gap-3 px-6 mt-8 overflow-x-auto no-scrollbar">
        {['All', 'Spend', 'Income'].map((tab) => (
          <button
            key={tab}
            onClick={() => { haptic.light(); setFilter(tab); }}
            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
              filter === tab 
                ? 'bg-[var(--brand-color)] text-[var(--bg-secondary)] shadow-lg' 
                : 'bg-black/5 opacity-40'
            }`}
            style={{ color: filter === tab ? 'var(--bg-secondary)' : 'var(--text-main)' }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* HISTORY LIST */}
      <div className="px-6 mt-8 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--text-main)' }} />
            <p className="text-[10px] font-black uppercase tracking-widest">Querying Pipeline...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredItems.map((tx) => (
              <motion.div
                key={tx._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                className="p-5 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-black/5 flex justify-between items-center shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-2xl shadow-inner">
                    {tx.category === 'Food' ? '🍱' : tx.type === 'income' ? '🏦' : '🛒'}
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{tx.category}</p>
                    <div className="flex items-center gap-1.5 opacity-30">
                      <Landmark size={10} style={{ color: 'var(--text-main)' }} />
                      <p className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: 'var(--text-main)' }}>{tx.bank}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <p className={`font-black text-sm tracking-tighter ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatAmount(tx.amount)}
                  </p>
                  <button 
                    onClick={() => deleteTx(tx._id)} 
                    className="p-2 rounded-xl bg-black/5 opacity-20 hover:opacity-100 hover:text-rose-500 transition-all active:scale-75"
                    style={{ color: 'var(--text-main)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 opacity-20 border-2 border-dashed border-black/5 rounded-[3rem]">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>No Ledger Data Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;