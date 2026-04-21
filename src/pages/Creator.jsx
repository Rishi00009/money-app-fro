import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import creatorImg from '../assets/creator.jpg';
import { 
  ArrowLeft, 

  ExternalLink, 
  Terminal, 
  Database, 
  Layout, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

const Creator = () => {
  const navigate = useNavigate();

  // Your Professional Tech Stack
  const expertise = [
    { name: 'React.js', level: 'Frontend Architect', icon: <Layout size={18} />, color: '#61DAFB' },
    { name: 'Python', level: 'Backend Logic', icon: <Terminal size={18} />, color: '#3776AB' },
    { name: 'FastAPI', level: 'API Design', icon: <Cpu size={18} />, color: '#05998b' },
    { name: 'MySQL', level: 'Database Expert', icon: <Database size={18} />, color: '#4479A1' },
  ];

  return (
    <div className="min-h-screen pb-12 select-none transition-colors duration-500" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      {/* 1. HEADER */}
      <header className="p-6 pt-12 flex justify-between items-center">
        <button 
          onClick={() => navigate('/home')} 
          className="p-3 rounded-2xl bg-black/[0.03] border border-black/[0.05] active:scale-90 transition-transform shadow-sm"
        >
          <ArrowLeft size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <h1 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30" style={{ color: 'var(--text-main)' }}>Engineering</h1>
        <div className="w-10"></div>
      </header>

      {/* 2. IDENTITY CARD */}
      <div className="px-8 mt-4">
        <div className="relative p-8 rounded-[3rem] bg-[var(--bg-secondary)] border border-black/[0.03] shadow-xl overflow-hidden">
          {/* Subtle Branding Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-color)] opacity-10 blur-[50px] -mr-10 -mt-10" />
          
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-[2.2rem] bg-white border-2 border-[var(--brand-color)] p-1 shadow-2xl mb-6 flex items-center justify-center">
              <img 
                src={creatorImg} 
                alt="Rishi" 
                className="w-full h-full rounded-[1.8rem] object-cover"
              />
            </div>
            
            <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-main)' }}>Rishi</h2>
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[var(--brand-color)] mt-2">Full-Stack Architect</p>
            
            <div className="flex items-center gap-2 mt-5 px-4 py-2 bg-black/[0.03] rounded-full border border-black/[0.03]">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-main)' }}>Lead Developer</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CORE EXPERTISE GRID */}
      <section className="px-8 mt-12">
        <h3 className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 mb-6 px-2" style={{ color: 'var(--text-main)' }}>Technical Domain</h3>
        <div className="grid grid-cols-2 gap-4">
          {expertise.map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-5 rounded-[2.2rem] bg-[var(--bg-secondary)] border border-black/[0.03] shadow-sm flex flex-col items-center text-center"
            >
              <div className="mb-3" style={{ color: item.color }}>{item.icon}</div>
              <p className="text-[11px] font-black uppercase tracking-tight" style={{ color: 'var(--text-main)' }}>{item.name}</p>
              <p className="text-[9px] font-bold opacity-30 uppercase mt-1" style={{ color: 'var(--text-main)' }}>{item.level}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. PROFESSIONAL NETWORK LINKS */}
      <section className="px-8 mt-12 space-y-3">
        <h3 className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 mb-6 px-2" style={{ color: 'var(--text-main)' }}>Digital Presence</h3>
        
        <SocialButton 
    
    label="LinkedIn" 
    platform="Professional Network"
    url="https://www.linkedin.com/in/rishi-murugan-787435267" 
  />

  {/* GitHub - Using the GithubIcon alias to avoid Vite errors */}
  <SocialButton 
    
    label="GitHub" 
    platform="Source Repository"
    url="https://github.com/Rishi00009" 
  />

  {/* Email - Added mailto: prefix */}
  <SocialButton 
   
    label="Email" 
    platform="Direct Inquiries"
    url="mailto:rishirishim0@gmail.com" 
  />
      </section>

      {/* FOOTER */}
      <div className="mt-16 text-center pb-8 opacity-10">
        <p className="text-[8px] uppercase font-black tracking-[0.6em]" style={{ color: 'var(--text-main)' }}>
          © 2026 Billing 360 Systems
        </p>
      </div>
    </div>
  );
};

// Internal Helper for Social Buttons
const SocialButton = ({ icon, label, platform, url }) => (
  <a 
    href={url} 
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center justify-between p-5 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-black/[0.03] active:scale-[0.98] transition-all shadow-sm group"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-black/[0.03] rounded-2xl text-[var(--brand-color)] group-hover:bg-[var(--brand-color)] group-hover:text-black transition-colors duration-500">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest opacity-30" style={{ color: 'var(--text-main)' }}>{label}</p>
        <p className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>{platform}</p>
      </div>
    </div>
    <ExternalLink size={14} className="opacity-10 group-hover:opacity-40 transition-opacity" style={{ color: 'var(--text-main)' }} />
  </a>
);

export default Creator;