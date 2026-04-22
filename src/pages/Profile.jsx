import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowLeft, Camera, User, Plus, X, 
  Landmark, Loader2, Mail, Lock, Eye, EyeOff, LogOut, ChevronRight, CalendarDays, ChevronDown 
} from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    password: '', 
    profilePic: '',
    banks: [],
    cycleStartDay: 1
  });

  const dragX = useMotionValue(0);
  const textOpacity = useTransform(dragX, [0, 80], [1, 0]);
  const fillWidth = useTransform(dragX, [0, 220], ["0%", "100%"]);
  const iconColor = useTransform(dragX, [0, 180], ["#41644A", "#E9833D"]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setUserData({
          name: res.data.name || '',
          username: res.data.username || '',
          password: '', 
          profilePic: res.data.profilePic || '',
          banks: res.data.banks || ['Cash (Wallet)'],
          cycleStartDay: res.data.cycleStartDay || 1
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response?.status === 401) navigate('/');
      }
    };
    fetchProfile();
  }, [navigate]);

  // --- Image to Base64 Handler ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB Limit for Base64 storage
        alert("File too large. Maximum 1MB allowed for terminal sync.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({ ...prev, profilePic: reader.result }));
        haptic.light();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    haptic.medium();
    
    const updatePayload = {
      name: userData.name,
      username: userData.username,
      profilePic: userData.profilePic,
      banks: userData.banks,
      cycleStartDay: Number(userData.cycleStartDay)
    };

    if (userData.password && userData.password.trim() !== '') {
      updatePayload.password = userData.password;
    }

    try {
      await API.put('/auth/update', updatePayload);
      setUserData(prev => ({ ...prev, password: '' })); 
      haptic.success();
      alert("Intelligence Protocol Updated");
    } catch (err) {
      haptic.error();
      alert("Sync Failed: Protocol Interrupted");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    haptic.medium();
    localStorage.removeItem('token');
    navigate('/');
  };

  const addBank = (bankName) => {
    const name = bankName || searchTerm.trim();
    if (!name || userData.banks.includes(name)) { setSearchTerm(''); return; }
    haptic.light();
    setUserData(prev => ({ ...prev, banks: [...prev.banks, name] }));
    setSearchTerm('');
  };

  const removeBank = (bank) => {
    haptic.light();
    setUserData(prev => ({ ...prev, banks: prev.banks.filter(b => b !== bank) }));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <Loader2 className="animate-spin text-[var(--brand-color)]" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div className="text-center flex flex-col">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-main)' }}>Intelligence</h1>
          <span className="text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: 'var(--brand-color)' }}>{userData.name}</span>
        </div>
        <button 
          onClick={handleUpdate} 
          disabled={saving}
          className="font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
          style={{ color: 'var(--brand-color)' }}
        >
          {saving ? 'Syncing...' : 'Save'}
        </button>
      </header>

      {/* AVATAR SECTION */}
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[3.5rem] border-2 flex items-center justify-center overflow-hidden shadow-2xl transition-transform active:scale-95" 
               style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--brand-color)' }}>
            {userData.profilePic ? (
              <img src={userData.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={50} className="opacity-20" style={{ color: 'var(--text-main)' }} />
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          
          <button 
            onClick={() => { haptic.light(); fileInputRef.current.click(); }} 
            className="absolute -bottom-2 -right-2 p-4 rounded-2xl shadow-xl active:scale-90 transition-transform"
            style={{ backgroundColor: 'var(--text-main)', color: 'var(--brand-color)' }}
          >
            <Camera size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <section className="px-8 space-y-8">
        
        {/* CYCLE DAY */}
        <div className="border-b-2 pb-3 transition-colors" style={{ borderColor: 'var(--text-main)', opacity: 0.6 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Monthly Cycle Start Day</label>
          <div className="flex items-center gap-4">
            <CalendarDays size={18} style={{ color: 'var(--brand-color)' }} />
            <select 
              className="bg-transparent outline-none w-full font-bold text-lg appearance-none"
              style={{ color: 'var(--text-main)' }}
              value={userData.cycleStartDay}
              onChange={(e) => setUserData({...userData, cycleStartDay: e.target.value})}
            >
              {[...Array(28)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="text-black">Day {i + 1}</option>
              ))}
            </select>
            <ChevronDown size={14} className="opacity-30" style={{ color: 'var(--text-main)' }} />
          </div>
        </div>

        {/* NAME */}
        <div className="border-b-2 pb-3 transition-colors" style={{ borderColor: 'var(--text-main)', opacity: 0.6 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Legal Identity</label>
          <div className="flex items-center gap-4">
            <User size={18} style={{ color: 'var(--brand-color)' }} />
            <input className="bg-transparent outline-none w-full font-bold text-lg" style={{ color: 'var(--text-main)' }} value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
          </div>
        </div>

        {/* USERNAME */}
        <div className="border-b-2 pb-3 transition-colors" style={{ borderColor: 'var(--text-main)', opacity: 0.6 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Handle / Alias</label>
          <div className="flex items-center gap-4">
            <Mail size={18} style={{ color: 'var(--brand-color)' }} />
            <input className="bg-transparent outline-none w-full font-bold text-lg" style={{ color: 'var(--text-main)' }} value={userData.username} onChange={(e) => setUserData({...userData, username: e.target.value})} />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="border-b-2 pb-3 transition-colors" style={{ borderColor: 'var(--text-main)', opacity: 0.6 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Change Security Key</label>
          <div className="flex items-center gap-4">
            <Lock size={18} style={{ color: 'var(--brand-color)' }} />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Leave blank to keep current"
              className="bg-transparent outline-none w-full font-bold text-lg" 
              style={{ color: 'var(--text-main)' }}
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
            />
            <button onClick={() => { haptic.light(); setShowPassword(!showPassword); }} className="opacity-30" style={{ color: 'var(--text-main)' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* BANKS */}
        <div className="space-y-4">
          <label className="text-[9px] uppercase font-black tracking-widest block opacity-40" style={{ color: 'var(--text-main)' }}>Linked Global Accounts</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Add Bank..."
              className="w-full p-5 pr-14 rounded-[2rem] outline-none text-xs font-bold border-2"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', borderColor: 'var(--bg-primary)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBank()}
            />
            <button onClick={() => addBank()} className="absolute right-3 p-2.5 rounded-2xl" style={{ backgroundColor: 'var(--text-main)', color: 'var(--brand-color)' }}><Plus size={20} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {userData.banks.map((bank) => (
                <motion.div key={bank} initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-sm border border-black/5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <Landmark size={12} style={{ color: 'var(--brand-color)' }} />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>{bank}</span>
                  <button onClick={() => removeBank(bank)} className="opacity-20" style={{ color: 'var(--text-main)' }}><X size={12} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="pt-12">
          <div className="relative h-20 w-full rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
            <motion.div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{ width: fillWidth, backgroundColor: 'var(--brand-color)', opacity: 0.2 }} />
            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-main)' }}>
              Swipe to Logout <ChevronRight size={14} className="animate-pulse ml-2" />
            </motion.div>
            <motion.div
              drag="x" dragConstraints={{ left: 0, right: 220 }} dragElastic={0.05} style={{ x: dragX }}
              onDragStart={() => haptic.light()} onDragEnd={(_, info) => { if (info.offset.x > 180) handleLogout(); else { haptic.light(); dragX.set(0); } }}
              className="z-10 w-24 h-16 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2"
              style={{ borderRadius: '2rem', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}
            >
              <motion.div style={{ color: iconColor }}><LogOut size={26} strokeWidth={2.5} /></motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;