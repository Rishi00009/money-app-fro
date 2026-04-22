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
const ThemeOrchestrator = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        const root = document.documentElement;
        root.style.setProperty('--brand-color', theme.brand);
        root.style.setProperty('--bg-primary', theme.bgPrimary);
        root.style.setProperty('--bg-secondary', theme.bgSecondary || theme.bgPrimary);
        root.style.setProperty('--text-main', theme.textMain);
        const brandText = theme.brandText || '#FFFFFF';
        root.style.setProperty('--brand-text', brandText);
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
    if (location.pathname !== '/') {
      haptic.light();
    }
  }, [location.pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ThemeOrchestrator />
      <AppContent />
    </Router>
  );
}

const AppContent = () => {
  return (
    <>
      <HapticNavigation />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add" element={<AddTransaction />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/creator" element={<Creator />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default App;