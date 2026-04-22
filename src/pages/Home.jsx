import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, User, Settings, Code, 
  ArrowUpRight, ArrowDownLeft, Landmark, Trash2, History, Loader2 
} from 'lucide-react';
import API from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [activeIndex, setActiveIndex] = useState(2); 
  const [userName, setUserName] = useState("User"); 
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. Helper: Calculate Billing Cycle Dates ---
  const getCycleRange = (startDay) => {
    const now = new Date();
    // Create start date for current month
    let start = new Date(now.getFullYear(), now.getMonth(), startDay, 0, 0, 0);
    
    // If today is BEFORE the selected start day, the cycle began last month
    if (now.getDate() < startDay) {
      start.setMonth(start.getMonth() - 1);
    }
    
    // End date is one month from start minus one second
    let end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setSeconds(end.getSeconds() - 1);

    return { 
      from: start.toISOString(), 
      to: end.toISOString() 
    };
  };

  // --- 2. Data Fetching ---
  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        // A. Fetch Profile for Name and Cycle Preference
        const userRes = await API.get('/auth/me');
        const startDay = userRes.data.cycleStartDay || 1;
        setUserName(userRes.data.name || "Rishi");

        // B. Calculate Range
        const range = getCycleRange(startDay);

        // C. Fetch Transactions within that range
        const res = await API.get('/transactions', { params: range });
        const txs = res.data;

        // D. Filter & Calculate (Backend should ideally filter, but this is a safety check)
        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const spend = txs.filter(t => t.type === 'spend').reduce((acc, t) => acc + t.amount, 0);

        setTotals({
          balance: income - spend,
          income,
          spend
        });
        
        setTransactions(txs.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Home Sync Error:", err);
        setLoading(false);
        if (err.response?.status === 401) navigate('/');
      }
    };
    fetchTerminalData();
  }, [navigate]);

  // Center Nav on Mount
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetItem = container.querySelectorAll('.nav-scroll-item')[activeIndex];
      if (targetItem) {
        const scrollPos = targetItem.offsetLeft - (container.offsetWidth / 2) + (targetItem.offsetWidth / 2);
        container.scrollTo({ left: scrollPos });
      }
    }
  }, []);

  const navItems = [
    { id: 'profile', icon: <User size={24} />, path: '/profile', label: 'Profile' },
    { id: 'history', icon: <History size={24} />, path: '/history', label: 'History' },
    { id: 'add', icon: <Plus size={32} />, path: '/add', label: 'Add Entry' },
    { id: 'settings', icon: <Settings size={24} />, path: '/settings', label: 'Settings' },
    { id: 'reports', icon: <Bell size={24} />, path: '/reports', label: 'Reports' },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const centerPoint = container.scrollLeft + container.offsetWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;
    const items = container.querySelectorAll('.nav-scroll-item');
    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(centerPoint - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-52 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-color)] flex items-center justify-center text-white font-black shadow-xl text-xl">
            {userName[0]}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-40 font-black" style={{ color: 'var(--text-main)' }}>Intelligence Ledger</p>
            <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{userName}</h1>
          </div>
        </div>
        <button className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 shadow-lg active:scale-95 transition-transform">
          <Bell size={20} style={{ color: 'var(--text-main)' }} />
        </button>
      </header>

      {/* BALANCE CARD */}
      <section className="px-6 mb-8">
        <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black" style={{ color: 'var(--text-main)' }}>Cycle Liquidity</p>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live Cycle
            </div>
          </div>
          <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>
            ₹{totals.balance.toLocaleString()}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col border-r border-white/10 pr-4">
              <span className="text-[9px] uppercase font-black text-emerald-500 mb-1 tracking-widest">Inflow</span>
              <div className="flex items-center gap-1 font-black text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>
                <ArrowUpRight size={14} className="text-emerald-500" /> ₹{totals.income.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col pl-4">
              <span className="text-[9px] uppercase font-black text-rose-500 mb-1 tracking-widest">Outflow</span>
              <div className="flex items-center gap-1 font-black text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>
                <ArrowDownLeft size={14} className="text-rose-500" /> ₹{totals.spend.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVITY LOG */}
      <section className="px-6 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-30" style={{ color: 'var(--text-main)' }}>Recent Pipeline</h3>
        {loading ? (
          <div className="flex justify-center py-10 opacity-20"><Loader2 className="animate-spin" style={{ color: 'var(--text-main)' }} /></div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <SwipeItem 
              key={tx._id} 
              emoji={tx.type === 'income' ? "🏦" : "🛒"} 
              label={tx.category} 
              amount={`${tx.type === 'income' ? '+ ' : '- '}₹${tx.amount.toLocaleString()}`} 
              isIncome={tx.type === 'income'}
            />
          ))
        ) : (
          <div className="text-center py-12 rounded-[2.5rem] border-2 border-dashed border-white/5 opacity-30">
            <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: 'var(--text-main)' }}>No ledger data for this cycle</p>
          </div>
        )}
      </section>

      {/* BOTTOM NAV BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-48 flex flex-col items-center justify-center z-50 pointer-events-none">
        <div className="absolute bottom-16 w-20 h-20 rounded-[2.5rem] bg-[var(--brand-color)] shadow-2xl z-0 opacity-30" />
        <div className="absolute bottom-14 w-[92%] h-24 bg-[var(--bg-secondary)]/80 backdrop-blur-3xl rounded-[3.2rem] border border-white/10 z-[-1] shadow-2xl" />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex items-center overflow-x-auto no-scrollbar w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing mb-6"
          style={{ scrollSnapType: 'x mandatory', paddingLeft: 'calc(50% - 40px)', paddingRight: 'calc(50% - 40px)' }}
        >
          {navItems.map((item, index) => {
            const isCenter = activeIndex === index;
            return (
              <motion.div
                key={item.id}
                className="nav-scroll-item flex-shrink-0 w-20 flex flex-col items-center justify-center h-full relative"
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => { if (isCenter) navigate(item.path); }}
              >
                <motion.div
                  animate={{ scale: isCenter ? 1.2 : 0.6, opacity: isCenter ? 1 : 0.2 }}
                  className={`flex items-center justify-center z-10 ${isCenter ? 'text-black' : 'text-[var(--text-main)]'}`}
                >
                  {item.icon}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <div className="absolute bottom-6 pointer-events-none h-6 flex items-center justify-center">
          <AnimatePresence mode='wait'>
            <motion.div
              key={navItems[activeIndex].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[var(--text-main)] px-6 py-2 rounded-full shadow-2xl"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--bg-primary)' }}>
                {navItems[activeIndex].label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SwipeItem = ({ emoji, label, amount, isIncome = false }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.5rem] border border-white/5 mb-4 shadow-xl mx-2">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-[var(--bg-primary)] shadow-inner">
        {emoji}
      </div>
      <div>
        <p className="font-black text-sm tracking-tight text-[var(--text-main)]">{label}</p>
        <p className="text-[9px] uppercase opacity-30 font-black tracking-widest">Verified Entry</p>
      </div>
    </div>
    <p className={`font-black text-lg tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
      {amount}
    </p>
  </motion.div>
);

export default Home;