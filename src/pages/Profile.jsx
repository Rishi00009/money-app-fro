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
  
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    password: '',
    profilePic: '',
    banks: []
  });

  // --- Swipe to Logout Logic ---
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 150], [1, 0]);
  const iconColor = useTransform(x, [0, 150], ["#94a3b8", "#ef4444"]);
  const bgWidth = useTransform(x, [0, 220], ["0%", "100%"]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setUserData({
          name: res.data.name || '',
          username: res.data.username || '',
          password: '',
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      haptic.light();
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 400; 
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, size, size);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setImagePreview(compressedBase64);
          setUserData(prev => ({ ...prev, profilePic: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    haptic.medium();
    try {
      await API.put('/auth/update', userData);
      setUserData(prev => ({ ...prev, password: '' }));
      haptic.success();
    } catch (err) {
      haptic.error();
      alert("Sync Failed: Check connection or file size");
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-lime-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 bg-[#F8F9FA] transition-colors duration-500">
      
      {/* Header */}
      <header className="p-6 pt-12 flex justify-between items-center bg-white rounded-b-[3rem] shadow-sm border-b border-black/[0.03]">
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 active:scale-90 transition-transform">
          <ArrowLeft size={24} className="text-slate-900" />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Security Terminal</h1>
        <button 
          onClick={handleUpdate} 
          disabled={saving}
          className="text-lime-600 font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
        >
          {saving ? 'Syncing...' : 'Save'}
        </button>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3rem] bg-white border-2 border-lime-400 flex items-center justify-center overflow-hidden shadow-2xl">
            {(imagePreview || userData.profilePic) ? (
              <img src={imagePreview || userData.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={50} className="text-slate-100" />
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*"/>
          <button 
            onClick={() => { haptic.light(); fileInputRef.current.click(); }} 
            className="absolute -bottom-1 -right-1 p-3 bg-slate-900 rounded-2xl text-lime-400 shadow-lg active:scale-90 transition-transform"
          >
            <Camera size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <section className="px-8 space-y-8">
        {/* Name */}
        <div className="border-b-2 border-slate-100 pb-3 focus-within:border-lime-400 transition-colors">
          <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2">Legal Identity</label>
          <div className="flex items-center gap-4">
            <User size={18} className="text-lime-500" />
            <input 
              className="bg-transparent outline-none w-full font-bold text-lg text-slate-800" 
              value={userData.name} 
              onChange={(e) => setUserData({...userData, name: e.target.value})} 
            />
          </div>
        </div>

        {/* Username */}
        <div className="border-b-2 border-slate-100 pb-3 focus-within:border-lime-400 transition-colors">
          <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2">Handle / Alias</label>
          <div className="flex items-center gap-4">
            <Mail size={18} className="text-lime-500" />
            <input 
              className="bg-transparent outline-none w-full font-bold text-lg text-slate-800" 
              value={userData.username} 
              onChange={(e) => setUserData({...userData, username: e.target.value})} 
            />
          </div>
        </div>

        {/* Password */}
        <div className="border-b-2 border-slate-100 pb-3 focus-within:border-lime-400 transition-colors">
          <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-2">Reset Security Key</label>
          <div className="flex items-center gap-4">
            <Lock size={18} className="text-lime-500" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="bg-transparent outline-none w-full font-bold text-lg text-slate-800" 
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
            />
            <button onClick={() => { haptic.light(); setShowPassword(!showPassword); }} className="text-slate-300">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Bank Management */}
        <div className="space-y-4 pt-4">
          <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Linked Global Accounts</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Add Bank or Wallet..."
              className="w-full bg-white border-2 border-slate-100 p-5 pr-14 rounded-[2rem] outline-none text-xs font-bold text-slate-800 focus:border-lime-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBank()}
            />
            <button 
              onClick={() => addBank()} 
              className="absolute right-3 p-2.5 bg-slate-900 rounded-2xl text-lime-400 active:scale-90 transition-transform"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {userData.banks.map((bank) => (
                <motion.div 
                  key={bank} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm"
                >
                  <Landmark size={12} className="text-lime-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">{bank}</span>
                  <button onClick={() => removeBank(bank)} className="ml-1 text-slate-300 hover:text-rose-500 transition-colors">
                    <X size={12} strokeWidth={4} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Swipe to Logout --- */}
        <div className="pt-12">
          <label className="text-[9px] uppercase font-black tracking-widest text-slate-300 block mb-4 text-center">System Security</label>
          
          <div className="relative w-full h-20 bg-slate-100 rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 border-white shadow-inner">
            
            <motion.div 
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                Swipe to Logout <ChevronRight size={14} className="animate-pulse" />
              </span>
            </motion.div>

            <motion.div 
               className="absolute left-0 top-0 bottom-0 bg-rose-500/5 pointer-events-none"
               style={{ width: bgWidth }}
            />

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 220 }}
              dragElastic={0.1}
              style={{ x }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 180) {
                  handleLogout();
                } else {
                  haptic.light();
                  x.set(0); // Snap back
                }
              }}
              className="z-10 w-16 h-16 bg-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing border border-slate-50"
              style={{ 
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
              }}
            >
              <motion.div style={{ color: iconColor }}>
                <LogOut size={24} strokeWidth={3} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;