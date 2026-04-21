import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; // Use axios directly or your API utility

const Login = () => {
  const navigate = useNavigate();
  
  // --- State for Form Inputs ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call your backend login route
      const res = await axios.post('https://money-app-back.onrender.com/api/auth/login', {
        username,
        password
      });

      // 2. Save the token to localStorage
      // This is what prevents the 401 error on the Home page!
      localStorage.setItem('token', res.data.token);

      // 3. Navigate to Home
      navigate('/home');
    } catch (err) {
      setLoading(false);
      // Handle "Invalid Credentials" or Server errors
      setError(err.response?.data?.msg || "Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans select-none">
      {/* Top Logo Section */}
      <div className="relative h-48 w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-color,#facc15)] rounded-bl-[4rem] flex items-center justify-center shadow-lg">
          <span className="text-black font-black text-xl tracking-widest uppercase">Rishi</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-8 pt-10">
        <div className="mb-12">
          <h1 className="text-4xl font-light inline">LOGIN</h1>
          <Link to="/register" className="text-slate-500 text-xl ml-2 font-light hover:text-[var(--brand-color)] transition-colors">
            / Sign up
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-bold tracking-widest uppercase text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="border-b border-slate-700 pb-2">
            <label className="text-xs text-white block mb-1 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent outline-none text-lg placeholder:text-slate-800"
              placeholder="username"
            />
          </div>

          <div className="border-b border-slate-700 pb-2 relative">
            <label className="text-xs text-white block mb-1 uppercase tracking-wider">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-lg"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-3 text-slate-600 active:scale-90 transition-transform"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button type="button" className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
              Forget pass?
            </button>
            <Link to="/register" className="text-[var(--brand-color,#facc15)] text-[10px] uppercase font-black tracking-[0.2em]">
              Create Account
            </Link>
          </div>

          {/* Hexagon Arrow Button */}
          <div className="flex justify-end pt-10">
            <button 
              type="submit"
              disabled={loading}
              className={`w-16 h-16 flex items-center justify-center transition-all ${loading ? 'opacity-50 scale-90' : 'bg-[var(--brand-color,#facc15)] active:scale-90 shadow-[0_0_20px_rgba(250,204,21,0.3)]'}`}
              style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="text-black" size={28} strokeWidth={3} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;