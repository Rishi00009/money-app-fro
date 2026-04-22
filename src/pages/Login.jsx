import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import { haptic } from '../utils/haptics'; // Import your haptic utility

const Login = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // --- Persistent Login Check ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, skip login and go straight home
      navigate('/home');
    } else {
      setCheckingAuth(false);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    haptic.light(); // Pixel click on submit

    try {
      const res = await axios.post('https://money-app-back.onrender.com/api/auth/login', {
        username,
        password
      });

      // Save token for "Remember Me" functionality
      localStorage.setItem('token', res.data.token);
      
      haptic.success(); // Success double-pulse
      navigate('/home');
    } catch (err) {
      setLoading(false);
      haptic.error(); // Error triple-pulse
      setError(err.response?.data?.msg || "Invalid credentials");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-lime-500" size={32} />
      </div>
    );
  }

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
      <div className="flex-1 px-8 pt-6">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">LOGIN</h1>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-12 bg-lime-400 rounded-full"></div>
            <Link to="/register" className="text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-lime-600 transition-colors">
              / Create Account
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-[10px] font-black tracking-widest uppercase text-center animate-bounce">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-10">
          <div className="group border-b-2 border-slate-200 focus-within:border-lime-400 transition-all pb-2">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 block">Credential / Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 placeholder:text-slate-200"
              placeholder="e.g. rishi_dev"
            />
          </div>

          <div className="group border-b-2 border-slate-200 focus-within:border-lime-400 transition-all pb-2 relative">
            <label className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 block">Security Key</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-xl font-bold text-slate-800 tracking-[0.3em]"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => { haptic.light(); setShowPassword(!showPassword); }}
              className="absolute right-0 bottom-3 text-slate-300 hover:text-lime-500 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button type="button" className="text-slate-300 text-[10px] uppercase font-black tracking-widest hover:text-slate-500 transition-colors">
              Forgot Security Key?
            </button>
          </div>

          {/* Action Button - Hexagon Pulse */}
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

      {/* Footer Branding */}
      <div className="p-10 text-center">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em]">SpendWise Terminal</p>
      </div>
    </div>
  );
};

export default Login;