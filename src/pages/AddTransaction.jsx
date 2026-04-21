import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ArrowRight, Check, Delete } from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics'; // Optimized haptic utility

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

  const categories = ['Salary', 'Food', 'Rent', 'Transport', 'Cloths', 'Grocery', 'Returnable', 'Returned', 'Electronics', 'Others'];

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await API.get('/auth/me');
        if (res.data.banks && res.data.banks.length > 0) {
          setUserBanks(res.data.banks);
          setSelectedBank(res.data.banks[0]);
        }
      } catch (err) {
        console.error("Account fetch failed", err);
      }
    };
    fetchAccounts();
  }, []);

  // Handlers
  const handleNumberClick = (num) => { 
    haptic.light(); // Pixel mechanical click
    if (amount.length < 10) setAmount(prev => prev + num); 
  };

  const handleBackspace = () => {
    haptic.light();
    setAmount(prev => prev.slice(0, -1));
  };

  const handleConfirm = async () => {
    if (!amount || !category || (category === 'Others' && !customCategory) || loading) {
      haptic.error(); // Triple pulse for validation error
      return;
    }
    
    setLoading(true);
    const transactionData = {
      type,
      amount: Number(amount),
      bank: selectedBank,
      category: category === 'Others' ? customCategory : category,
    };

    try {
      await API.post('/transactions/add', transactionData); 
      haptic.success(); // Secure double-tap feedback
      setIsConfirmed(true);
      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      haptic.error();
      alert("Save Failed: Check Server Connection");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden select-none" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <button 
          onClick={() => { haptic.light(); navigate('/home'); }} 
          className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] active:scale-90 transition-transform"
        >
          <X size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-black/[0.05] shadow-inner">
          <button 
            onClick={() => { haptic.medium(); setType('spend'); }} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'spend' ? 'bg-rose-500 text-white shadow-lg' : 'opacity-20'}`}
          >
            SPEND
          </button>
          <button 
            onClick={() => { haptic.medium(); setType('income'); }} 
            className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'opacity-20'}`}
          >
            INCOME
          </button>
        </div>
        <div className="w-10"></div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col px-8 pt-4">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] mb-2 opacity-30 font-bold" style={{ color: 'var(--text-main)' }}>Entry Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-light opacity-30" style={{ color: 'var(--brand-color)' }}>₹</span>
            <h1 className="text-6xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>
              {amount || '0'}
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Selection */}
          <div className="relative border-b border-black/[0.05] pb-2">
            <label className="text-[9px] uppercase tracking-widest font-black opacity-30 mb-2 block" style={{ color: 'var(--text-main)' }}>Source / Account</label>
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

          {/* Category Selection */}
          <div className="relative border-b border-black/[0.05] pb-2">
            <label className="text-[9px] uppercase tracking-widest font-black opacity-30 mb-2 block" style={{ color: 'var(--text-main)' }}>Reason Category</label>
            <select 
              className="w-full bg-transparent outline-none font-bold text-lg appearance-none" 
              style={{ color: 'var(--text-main)' }} 
              value={category} 
              onChange={(e) => { haptic.light(); setCategory(e.target.value); }}
            >
              <option value="" disabled>Select Category</option>
              {categories.map(cat => <option key={cat} value={cat} className="text-black">{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-0 bottom-3 opacity-20 pointer-events-none" size={16} />
          </div>

          {/* Custom Category Field */}
          <AnimatePresence>
            {category === 'Others' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <input 
                  type="text"
                  placeholder="Type manual reason..."
                  className="w-full bg-black/[0.03] border border-black/[0.05] p-4 rounded-2xl outline-none font-bold text-sm"
                  style={{ color: 'var(--text-main)' }}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. NUMPAD & SLIDER */}
      <div className="p-6 bg-black/[0.02] rounded-t-[3rem] border-t border-black/[0.03]">
        <div className="grid grid-cols-3 gap-y-2 gap-x-12 mb-8 text-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
            <button 
              key={num} 
              onClick={() => handleNumberClick(num.toString())} 
              className="py-4 text-2xl font-bold active:scale-90 transition-transform active:text-[var(--brand-color)]" 
              style={{ color: 'var(--text-main)' }}
            >
              {num}
            </button>
          ))}
          <button 
            onClick={handleBackspace} 
            className="py-4 flex items-center justify-center opacity-30 active:scale-75 transition-transform"
          >
            <Delete size={24} />
          </button>
        </div>

        {/* Swipe to Commit Slider */}
        <div className="relative h-18 w-full bg-black/[0.05] rounded-[2.5rem] flex items-center px-2 group">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-[9px] font-black uppercase tracking-[0.4em]">
            {isConfirmed ? 'Transaction Authorized' : loading ? 'Processing Security...' : 'Swipe to Commit Entry'}
          </div>
          
          <motion.div
            drag="x" 
            dragConstraints={{ left: 0, right: 280 }} 
            dragSnapToOrigin={!isConfirmed}
            onDragStart={() => haptic.light()}
            onDragEnd={(e, info) => { 
              if (info.offset.x > 220 && !loading) {
                handleConfirm();
              }
            }}
            className="z-10 h-14 w-14 rounded-[2rem] flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl transition-colors"
            style={{ backgroundColor: isConfirmed ? '#10b981' : 'var(--brand-color)' }}
          >
            <AnimatePresence mode="wait">
              {isConfirmed ? (
                <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="text-white" size={28} strokeWidth={4} />
                </motion.div>
              ) : (
                <motion.div key="arrow" animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight className="text-[var(--brand-text)]" size={28} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;