import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { haptic } from '../utils/haptics'; // Integrated haptics

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, username, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    haptic.light(); // Pixel click feedback

    try {
      const res = await axios.post('https://money-app-back.onrender.com/api/auth/register', formData);

      // Store token immediately to "Remember User"
      localStorage.setItem('token', res.data.token);

      haptic.success(); // Success vibration
      navigate('/home');
    } catch (err) {
      setLoading(false);
      haptic.error(); // Error vibration
      setError(err.response?.data?.msg || "Username taken or server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col font-sans select-none transition-colors duration-500">
      
      {/* Top Brand Section - Material Style */}
      <div className="relative h-40 w-full overflow-hidden">
        <div 
          className="absolute -top-10 -right-10 w-48 h-48 rounded-full shadow-2xl flex items-center justify-center pt-8 pr-8"
          style={{ backgroundColor: 'var(--brand-color, #bef264)' }}
        >
          <span className="text-black font-black text-xl tracking-[0.2em] uppercase">Rishi</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-8 pt-6 pb-10">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">Sign Up</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-12 bg-lime-400 rounded-full"></div>
            <Link to="/" className="text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-lime-600 transition-colors">
              / Login instead
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black tracking-widest uppercase text-center animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          {/* Full Name */}
          <div className="group border-b-2 border-slate-200 focus-within:border-lime-400 transition-all pb-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 block">Full Name</label>
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-300 group-focus-within:text-lime-500" />
              <input 
                type="text" 
                name="name"
                value={name}
                onChange={onChange}
                className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200"
                placeholder="Rishi"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div className="group border-b-2 border-slate-200 focus-within:border-lime-400 transition-all pb-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 block">Username / Alias</label>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-300 group-focus-within:text-lime-500" />
              <input 
                type="text" 
                name="username"
                value={username}
                onChange={onChange}
                className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200"
                placeholder="rishi_dev"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="group border-b-2 border-slate-200 focus-within:border-lime-400 transition-all pb-2 relative">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 block">Create Security Key</label>
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-slate-300 group-focus-within:text-lime-500" />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={password}
                onChange={onChange}
                className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 tracking-[0.3em] placeholder:tracking-normal placeholder:text-slate-200"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="button" 
              onClick={() => { haptic.light(); setShowPassword(!showPassword); }}
              className="absolute right-0 bottom-3 text-slate-300 hover:text-lime-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => { haptic.light(); navigate('/login'); }}
              className="text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-lime-600 transition-colors"
            >
            Login instead
            </button>
          </div>

          {/* Hexagon Action Button */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit"
              disabled={loading}
              className={`w-20 h-20 flex items-center justify-center transition-all shadow-xl ${
                loading 
                ? 'bg-slate-100 scale-90' 
                : 'bg-slate-900 active:scale-95 hover:bg-black'
              }`}
              style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
            >
              {loading ? (
                <Loader2 className="text-lime-400 animate-spin" size={28} />
              ) : (
                <ArrowRight className="text-lime-400" size={32} strokeWidth={3} />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer System Info */}
      <div className="p-8 text-center">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">Terminal Initialization: v1.0</p>
      </div>
    </div>
  );
};

export default Register;