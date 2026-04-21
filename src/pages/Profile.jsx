import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Camera, User, Check, Plus, X, 
  Landmark, Loader2, ChevronRight, Mail, Lock, Eye, EyeOff 
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
    password: '',
    profilePic: '',
    banks: []
  });

  const indianBanks = [
    "State Bank of India (SBI)", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
    "Airtel Payments Bank", "Paytm Payments Bank", "Cash (Wallet)"
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setUserData({
          name: res.data.name,
          username: res.data.username,
          password: '',
          profilePic: res.data.profilePic || '',
          banks: res.data.banks || ['Cash (Wallet)']
        });
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Optimized Image Compression Logic
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
          const size = 400; // Pixel-perfect avatar size
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext('2d');
          // Simple center-crop and resize logic
          ctx.drawImage(img, 0, 0, size, size);

          // Compress to JPEG 0.6 quality (Strongly reduces payload size)
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
      alert("Database Synchronization Complete");
    } catch (err) {
      haptic.error();
      alert(err.response?.data?.msg || "Update Failed: File too large or connection error");
    } finally {
      setSaving(false);
    }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]"><Loader2 className="animate-spin text-[var(--brand-color)]" /></div>;

  return (
    <div className="min-h-screen pb-32 transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      <header className="p-6 pt-12 flex justify-between items-center bg-[var(--bg-secondary)] rounded-b-[3rem] shadow-sm border-b border-black/[0.03]">
        <button onClick={() => { haptic.light(); navigate('/home'); }} className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05]">
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-main)' }}>Security & Profile</h1>
        <button 
          onClick={handleUpdate} 
          disabled={saving}
          className="text-[var(--brand-color)] font-black text-xs uppercase tracking-widest disabled:opacity-30"
        >
          {saving ? 'Syncing...' : 'Save'}
        </button>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="relative group">
          <div className="w-32 h-32 rounded-[3rem] bg-[var(--bg-secondary)] border-2 border-[var(--brand-color)] flex items-center justify-center overflow-hidden shadow-2xl">
            {(imagePreview || userData.profilePic) ? (
              <img src={imagePreview || userData.profilePic} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <User size={50} className="opacity-10" style={{ color: 'var(--text-main)' }} />
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange}/>
          <button onClick={() => { haptic.light(); fileInputRef.current.click(); }} className="absolute -bottom-1 -right-1 p-3 bg-[var(--brand-color)] rounded-2xl text-[var(--brand-text)] shadow-lg active:scale-90 transition-transform">
            <Camera size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <section className="px-8 space-y-8">
        {/* Name */}
        <div className="border-b border-black/[0.05] pb-3">
          <label className="text-[9px] uppercase font-black tracking-widest opacity-30 block mb-2" style={{ color: 'var(--text-main)' }}>Legal Identity</label>
          <div className="flex items-center gap-4">
            <User size={18} className="text-[var(--brand-color)]" />
            <input className="bg-transparent outline-none w-full font-bold text-lg" style={{ color: 'var(--text-main)' }} value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} />
          </div>
        </div>

        {/* Username */}
        <div className="border-b border-black/[0.05] pb-3">
          <label className="text-[9px] uppercase font-black tracking-widest opacity-30 block mb-2" style={{ color: 'var(--text-main)' }}>Handle / Alias</label>
          <div className="flex items-center gap-4">
            <Mail size={18} className="text-[var(--brand-color)]" />
            <input className="bg-transparent outline-none w-full font-bold text-lg" style={{ color: 'var(--text-main)' }} value={userData.username} onChange={(e) => setUserData({...userData, username: e.target.value})} />
          </div>
        </div>

        {/* Password */}
        <div className="border-b border-black/[0.05] pb-3">
          <label className="text-[9px] uppercase font-black tracking-widest opacity-30 block mb-2" style={{ color: 'var(--text-main)' }}>Reset Security Key</label>
          <div className="flex items-center gap-4">
            <Lock size={18} className="text-[var(--brand-color)]" />
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Leave blank to keep current"
              className="bg-transparent outline-none w-full font-bold text-lg" 
              style={{ color: 'var(--text-main)' }}
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
            />
            <button onClick={() => { haptic.light(); setShowPassword(!showPassword); }} className="opacity-20">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>

        {/* Bank Management */}
        <div className="space-y-4 pt-4">
          <label className="text-[9px] uppercase font-black tracking-widest opacity-30 block" style={{ color: 'var(--text-main)' }}>Linked Global Accounts</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              placeholder="Search or Type Any Bank..."
              className="w-full bg-black/[0.03] border border-black/[0.05] p-5 pr-14 rounded-3xl outline-none text-xs font-bold"
              style={{ color: 'var(--text-main)' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBank()}
            />
            <button onClick={() => addBank()} className="absolute right-3 p-2.5 bg-[var(--brand-color)] rounded-2xl text-[var(--brand-text)] active:scale-90 transition-transform"><Plus size={20} strokeWidth={3} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {userData.banks.map((bank) => (
                <motion.div 
                  key={bank} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-black/[0.03] shadow-sm"
                >
                  <Landmark size={12} className="text-[var(--brand-color)]" />
                  <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>{bank}</span>
                  <button onClick={() => removeBank(bank)} className="ml-1 opacity-20 hover:opacity-100 transition-opacity"><X size={12} strokeWidth={4} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;