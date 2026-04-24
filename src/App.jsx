import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, User, Settings, History, Home as HomeIcon } from 'lucide-react';
import './App.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import HistoryPage from './pages/History';
import Reports from './pages/Reports';
import Creator from './pages/Creator';
import LockScreen from './pages/LockScreen';

import { haptic } from './utils/haptics';

// --- THEME ORCHESTRATOR ---
const ThemeOrchestrator = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--brand-color', theme.brand);
        root.style.setProperty('--bg-primary', theme.bgPrimary);
        root.style.setProperty('--bg-secondary', theme.bgSecondary || theme.bgPrimary);
        root.style.setProperty('--text-main', theme.textMain);
        root.style.setProperty('--brand-text', theme.brandText || '#FFFFFF');
      } catch (err) {
        console.error("Theme Sync Error:", err);
      }
    }
  }, []);
  return null;
};

// --- NAVIGATION DOCK COMPONENT ---
const GlobalDock = ({ activeIndex, setActiveIndex }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const isInitialMount = useRef(true);

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
  }, [activeIndex]);

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

  if (location.pathname === '/' || location.pathname === '/register') return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 h-24 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute w-[92%] h-20 bg-[var(--bg-secondary)]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl z-10" />
      <div className="absolute w-16 h-16 rounded-[1.8rem] z-20 border border-white/10" style={{ backgroundColor: 'var(--brand-color)' }} />
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-30 flex items-center overflow-x-auto no-scrollbar w-full h-full pointer-events-auto"
        style={{ scrollSnapType: 'x mandatory', paddingLeft: 'calc(50% - 40px)', paddingRight: 'calc(50% - 40px)' }}
      >
        {navItems.map((item, index) => (
          <div key={item.id} className="nav-scroll-item flex-shrink-0 w-20 flex flex-col items-center justify-center h-full relative" style={{ scrollSnapAlign: 'center' }}>
            <motion.div animate={{ scale: activeIndex === index ? 1.1 : 0.7, opacity: activeIndex === index ? 1 : 0.3 }} style={{ color: activeIndex === index ? 'var(--bg-primary)' : 'var(--text-main)' }}>
              {item.icon}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- APP CONTENT GATEKEEPER ---
const AppContent = () => {
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('security-enabled') === 'true');
  const [activeIndex, setActiveIndex] = useState(3);

  // Home App Feature: Re-lock when app is minimized/closed
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('security-enabled') === 'true') {
        setIsLocked(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const handleUnlock = () => {
    haptic.medium();
    setIsLocked(false);
  };

  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  return (
    <>
      <ThemeOrchestrator />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <>
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/add" element={<AddTransaction />} /> 
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/creator" element={<Creator />} />
            </Routes>
            <GlobalDock activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
          </>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;