import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import API from '../utils/api';

const Home = () => {
  const [userName, setUserName] = useState("User");
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get('/auth/me');
        setUserName(userRes.data.name || "Rishi");
        const res = await API.get('/transactions');
        
        const inc = res.data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const spd = res.data.filter(t => t.type === 'spend').reduce((acc, t) => acc + t.amount, 0);
        
        setTotals({ balance: inc - spd, income: inc, spend: spd });
        setTransactions(res.data.slice(0, 5));
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const format = (num) => `₹${num.toLocaleString()}`;

  return (
    <div className="min-h-screen p-6 pt-12 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* GREETING */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-widest opacity-40 font-black" style={{ color: 'var(--text-main)' }}>Intelligence Ledger</p>
        <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>Hi, {userName}</h1>
      </div>

      {/* BALANCE CARD */}
      <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl mb-8">
        <p className="text-[10px] uppercase opacity-40 font-black mb-2" style={{ color: 'var(--text-main)' }}>Available Liquidity</p>
        <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>{format(totals.balance)}</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col border-r border-white/10 pr-4">
            <span className="text-[9px] uppercase font-black text-emerald-500 mb-1">Inflow</span>
            <div className="flex items-center gap-1 font-black text-sm" style={{ color: 'var(--text-main)' }}>
              <ArrowUpRight size={14} className="text-emerald-500" /> {format(totals.income)}
            </div>
          </div>
          <div className="flex flex-col pl-4">
            <span className="text-[9px] uppercase font-black text-rose-500 mb-1">Outflow</span>
            <div className="flex items-center gap-1 font-black text-sm" style={{ color: 'var(--text-main)' }}>
              <ArrowDownLeft size={14} className="text-rose-500" /> {format(totals.spend)}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-30" style={{ color: 'var(--text-main)' }}>Pipeline Log</h3>
      {loading ? (
        <div className="flex justify-center py-10 opacity-20"><Loader2 className="animate-spin" style={{ color: 'var(--text-main)' }} /></div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx._id} className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.5rem] border border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-primary)]">{tx.type === 'income' ? "🏦" : "🛒"}</div>
                <p className="font-black text-sm text-[var(--text-main)]">{tx.category}</p>
              </div>
              <p className={`font-black text-lg ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{format(tx.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;