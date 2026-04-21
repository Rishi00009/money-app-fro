import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();

  // --- State Management ---
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

    try {
      // 1. Call the registration endpoint
      const res = await axios.post('https://money-app-back.onrender.com/api/auth/register', formData);

      // 2. Store the JWT token immediately so the user is logged in
      localStorage.setItem('token', res.data.token);

      // 3. Navigate to Home
      navigate('/home');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || "Registration failed. Try a different username.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans select-none">
      {/* Top Logo Section */}
      <div className="relative h-40 w-full">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-color,#facc15)] rounded-bl-[4rem] flex items-center justify-center shadow-lg transition-colors duration-500">
          <span className="text-black font-black text-xl tracking-widest uppercase">Rishi</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-8 pt-4 pb-10">
        <div className="mb-10">
          <h1 className="text-4xl font-light inline tracking-tight uppercase">Sign up</h1>
          <Link to="/" className="text-slate-500 text-xl ml-2 font-light hover:text-[var(--brand-color)] transition-colors">
            / LOGIN
          </Link>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black tracking-widest uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Full Name Field */}
          <div className="border-b border-slate-700 pb-2">
            <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-[0.2em]">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={name}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-lg focus:border-brand transition-all"
              placeholder="Rishi"
              required
            />
          </div>

          {/* Username Field */}
          <div className="border-b border-slate-700 pb-2">
            <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-[0.2em]">Username</label>
            <input 
              type="text" 
              name="username"
              value={username}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-lg"
              placeholder="rishi_dev"
              required
            />
          </div>

          {/* Password Field */}
          <div className="border-b border-slate-700 pb-2 relative">
            <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-[0.2em]">Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              value={password}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-lg"
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 bottom-3 text-slate-600 active:scale-90 transition-transform"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Hexagon Arrow Button */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit"
              disabled={loading}
              className={`w-16 h-16 flex items-center justify-center transition-all ${loading ? 'opacity-50 scale-90' : 'bg-[var(--brand-color,#facc15)] active:scale-90 hover:brightness-110 shadow-xl shadow-black/20'}`}
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

      <div className="p-6 text-slate-800 text-[10px] text-center tracking-widest uppercase">
        Step 1: Account Creation
      </div>
    </div>
  );
};

export default Register;