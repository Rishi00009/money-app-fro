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
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [loading, setLoading] = useState(true);

  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');
  const [showSensitive, setShowSensitive] = useState(false); 

  const getCycleRange = (startDay) => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), startDay, 0, 0, 0);
    if (now.getDate() < startDay) start.setMonth(start.getMonth() - 1);
    let end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setSeconds(end.getSeconds() - 1);
    return { from: start.toISOString(), to: end.toISOString() };
  };

  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const userRes = await API.get('/auth/me');
        const startDay = userRes.data.cycleStartDay || 1;
        setUserName(userRes.data.name || "Rishi");
        const range = getCycleRange(startDay);
        const res = await API.get('/transactions', { params: range });
        
        const inc = res.data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const spd = res.data.filter(t => t.type === 'spend').reduce((acc, t) => acc + t.amount, 0);
        
        setTotals({ balance: inc - spd, income: inc, spend: spd });
        setTransactions(res.data.slice(0, 5));
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

  const formatAmount = (num) => (isGhosted && !showSensitive ? "••••••" : `₹${num.toLocaleString()}`);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-44 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
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
        <button onClick={() => navigate('/reports')} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-white/5 shadow-lg active:scale-95 transition-transform">
          <Bell size={20} style={{ color: 'var(--text-main)' }} />
        </button>
      </header>

      {/* BALANCE CARD */}
      <section className="px-6 mb-8">
        <div 
          onClick={() => { if(isGhosted) { haptic.light(); setShowSensitive(!showSensitive); }}}
          className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black" style={{ color: 'var(--text-main)' }}>Cycle Liquidity</p>
            {isGhosted && <div className="opacity-20" style={{ color: 'var(--text-main)' }}>{showSensitive ? <Eye size={14} /> : <EyeOff size={14} />}</div>}
          </div>
          <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>{formatAmount(totals.balance)}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col border-r border-white/10 pr-4">
              <span className="text-[9px] uppercase font-black text-emerald-500 mb-1 tracking-widest">Inflow</span>
              <div className="flex items-center gap-1 font-black text-sm tracking-tight" style={{ color: 'var(--text-main)' }}><ArrowUpRight size={14} className="text-emerald-500" /> {formatAmount(totals.income)}</div>
            </div>
            <div className="flex flex-col pl-4">
              <span className="text-[9px] uppercase font-black text-rose-500 mb-1 tracking-widest">Outflow</span>
              <div className="flex items-center gap-1 font-black text-sm tracking-tight" style={{ color: 'var(--text-main)' }}><ArrowDownLeft size={14} className="text-rose-500" /> {formatAmount(totals.spend)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="px-6 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-30" style={{ color: 'var(--text-main)' }}>Recent Pipeline</h3>
        {loading ? (
          <div className="flex justify-center py-10 opacity-20"><Loader2 className="animate-spin" style={{ color: 'var(--text-main)' }} /></div>
        ) : (
          transactions.map((tx) => <SwipeItem key={tx._id} emoji={tx.type === 'income' ? "🏦" : "🛒"} label={tx.category} amount={formatAmount(tx.amount)} isIncome={tx.type === 'income'} />)
        )}
      </section>

      {/* --- REFINED NAVIGATION DOCK --- */}
      <div className="fixed bottom-8 left-0 right-0 h-24 z-50 flex items-center justify-center pointer-events-none">
        {/* Background Dock Shell */}
        <div className="absolute w-[92%] h-20 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 shadow-2xl z-10" />
        
        {/* STATIC GLASS BACKGROUND FOR SELECTED ITEM */}
        <div 
          className="absolute w-16 h-16 rounded-[1.8rem] z-20 shadow-xl border border-white/10" 
          style={{ backgroundColor: 'var(--brand-color)', opacity: 0.9 }}
        />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-30 flex items-center overflow-x-auto no-scrollbar w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
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
                <motion.div
                  animate={{ 
                    scale: isCenter ? 1.1 : 0.8, 
                    opacity: isCenter ? 1 : 0.3,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative z-10"
                  style={{ color: isCenter ? 'var(--bg-primary)' : 'var(--text-main)' }}
                >
                  {item.icon}
                </motion.div>
                
                {/* LABEL POSITIONED FURTHER DOWN */}
                <AnimatePresence>
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 28 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bg-[var(--text-main)] px-3 py-1 rounded-full shadow-lg"
                    >
                      <span className="text-[7px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--bg-primary)' }}>
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

const SwipeItem = ({ emoji, label, amount, isIncome = false }) => (
  <motion.div whileHover={{ scale: 1.01 }} className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.5rem] border border-black/5 mb-4 shadow-sm mx-2">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg bg-[var(--bg-primary)] shadow-inner">{emoji}</div>
      <div>
        <p className="font-black text-sm tracking-tight text-[var(--text-main)]">{label}</p>
        <p className="text-[8px] uppercase opacity-30 font-black tracking-widest">System Entry</p>
      </div>
    </div>
    <p className={`font-black text-lg tracking-tighter ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>{amount}</p>
  </motion.div>
);

export default Home;