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

  // --- Theme-Linked Animation Logic ---
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 150], [1, 0]);
  
  // Color transition: Moss Green (#41644A) -> Sunset Orange (#E9833D)
  const iconColor = useTransform(x, [0, 180], ["#41644A", "#E9833D"]);
  
  // Swipe fill width based on handle position
  const bgWidth = useTransform(x, [0, 220], ["0px", "260px"]);

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
      alert("Sync Failed: System error or connection lost.");
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
      
      {/* 1. HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center border-b border-black/5" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '0 0 3rem 3rem' }}>
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/5 active:scale-90 transition-transform">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Security Terminal</h1>
        <button 
          onClick={handleUpdate} 
          disabled={saving}
          className="font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
          style={{ color: 'var(--brand-color)' }}
        >
          {saving ? 'Syncing...' : 'Save'}
        </button>
      </header>

      {/* 2. AVATAR SECTION */}
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="relative">
          <div className="w-32 h-32 rounded-[3rem] border-2 flex items-center justify-center overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--brand-color)' }}>
            {(imagePreview || userData.profilePic) ? (
              <img src={imagePreview || userData.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={50} className="opacity-20" style={{ color: 'var(--text-main)' }} />
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*"/>
          <button 
            onClick={() => { haptic.light(); fileInputRef.current.click(); }} 
            className="absolute -bottom-1 -right-1 p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"
            style={{ backgroundColor: 'var(--text-main)', color: 'var(--brand-color)' }}
          >
            <Camera size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <section className="px-8 space-y-8">
        {/* Identity Inputs */}
        {[
          { label: 'Legal Identity', icon: <User size={18} />, key: 'name' },
          { label: 'Handle / Alias', icon: <Mail size={18} />, key: 'username' }
        ].map((field) => (
          <div key={field.key} className="border-b-2 pb-3 transition-colors" style={{ borderColor: 'var(--text-main)', opacity: 0.6 }}>
            <label className="text-[9px] uppercase font-black tracking-widest block mb-2 opacity-40" style={{ color: 'var(--text-main)' }}>{field.label}</label>
            <div className="flex items-center gap-4">
              <span style={{ color: 'var(--brand-color)' }}>{field.icon}</span>
              <input 
                className="bg-transparent outline-none w-full font-bold text-lg" 
                style={{ color: 'var(--text-main)' }}
                value={userData[field.key]} 
                onChange={(e) => setUserData({...userData, [field.key]: e.target.value})} 
              />
            </div>
          </div>
        ))}

        {/* Account Management */}
        <div className="space-y-4 pt-4">
          <label className="text-[9px] uppercase font-black tracking-widest block opacity-40" style={{ color: 'var(--text-main)' }}>Linked Global Accounts</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Search or Add Any Bank..."
              className="w-full p-5 pr-14 rounded-[2rem] outline-none text-xs font-bold border-2 transition-all shadow-inner"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', borderColor: 'var(--bg-primary)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBank()}
            />
            <button 
              onClick={() => addBank()} 
              className="absolute right-3 p-2.5 rounded-2xl active:scale-90 transition-transform shadow-md"
              style={{ backgroundColor: 'var(--text-main)', color: 'var(--brand-color)' }}
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-sm border border-black/5"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <Landmark size={12} style={{ color: 'var(--brand-color)' }} />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>{bank}</span>
                  <button onClick={() => removeBank(bank)} className="ml-1 opacity-20 hover:opacity-100 transition-opacity" style={{ color: 'var(--text-main)' }}>
                    <X size={12} strokeWidth={4} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- 3. PILL SWIPE TO LOGOUT --- */}
        <div className="pt-12">
          <label className="text-[9px] uppercase font-black tracking-widest block mb-4 text-center opacity-30" style={{ color: 'var(--text-main)' }}>System Security</label>
          
          <div className="relative w-full h-20 rounded-[2.5rem] flex items-center p-2 overflow-hidden border-2 shadow-inner" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--bg-primary)' }}>
            
            {/* Hint Text */}
            <motion.div 
              style={{ opacity }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 opacity-40" style={{ color: 'var(--text-main)' }}>
                Swipe to Logout <ChevronRight size={14} className="animate-pulse" />
              </span>
            </motion.div>

            {/* Sunset Orange Swipe Fill */}
            <motion.div 
               className="absolute left-0 top-0 bottom-0 pointer-events-none"
               style={{ width: bgWidth, backgroundColor: 'rgba(233, 131, 61, 0.1)' }} 
            />

            {/* PILL HANDLE */}
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
                  x.set(0); 
                }
              }}
              className="z-10 w-24 h-16 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing border-2"
              style={{ 
                borderRadius: '2rem',
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--bg-primary)'
              }}
            >
              <motion.div style={{ color: iconColor }}>
                <LogOut size={26} strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;