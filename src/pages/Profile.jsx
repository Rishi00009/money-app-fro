import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  ArrowLeft, Camera, User, Plus, X, 
  Landmark, Loader2, Mail, Lock, Eye, EyeOff, LogOut, ChevronRight 
} from 'lucide-react';
import API from '../utils/api';
import { haptic } from '../utils/haptics';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    password: '', // New password field
    profilePic: '',
    banks: []
  });

  // --- Animation Logic ---
  const x = useMotionValue(0);
  const textOpacity = useTransform(x, [0, 100], [1, 0]);
  const bgWidth = useTransform(x, [0, 220], ["0%", "100%"]);
  // Icon shifts from main text color to a "warning" state (Red/Orange)
  const iconColor = useTransform(x, [0, 180], ["#94a3b8", "#ef4444"]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setUserData({
          name: res.data.name || '',
          username: res.data.username || '',
          password: '', // Keep empty for security
          profilePic: res.data.profilePic || '',
          banks: res.data.banks || ['Cash (Wallet)']
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err.response?.status === 401) navigate('/');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleUpdate = async () => {
    setSaving(true);
    haptic.medium();
    
    // Prepare the update payload
    const updatePayload = {
      name: userData.name,
      username: userData.username,
      profilePic: userData.profilePic,
      banks: userData.banks
    };

    // Only send password if the user actually typed a new one
    if (userData.password && userData.password.trim() !== '') {
      updatePayload.password = userData.password;
    }

    try {
      await API.put('/auth/update', updatePayload);
      setUserData(prev => ({ ...prev, password: '' })); // Clear password field after save
      haptic.success();
      alert("Profile and Security Key Synchronized");
    } catch (err) {
      haptic.error();
      alert(err.response?.data?.msg || "Update Failed");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"><Loader2 className="animate-spin text-[var(--brand-color)]" size={32} /></div>;

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Header */}
      <header className="p-6 pt-12 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => navigate('/home')} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Identity Terminal</h1>
        <button 
          onClick={handleUpdate} 
          disabled={saving}
          className="font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
          style={{ color: 'var(--brand-color)' }}
        >
          {saving ? 'Syncing...' : 'Save'}
        </button>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3rem] border-2 flex items-center justify-center overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--brand-color)' }}>
            {(imagePreview || userData.profilePic) ? (
              <img src={imagePreview || userData.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={50} className="opacity-20" style={{ color: 'var(--text-main)' }} />
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {/* existing image logic */}} />
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="absolute -bottom-1 -right-1 p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"
            style={{ backgroundColor: 'var(--text-main)', color: 'var(--brand-color)' }}
          >
            <Camera size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <section className="px-8 space-y-8">
        {/* Name Field */}
        <div className="border-b-2 pb-3" style={{ borderColor: 'var(--text-main)', opacity: 0.8 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Legal Identity</label>
          <div className="flex items-center gap-4">
            <User size={18} style={{ color: 'var(--brand-color)' }} />
            <input className="bg-transparent outline-none w-full font-bold text-lg" style={{ color: 'var(--text-main)' }} value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
          </div>
        </div>

        {/* Password Reset Field - FIXED */}
        <div className="border-b-2 pb-3" style={{ borderColor: 'var(--text-main)', opacity: 0.8 }}>
          <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>Update Security Key</label>
          <div className="flex items-center gap-4">
            <Lock size={18} style={{ color: 'var(--brand-color)' }} />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
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

        {/* Bank Management */}
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

        {/* --- THEME-BASED SWIPE LOGOUT --- */}
        <div className="pt-12">
          <label className="text-[9px] uppercase font-black tracking-widest block mb-4 text-center opacity-30" style={{ color: 'var(--text-main)' }}>Session Security</label>
          <div className="relative h-20 w-full rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
            
            {/* THEME FILL: Uses the brand color (Forest Deep Green) with opacity */}
            <motion.div 
              className="absolute left-0 top-0 bottom-0 pointer-events-none"
              style={{ width: bgWidth, backgroundColor: 'var(--brand-color)', opacity: 0.15 }}
            />

            <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-main)' }}>
              Swipe to Logout <ChevronRight size={14} className="animate-pulse ml-2" />
            </motion.div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 220 }}
              dragElastic={0.05}
              style={{ x }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 180) handleLogout();
                else { haptic.light(); x.set(0); }
              }}
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