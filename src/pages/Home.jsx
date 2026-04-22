import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, User, Settings, History, 
  ArrowUpRight, ArrowDownLeft, Loader2, Eye, EyeOff 
} from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const [activeIndex, setActiveIndex] = useState(2); 
  const [userName, setUserName] = useState("User"); 
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');
  const [showSensitive, setShowSensitive] = useState(false); 

  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const userRes = await API.get('/auth/me');
        const startDay = userRes.data.cycleStartDay || 1;
        setUserName(userRes.data.name || "Rishi");

        const now = new Date();
        let start = new Date(now.getFullYear(), now.getMonth(), startDay);
        if (now.getDate() < startDay) start.setMonth(start.getMonth() - 1);
        
        const res = await API.get('/transactions', { params: { from: start.toISOString() } });
        const txs = res.data;
        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const spend = txs.filter(t => t.type === 'spend').reduce((acc, t) => acc + t.amount, 0);

        setTotals({ balance: income - spend, income, spend });
        setTransactions(txs.slice(0, 5));
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response?.status === 401) navigate('/');
      }
    };
    fetchTerminalData();
  }, [navigate]);

  const navItems = [
    { id: 'profile', icon: <User size={22} />, path: '/profile', label: 'Profile' },
    { id: 'history', icon: <History size={22} />, path: '/history', label: 'History' },
    { id: 'add', icon: <Plus size={28} />, path: '/add', label: 'Add Entry' },
    { id: 'settings', icon: <Settings size={22} />, path: '/settings', label: 'Settings' },
    { id: 'reports', icon: <Bell size={22} />, path: '/reports', label: 'Reports' },
  ];

  // MECHANICAL SCROLL LOGIC
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetItem = container.querySelectorAll('.nav-scroll-item')[activeIndex];
      if (targetItem) {
        const scrollPos = targetItem.offsetLeft - (container.offsetWidth / 2) + (targetItem.offsetWidth / 2);
        container.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

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

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
      haptic.light(); 
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-44 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER & BALANCE (Same as previous) */}
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
        <button onClick={() => navigate('/reports')} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 shadow-lg">
          <Bell size={20} style={{ color: 'var(--text-main)' }} />
        </button>
      </header>

      {/* BALANCE SECTION */}
      <section className="px-6 mb-8">
        <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden" onClick={() => isGhosted && setShowSensitive(!showSensitive)}>
          <h2 className="text-5xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>
            {isGhosted && !showSensitive ? "••••••" : `₹${totals.balance.toLocaleString()}`}
          </h2>
        </div>
      </section>

      {/* --- SMOOTH GLASS DOCK --- */}
      <div className="fixed bottom-6 left-0 right-0 h-28 z-50 flex items-center justify-center">
        {/* Main Dock Container */}
        <div className="absolute w-[94%] h-24 bg-[var(--bg-secondary)]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-10" />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-30 flex items-center overflow-x-auto no-scrollbar w-full h-full cursor-grab active:cursor-grabbing"
          style={{ 
            scrollSnapType: 'x mandatory', 
            paddingLeft: 'calc(50% - 40px)', 
            paddingRight: 'calc(50% - 40px)' 
          }}
        >
          {navItems.map((item, index) => {
            const isCenter = activeIndex === index;
            return (
              <div
                key={item.id}
                className="nav-scroll-item flex-shrink-0 w-20 flex flex-col items-center justify-center h-full relative"
                style={{ scrollSnapAlign: 'center' }}
                onClick={() => { if (isCenter) { haptic.medium(); navigate(item.path); }}}
              >
                {/* GLASS BACKGROUND FOR SELECTED */}
                <motion.div
                  initial={false}
                  animate={{ 
                    scale: isCenter ? 1 : 0.6,
                    opacity: isCenter ? 1 : 0,
                    rotate: isCenter ? 0 : -15
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute w-16 h-16 rounded-[1.8rem] z-0 shadow-xl border border-white/20"
                  style={{ 
                    // The "Glass" Look: Semi-transparent theme color + blur
                    backgroundColor: 'var(--brand-color)',
                    filter: 'brightness(1.1)',
                    boxShadow: `0 10px 20px -5px var(--brand-color)`
                  }}
                />

                <motion.div
                  animate={{ 
                    scale: isCenter ? 1.1 : 0.75,
                    opacity: isCenter ? 1 : 0.3,
                    y: isCenter ? -2 : 0
                  }}
                  className="relative z-10"
                  style={{ color: isCenter ? 'var(--bg-primary)' : 'var(--text-main)' }}
                >
                  {item.icon}
                </motion.div>
                
                {/* FLOATING LABEL */}
                <AnimatePresence>
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 5, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute top-20 bg-[var(--text-main)] px-4 py-1.5 rounded-full shadow-2xl"
                    >
                      <span className="text-[7px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--bg-primary)' }}>
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ... SwipeItem Helper stays same
const SwipeItem = ({ emoji, label, amount, isIncome = false }) => (
  <motion.div className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.5rem] border border-white/5 mb-4 shadow-sm mx-2">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg bg-[var(--bg-primary)] shadow-inner">{emoji}</div>
      <p className="font-black text-sm tracking-tight text-[var(--text-main)]">{label}</p>
    </div>
    <p className={`font-black text-lg tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{amount}</p>
  </motion.div>
);

export default Home;