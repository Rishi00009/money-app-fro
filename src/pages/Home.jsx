import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Core Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Fintech & Identity Pages
import History from './pages/History';
import Reports from './pages/Reports';
import Creator from './pages/Creator';

// Utilities
import { haptic } from './utils/haptics';

// --- 1. THEME ORCHESTRATOR ---
// Applies custom protocols globally upon boot
const ThemeOrchestrator = () => {
  useEffect(() => {
    // SYNCED KEY: Using 'app-theme' to match Settings.jsx
    const savedTheme = localStorage.getItem('app-theme');
    
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        
        // Inject the saved colors into CSS variables
        root.style.setProperty('--brand-color', theme.brand);
        root.style.setProperty('--bg-primary', theme.bgPrimary);
        root.style.setProperty('--bg-secondary', theme.bgSecondary || theme.bgPrimary);
        root.style.setProperty('--text-main', theme.textMain);
        
        // Handle Brand Text Contrast (White vs Black)
        const brandText = theme.brandText || '#FFFFFF';
        root.style.setProperty('--brand-text', brandText);

        // SYSTEM LOG
        console.log(`%c Terminal Protocol: ${theme.name} Active `, `background: ${theme.brand}; color: ${brandText}; font-weight: bold;`);
      } catch (err) {
        console.error("Theme Sync Error:", err);
      }
    }
  }, []);

  return null;
};

// --- 2. GLOBAL NAVIGATION HAPTICS ---
const HapticNavigation = () => {
  const location = useLocation();

  useEffect(() => {
    // Prevent haptic on initial landing, trigger on subsequent navigations
    if (location.pathname !== '/') {
      haptic.light();
    }
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      {/* Essential Global Handlers */}
      <ThemeOrchestrator />
      
      {/* Internal component to use location hooks */}
      <AppContent />
    </Router>
  );
}

// Wrapper to allow useLocation() inside Router context
const AppContent = () => {
  return (
    <>
      <HapticNavigation />
      <Routes>
        {/* Auth Entry Points */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Core Ecosystem Routes */}
        <Route path="/home" element={<Home />} />
        <Route path="/add" element={<AddTransaction />} /> 
        
        {/* User Identity & Preferences */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/creator" element={<Creator />} />
        
        {/* Financial Intelligence Routes */}
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* Universal Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;