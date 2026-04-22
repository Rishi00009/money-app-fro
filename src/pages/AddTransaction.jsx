import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronDown, ArrowRight, Check, Delete, Loader2 } from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const AddTransaction = () => {
  const navigate = useNavigate();
  
  const [type, setType] = useState('spend'); 
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [userBanks, setUserBanks] = useState(['Cash (Wallet)']);
  const [selectedBank, setSelectedBank] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Animation Values ---
  const dragX = useMotionValue(0);
  
  // 1. Swipe color fill: Matches swiped area to brand color
  const swipeWidth = useTransform(dragX, [0, 280], ["0%", "100%"]);
  const textOpacity = useTransform(dragX, [0, 100], [0.3, 0]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.banks?.length > 0) {
          setUserBanks(res.data.banks);
          setSelectedBank(res.data.banks[0]);
        }
      } catch (err) { console.error(err); }
    };
    fetchAccounts();
  }, []);

  const handleNumberClick = (num) => { 
    haptic.light(); 
    if (amount.length < 10) setAmount(prev => prev + num); 
  };

  const handleBackspace = () => {
    haptic.light();
    setAmount(prev => prev.slice(0, -1));
  };

  const handleConfirm = async () => {
    if (!amount || !category || (category === 'Others' && !customCategory) || loading) {
      haptic.error();
      dragX.set(0); 
      return;
    }
    setLoading(true);
    try {
      await API.post('/transactions/add', {
        type, amount: Number(amount), bank: selectedBank,
        category: category === 'Others' ? customCategory : category,
      }); 
      haptic.success();
      setIsConfirmed(true);
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      haptic.error();
      setLoading(false);
      dragX.set(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <X size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div className="flex p-1 rounded-2xl border border-black/5 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <button onClick={() => { haptic.medium(); setType('spend'); }} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'spend' ? 'bg-rose-500 text-white' : 'opacity-20'}`}>SPEND</button>
          <button onClick={() => { haptic.medium(); setType('income'); }} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'income' ? 'bg-emerald-500 text-white' : 'opacity-20'}`}>INCOME</button>
        </div>
        <div className="w-10"></div>
      </header>

      {/* AMOUNT DISPLAY WITH BACKLIGHT */}
      <div className="flex-1 flex flex-col px-8 pt-4 justify-center relative">
        <div className="text-center relative">
          <AnimatePresence>
            {amount.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.2, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 blur-[80px] rounded-full w-40 h-40 mx-auto pointer-events-none"
                style={{ backgroundColor: 'var(--brand-color)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex flex-col items-center">
            <p className="text-[10px] uppercase tracking-[0.5em] mb-4 opacity-30 font-black" style={{ color: 'var(--text-main)' }}>Terminal Entry</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black" style={{ color: 'var(--brand-color)' }}>₹</span>
              <h1 className="text-7xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>
                {amount || '0'}
              </h1>
            </div>
          </div>
        </div>

        {/* INPUT FIELDS */}
        <div className="mt-12 space-y-6">
          <div className="border-b-2 pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.1 }}>
            <select 
              className="w-full bg-transparent outline-none font-bold text-lg appearance-none" 
              style={{ color: 'var(--text-main)' }} 
              value={selectedBank} 
              onChange={(e) => { haptic.light(); setSelectedBank(e.target.value); }}
            >
              {userBanks.map(bank => <option key={bank} value={bank} className="text-black">{bank}</option>)}
            </select>
          </div>

          <div className="border-b-2 pb-2" style={{ borderColor: 'var(--text-main)', opacity: 0.1 }}>
            <select 
              className="w-full bg-transparent outline-none font-bold text-lg appearance-none" 
              style={{ color: 'var(--text-main)' }} 
              value={category} 
              onChange={(e) => { haptic.light(); setCategory(e.target.value); }}
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* NUMPAD & SWIPE AREA */}
      <div className="p-6 rounded-t-[3.5rem] border-t shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
        <div className="grid grid-cols-3 gap-y-2 mb-8 text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
            <button 
              key={num} 
              onClick={() => handleNumberClick(num.toString())} 
              className="py-4 text-3xl font-black active:scale-75 transition-transform" 
              style={{ color: 'var(--text-main)' }}
            >{num}</button>
          ))}
          <button onClick={handleBackspace} className="py-4 flex items-center justify-center opacity-30 active:scale-75"><Delete size={28} style={{ color: 'var(--text-main)' }} /></button>
        </div>

        {/* SWIPE TO COMMIT - AREA COLOR CHANGES ON SWIPE */}
        <div className="relative h-20 w-full rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 shadow-inner" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--bg-secondary)' }}>
          
          {/* THE SWIPE FILL AREA */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 pointer-events-none"
            style={{ width: swipeWidth, backgroundColor: 'var(--brand-color)' }}
          />

          <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-main)' }}>
            {loading ? 'SYNCING...' : 'Swipe to Commit'}
          </motion.div>
          
          <motion.div
            drag="x" 
            dragConstraints={{ left: 0, right: 280 }} 
            dragSnapToOrigin={!isConfirmed}
            style={{ x: dragX }}
            onDragStart={() => haptic.light()}
            onDragEnd={(e, info) => { 
              if (info.offset.x > 220 && !loading) handleConfirm();
              else { haptic.light(); dragX.set(0); }
            }}
            className="z-10 h-16 w-16 rounded-[2rem] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl"
            style={{ backgroundColor: isConfirmed ? '#10b981' : 'var(--bg-secondary)' }}
          >
            {isConfirmed ? (
              <Check className="text-white" size={32} strokeWidth={4} />
            ) : loading ? (
              <Loader2 className="animate-spin" size={28} style={{ color: 'var(--brand-color)' }} />
            ) : (
              <ArrowRight style={{ color: 'var(--brand-color)' }} size={32} strokeWidth={3} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;