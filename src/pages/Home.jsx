import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, User, Settings, Code, 
  ArrowUpRight, ArrowDownLeft, Landmark, Trash2, History 
} from 'lucide-react';
import API from '../utils/api';

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [activeIndex, setActiveIndex] = useState(2); 
  const [userName, setUserName] = useState("Rishi"); 
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: 'profile', icon: <User size={24} />, path: '/profile', label: 'Profile' },
    { id: 'history', icon: <History size={24} />, path: '/history', label: 'History' },
    { id: 'add', icon: <Plus size={32} />, path: '/add', label: 'Add Transaction' },
    { id: 'settings', icon: <Settings size={24} />, path: '/settings', label: 'Settings' },
    { id: 'creator', icon: <Code size={24} />, path: '/creator', label: 'App Creator' },
    { id: 'reports', icon: <Bell size={24} />, path: '/reports', label: 'Reports' },
  ];

  // --- Merged Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get('/transactions');
        const txs = res.data;

        // Calculate Totals Dynamically
        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const spend = txs.filter(t => t.type === 'spend').reduce((acc, t) => acc + t.amount, 0);

        setTotals({
          balance: income - spend,
          income,
          spend
        });
        
        // Show only latest 5
        setTransactions(txs.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Home Fetch Error:", err);
        setLoading(false);
        if (err.response?.status === 401) {
          navigate('/'); // Redirect to login if token is bad
        }
      }
    };
    fetchData();
  }, [navigate]);

  // Handle Horizontal Nav centering
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetItem = container.querySelectorAll('.nav-scroll-item')[2];
      if (targetItem) {
        const scrollPos = targetItem.offsetLeft - (container.offsetWidth / 2) + (targetItem.offsetWidth / 2);
        container.scrollTo({ left: scrollPos });
      }
    }
  }, []);

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
      
      {/* --- HEADER --- */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-color)] flex items-center justify-center text-[var(--brand-text)] font-black shadow-lg">
            {userName[0]}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold" style={{ color: 'var(--text-main)' }}>Welcome back,</p>
            <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{userName}</h1>
          </div>
        </div>
        <button className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 active:scale-95 transition-transform shadow-sm">
          <Bell size={20} style={{ color: 'var(--text-main)' }} />
        </button>
      </header>

      {/* --- BALANCE CARD --- */}
      <section className="px-6 mb-8">
        <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden group">
          <p className="text-[10px] uppercase tracking-[0.2em] mb-2 opacity-40 font-bold" style={{ color: 'var(--text-main)' }}>Current Assets</p>
          <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>
            ₹{totals.balance.toLocaleString()}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col border-r border-white/5 pr-4">
              <span className="text-[10px] uppercase font-black text-emerald-500 mb-1 tracking-widest">Income</span>
              <div className="flex items-center gap-1 font-bold text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>
                <ArrowUpRight size={14} className="text-emerald-500" /> ₹{totals.income.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col pl-4">
              <span className="text-[10px] uppercase font-black text-rose-500 mb-1 tracking-widest">Spent</span>
              <div className="flex items-center gap-1 font-bold text-sm tracking-tight" style={{ color: 'var(--text-main)' }}>
                <ArrowDownLeft size={14} className="text-rose-400" /> ₹{totals.spend.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ACTIVITY LOG --- */}
      <section className="px-6 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-30" style={{ color: 'var(--text-main)' }}>Recent Pipeline</h3>
        {loading ? (
          <div className="flex justify-center py-10 opacity-20">
            <div className="w-6 h-6 border-2 border-[var(--text-main)] border-t-transparent rounded-full animate-spin" />
          </div>
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
          <div className="text-center py-10 rounded-[2rem] border border-dashed border-white/5">
            <p className="text-[10px] uppercase tracking-widest opacity-20" style={{ color: 'var(--text-main)' }}>No Ledger Data</p>
          </div>
        )}
      </section>

      {/* --- BOTTOM SCROLL NAV --- */}
      <div className="fixed bottom-0 left-0 right-0 h-48 flex flex-col items-center justify-center z-50 pointer-events-none">
        {/* Glow behind center button */}
        <div className="absolute bottom-16 w-20 h-20 rounded-[2.2rem] bg-[var(--brand-color)] shadow-[0_15px_40px_-5px_var(--brand-shadow)] z-0 pointer-events-none opacity-40" />
        
        {/* Glass Bar */}
        <div className="absolute bottom-14 w-[92%] h-20 bg-[var(--bg-secondary)]/80 backdrop-blur-3xl rounded-[2.8rem] border border-white/10 z-[-1] shadow-2xl" />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex items-center overflow-x-auto no-scrollbar w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing mb-6"
          style={{ 
            scrollSnapType: 'x mandatory',
            paddingLeft: 'calc(50% - 40px)', 
            paddingRight: 'calc(50% - 40px)' 
          }}
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
                  animate={{
                    scale: isCenter ? 1.1 : 0.6,
                    opacity: isCenter ? 1 : 0.2,
                  }}
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
              className="bg-[var(--text-main)] px-5 py-1.5 rounded-full shadow-2xl"
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
  <motion.div whileHover={{ scale: 1.02 }} className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.2rem] border border-white/5 mb-4 shadow-sm mx-2">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-[var(--bg-primary)] shadow-inner">
        {emoji}
      </div>
      <div>
        <p className="font-bold text-sm tracking-tight text-[var(--text-main)]">{label}</p>
        <p className="text-[9px] uppercase opacity-30 font-black tracking-widest">Verified</p>
      </div>
    </div>
    <p className={`font-black tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
      {amount}
    </p>
  </motion.div>
);

export default Home;