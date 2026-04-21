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

// Global Navigation Wrapper for Haptics
const HapticNavigation = () => {
  const location = useLocation();

  useEffect(() => {
    // Triggers a light Pixel-style click on every route change
    // This makes the UI feel physical and responsive
    haptic.light();
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      {/* Listens to URL changes to trigger global haptics */}
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
    </Router>
  );
}

export default App;