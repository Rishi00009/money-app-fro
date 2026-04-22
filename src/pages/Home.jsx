import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, User, Settings, History, 
  ArrowUpRight, ArrowDownLeft, Loader2, Eye, EyeOff, Home as HomeIcon
} from 'lucide-react';
import API from '../utils/api'; // Corrected path for pages folder
import { haptic } from '../utils/haptics'; // Corrected path for pages folder

const Home = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isInitialMount = useRef(true);
  
  const [activeIndex, setActiveIndex] = useState(3); // Setting 3 for 'Home' icon position
  const [userName, setUserName] = useState("User"); 
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ balance: 0, income: 0, spend: 0 });
  const [loading, setLoading] = useState(true);
  const [isGhosted, setIsGhosted] = useState(() => localStorage.getItem('ghost-mode') === 'true');
  const [showSensitive, setShowSensitive] = useState(false); 

  const navItems = [
    { id: 'profile', icon: <User size={22} />, path: '/profile', label: 'Profile' },
    { id: 'history', icon: <History size={22} />, path: '/history', label: 'History' },
    { id: 'add', icon: <Plus size={28} />, path: '/add', label: 'Add Entry' },
    { id: 'home', icon: <HomeIcon size={22} />, path: '/home', label: 'Home' },
    { id: 'settings', icon: <Settings size={22} />, path: '/settings', label: 'Settings' },
    { id: 'reports', icon: <Bell size={22} />, path: '/reports', label: 'Reports' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const target = container.querySelectorAll('.nav-scroll-item')[activeIndex];
      if (target) {
        const offset = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
        container.scrollTo({ left: offset });
      }
    }
    setTimeout(() => { isInitialMount.current = false; }, 300);
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current || isInitialMount.current) return;
    const container = scrollRef.current;
    const centerPoint = container.scrollLeft + container.offsetWidth / 2;
    const items = container.querySelectorAll('.nav-scroll-item');
    
    let closestIndex = 0;
    let minDistance = Infinity;

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
      navigate(navItems[closestIndex].path);
    }
  };

  useEffect(() => {
    const fetchTerminalData = async () => {
      try {
        const userRes = await API.get('/auth/me');
        setUserName(userRes.data.name || "User");
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
    fetchTerminalData();
  }, []);

  const formatAmount = (num) => (isGhosted && !showSensitive ? "••••••" : `₹${num.toLocaleString()}`);

  return (
    <div className="relative min-h-screen overflow-x-hidden pb-44" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header and Balance UI code... */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-color)] flex items-center justify-center text-white font-black shadow-xl text-xl">{userName[0]}</div>
          <h1 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{userName}</h1>
        </div>
      </header>

      {/* BALANCE CARD */}
      <section className="px-6 mb-8">
        <div className="p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-white/5 shadow-2xl relative overflow-hidden">
          <p className="text-[10px] uppercase opacity-40 font-black mb-2" style={{ color: 'var(--text-main)' }}>Cycle Liquidity</p>
          <h2 className="text-5xl font-black mb-8 tracking-tighter" style={{ color: 'var(--text-main)' }}>{formatAmount(totals.balance)}</h2>
        </div>
      </section>

      {/* PREMIUM DOCK */}
      <div className="fixed bottom-8 left-0 right-0 h-24 z-50 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[92%] h-20 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 z-10" />
        <div className="absolute w-16 h-16 rounded-[1.8rem] z-20 border border-white/10" style={{ backgroundColor: 'var(--brand-color)' }} />

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative z-30 flex items-center overflow-x-auto no-scrollbar w-full h-full pointer-events-auto"
          style={{ scrollSnapType: 'x mandatory', paddingLeft: 'calc(50% - 40px)', paddingRight: 'calc(50% - 40px)' }}
        >
          {navItems.map((item, index) => {
            const isCenter = activeIndex === index;
            return (
              <div key={item.id} className="nav-scroll-item flex-shrink-0 w-20 flex flex-col items-center justify-center h-full relative" style={{ scrollSnapAlign: 'center' }}>
                <div style={{ color: isCenter ? 'var(--bg-primary)' : 'var(--text-main)', opacity: isCenter ? 1 : 0.3 }}>
                  {item.icon}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;