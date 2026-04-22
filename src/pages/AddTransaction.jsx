import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X, ChevronDown, ArrowRight, Check, Delete, Loader2 } from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const AddTransaction = () => {
  const navigate = useNavigate();
  
  // State
  const [type, setType] = useState('spend'); 
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [userBanks, setUserBanks] = useState(['Cash (Wallet)']);
  const [selectedBank, setSelectedBank] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Animation Values for Swipe ---
  const dragX = useMotionValue(0);
  // Transition from soft gray to Brand color as user swipes
  const sliderBg = useTransform(dragX, [0, 200], ['rgba(0,0,0,0.05)', 'var(--brand-color)']);
  const textOpacity = useTransform(dragX, [0, 100], [0.2, 0]);

  const categories = ['Salary', 'Food', 'Rent', 'Transport', 'Cloths', 'Grocery', 'Returnable', 'Returned', 'Electronics', 'Others'];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.banks && res.data.banks.length > 0) {
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
      dragX.set(0); // Snap back on validation failure
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/transactions/add', {
        type,
        amount: Number(amount),
        bank: selectedBank,
        category: category === 'Others' ? customCategory : category,
      }); 
      haptic.success();
      setIsConfirmed(true);
      setTimeout(() => navigate('/home'), 1200);
    } catch (err) {
      haptic.error();
      alert("Sync Error");
      setLoading(false);
      dragX.set(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <button 
          onClick={() => { haptic.light(); navigate('/home'); }} 
          className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05]"
        >
          <X size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-black/[0.05]">
          <button 
            onClick={() => { haptic.medium(); setType('spend'); }} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'spend' ? 'bg-rose-500 text-white shadow-lg' : 'opacity-20'}`}
          >SPEND</button>
          <button 
            onClick={() => { haptic.medium(); setType('income'); }} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-20'}`}
          >INCOME</button>
        </div>
        <div className="w-10"></div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col px-8 pt-4">
        {/* AMOUNT WITH BACKLIGHT */}
        <div className="text-center mb-10 relative">
          {/* Backlight Glow effect */}
          <AnimatePresence>
            {amount.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.15, scale: 1.2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 blur-[60px] rounded-full self-center justify-self-center w-32 h-32 mx-auto pointer-events-none"
                style={{ backgroundColor: 'var(--brand-color)' }}
              />
            )}
          </AnimatePresence>

          <p className="text-[10px] uppercase tracking-[0.4em] mb-2 opacity-30 font-black" style={{ color: 'var(--text-main)' }}>Terminal Entry</p>
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="text-4xl font-black" style={{ color: 'var(--brand-color)' }}>₹</span>
            <motion.h1 
              key={amount}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-7xl font-black tracking-tighter" 
              style={{ color: 'var(--text-main)' }}
            >
              {amount || '0'}
            </motion.h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative border-b-2 border-black/[0.05] pb-2">
            <label className="text-[9px] uppercase tracking-widest font-black opacity-30 mb-2 block" style={{ color: 'var(--text-main)' }}>Account</label>
            <select 
              className="w-full bg-transparent outline-none font-bold text-lg appearance-none" 
              style={{ color: 'var(--text-main)' }} 
              value={selectedBank} 
              onChange={(e) => { haptic.light(); setSelectedBank(e.target.value); }}
            >
              {userBanks.map(bank => <option key={bank} value={bank} className="text-black">{bank}</option>)}
            </select>
            <ChevronDown className="absolute right-0 bottom-3 opacity-20 pointer-events-none" size={16} />
          </div>

          <div className="relative border-b-2 border-black/[0.05] pb-2">
            <label className="text-[9px] uppercase tracking-widest font-black opacity-30 mb-2 block" style={{ color: 'var(--text-main)' }}>Category</label>
            <select 
              className="w-full bg-transparent outline-none font-bold text-lg appearance-none" 
              style={{ color: 'var(--text-main)' }} 
              value={category} 
              onChange={(e) => { haptic.light(); setCategory(e.target.value); }}
            >
              <option value="" disabled>Select</option>
              {categories.map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-0 bottom-3 opacity-20 pointer-events-none" size={16} />
          </div>

          {category === 'Others' && (
            <motion.input 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              type="text" placeholder="Reason..."
              className="w-full bg-black/[0.03] p-4 rounded-2xl outline-none font-bold text-sm"
              style={{ color: 'var(--text-main)' }}
              value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* 3. NUMPAD & DYNAMIC SLIDER */}
      <div className="p-6 bg-black/[0.02] rounded-t-[3rem] border-t border-black/[0.05]">
        <div className="grid grid-cols-3 gap-y-1 mb-8 text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
            <button 
              key={num} 
              onClick={() => handleNumberClick(num.toString())} 
              className="py-4 text-3xl font-black active:scale-75 transition-transform" 
              style={{ color: 'var(--text-main)' }}
            >{num}</button>
          ))}
          <button onClick={handleBackspace} className="py-4 flex items-center justify-center opacity-20 active:scale-75"><Delete size={28} /></button>
        </div>

        {/* SWIPE TO COMMIT WITH DYNAMIC BG */}
        <motion.div 
          style={{ backgroundColor: sliderBg }}
          className="relative h-20 w-full rounded-[2.5rem] flex items-center px-2 overflow-hidden border-2 border-black/5"
        >
          <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            {loading ? 'Authorizing...' : 'Swipe to Commit'}
          </motion.div>
          
          <motion.div
            drag="x" 
            dragConstraints={{ left: 0, right: 280 }} 
            dragSnapToOrigin={!isConfirmed}
            style={{ x: dragX }}
            onDragStart={() => haptic.light()}
            onDragEnd={(e, info) => { 
              if (info.offset.x > 220 && !loading) handleConfirm();
              else haptic.light();
            }}
            className="z-10 h-16 w-16 rounded-[2rem] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-colors"
            style={{ backgroundColor: isConfirmed ? '#10b981' : 'var(--bg-secondary)' }}
          >
            <AnimatePresence mode="wait">
              {isConfirmed ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="text-white" size={32} strokeWidth={4} />
                </motion.div>
              ) : loading ? (
                <Loader2 className="animate-spin text-[var(--brand-color)]" size={28} />
              ) : (
                <ArrowRight style={{ color: 'var(--brand-color)' }} size={32} strokeWidth={3} />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddTransaction;