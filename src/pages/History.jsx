import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Filter, Trash2, Calendar, Landmark } from 'lucide-react';
import API from '../utils/api'; //

const History = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/transactions'); //
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
    try {
      await API.delete(`/transactions/${id}`); // We'll add this route next
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredItems = filter === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === filter.toLowerCase());

  return (
    <div className="min-h-screen pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center bg-[var(--bg-secondary)] rounded-b-[2.5rem] shadow-xl">
        <button onClick={() => navigate('/home')} className="p-3 rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-transform">
          <ChevronLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-lg font-bold uppercase tracking-widest text-black">Transaction Log</h1>
        <button className="p-3 rounded-2xl bg-white/5 border border-white/10">
          <Filter size={20} style={{ color: 'var(--brand-color)' }} />
        </button>
      </header>

      {/* FILTER PILLS */}
      <div className="flex gap-3 px-6 mt-8 overflow-x-auto no-scrollbar">
        {['All', 'Spend', 'Income'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all ${
              filter === tab ? 'bg-[var(--brand-color)] text-black' : 'bg-white/5 text-white/40'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* HISTORY LIST */}
      <div className="px-6 mt-8 space-y-4">
        {loading ? (
          <div className="text-center py-20 opacity-20 text-xs tracking-widest">QUERYING DATABASE...</div>
        ) : filteredItems.length > 0 ? (
          <AnimatePresence>
            {filteredItems.map((tx) => (
              <motion.div
                key={tx._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-5 rounded-[2rem] bg-[var(--bg-secondary)] border border-white/5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-xl">
                    {tx.type === 'income' ? '💼' : '🍱'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{tx.category}</p>
                    <div className="flex items-center gap-2 opacity-30">
                      <Landmark size={10} />
                      <p className="text-[10px] uppercase tracking-tighter">{tx.bank}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                  </p>
                  <button onClick={() => deleteTx(tx._id)} className="mt-1 opacity-20 hover:opacity-100 hover:text-rose-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-20 opacity-20 text-xs tracking-widest">NO DATA FOUND</div>
        )}
      </div>
    </div>
  );
};

export default History;