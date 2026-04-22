import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { 
  Bell, Plus, User, Settings, History, 
  ArrowUpRight, ArrowDownLeft, Loader2, Eye, EyeOff 
} from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [activeIndex, setActiveIndex] = useState(2); 
  const [userName, setUserName] = useState("User"); 
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [loading, setLoading] = useState(true);
  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');
  const [showSensitive, setShowSensitive] = useState(false); 

  // --- DRAG CONFIG ---
  const ITEM_WIDTH = 80; 
  const dragX = useMotionValue(0);
  
  const navItems = [
    { id: 'profile', icon: <User size={22} />, path: '/profile', label: 'Profile' },
    { id: 'history', icon: <History size={22} />, path: '/history', label: 'History' },
    { id: 'add', icon: <Plus size={28} />, path: '/add', label: 'Add Entry' },
    { id: 'settings', icon: <Settings size={22} />, path: '/settings', label: 'Settings' },
    { id: 'reports', icon: <Bell size={22} />, path: '/reports', label: 'Reports' },
  ];

  // --- SYNC INITIAL POSITION ---
  useEffect(() => {
    // This centers the 3rd item (index 2) exactly in the middle of the screen
    const initialPos = -(2 * ITEM_WIDTH);
    dragX.set(initialPos);
  }, []);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTerminalData = async () => {
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
        if (err.response?.status === 401) navigate('/');
      }
    };
    fetchTerminalData();
  }, [navigate]);

  // --- SWIPE LOGIC ---
  const handleDragEnd = (event, info) => {
    const currentX = dragX.get();
    
    // Calculate which index is closest to the center
    const closestIndex = Math.round(Math.abs(currentX / ITEM_WIDTH));
    const clampedIndex = Math.max(0, Math.min(closestIndex, navItems.length - 1));
    
    const targetX = -(clampedIndex * ITEM_WIDTH);
    
    if (clampedIndex !== activeIndex) {
      haptic.medium();
      setActiveIndex(clampedIndex);
    }

    // Animate snap
    animate(dragX, targetX, {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 0.8
    });
  };

  const formatAmount = (num) => (isGhosted && !showSensitive ? "••••••" : `₹${num.toLocaleString()}`);

  return (
    <div className="relative min-h-screen overflow-hidden pb-44" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
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
      </header>

      {/* BALANCE */}
      <section className="px-6 mb-8">
        <div 
          onClick={() => { if(isGhosted) { haptic.light(); setShowSensitive(!showSensitive); }}}
          className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden"
        >
          <p className="text-[10px] uppercase opacity-40 font-black" style={{ color: 'var(--text-main)' }}>Cycle Liquidity</p>
          <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>{formatAmount(totals.balance)}</h2>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="px-6 mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 opacity-30" style={{ color: 'var(--text-main)' }}>Recent Pipeline</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin opacity-20" style={{ color: 'var(--text-main)' }} /></div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx._id} className="bg-[var(--bg-secondary)] p-5 flex justify-between items-center rounded-[2.5rem] border border-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--bg-primary)]">
                    {tx.type === 'income' ? "🏦" : "🛒"}
                  </div>
                  <p className="font-black text-sm text-[var(--text-main)]">{tx.category}</p>
                </div>
                <p className={`font-black text-lg ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{formatAmount(tx.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- THE NAVIGATION DOCK --- */}
      <div className="fixed bottom-8 left-0 right-0 h-24 z-50 flex items-center justify-center pointer-events-none">
        
        {/* Dock Shell */}
        <div className="absolute w-[92%] h-20 bg-[var(--bg-secondary)]/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl z-10" />
        
        {/* Selection Highlight (Fixed in Center) */}
        <div 
          className="absolute w-16 h-16 rounded-[1.8rem] z-20 border border-white/10" 
          style={{ backgroundColor: 'var(--brand-color)', boxShadow: `0 0 20px -5px var(--brand-color)` }}
        />

        {/* Swipeable Track */}
        <div className="relative z-30 w-full h-full flex items-center justify-center pointer-events-auto">
          <motion.div
            drag="x"
            dragConstraints={{
              left: -((navItems.length - 1) * ITEM_WIDTH),
              right: 0
            }}
            dragElastic={0.2}
            style={{ x: dragX }}
            onDragEnd={handleDragEnd}
            className="flex items-center cursor-grab active:cursor-grabbing"
          >
            {navItems.map((item, index) => {
              const isCenter = activeIndex === index;
              return (
                <div
                  key={item.id}
                  className="w-20 flex-shrink-0 flex flex-col items-center justify-center h-24"
                  onClick={() => {
                    if (isCenter) {
                      haptic.medium();
                      navigate(item.path);
                    }
                  }}
                >
                  <motion.div
                    animate={{ 
                      scale: isCenter ? 1.2 : 0.6, 
                      opacity: isCenter ? 1 : 0.25 
                    }}
                    style={{ color: isCenter ? 'var(--bg-primary)' : 'var(--text-main)' }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  <AnimatePresence>
                    {isCenter && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 32 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bg-[var(--text-main)] px-3 py-1 rounded-full shadow-lg"
                      >
                        <span className="text-[7px] font-black uppercase tracking-widest" style={{ color: 'var(--bg-primary)' }}>
                          {item.label}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;