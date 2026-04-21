// src/utils/haptics.js

const getHapticPreference = () => {
  return localStorage.getItem('haptic-enabled') !== 'false'; // Default to true
};

export const haptic = {
  // Sharp click (Pixel keyboard style)
  light: () => {
    if (getHapticPreference() && "vibrate" in navigator) {
      navigator.vibrate(12); 
    }
  },

  // Noticeable pulse (Toggle/Switch style)
  medium: () => {
    if (getHapticPreference() && "vibrate" in navigator) {
      navigator.vibrate(25);
    }
  },

  // Success double-tap
  success: () => {
    if (getHapticPreference() && "vibrate" in navigator) {
      navigator.vibrate([15, 40, 15]);
    }
  },

  // Error triple-tap
  error: () => {
    if (getHapticPreference() && "vibrate" in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }
};