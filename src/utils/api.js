import axios from 'axios';
import { haptic } from './haptics';

const API = axios.create({
  baseURL: 'https://money-app-back.onrender.com/api',
  timeout: 10000, // 10 second timeout
});

// Helper to manage the offline queue
const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem('offline-queue') || '[]');
  } catch { return []; }
};

const saveQueue = (queue) => localStorage.setItem('offline-queue', JSON.stringify(queue));

// --- REQUEST INTERCEPTOR: THE BRAINS ---
API.interceptors.request.use(
  async (config) => {
    // 1. Attach Token
    const token = localStorage.getItem('token');
    if (token) config.headers['x-auth-token'] = token;

    // 2. OFFLINE HIJACK
    // If we are offline and trying to save data (POST/PUT/DELETE)
    const isWrite = ['post', 'put', 'delete'].includes(config.method?.toLowerCase());
    
    if (!navigator.onLine && isWrite) {
      haptic.medium();
      
      const queue = getQueue();
      const newItem = {
        url: config.url,
        method: config.method.toLowerCase(),
        data: typeof config.data === 'string' ? JSON.parse(config.data) : config.data,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      queue.push(newItem);
      saveQueue(queue);

      console.warn("🚀 Request Queued Offline:", newItem.url);

      // We THROW a custom error to cancel the real network attempt
      // But we will handle this "error" in the response interceptor
      return Promise.reject({ 
        isOfflineHijack: true, 
        fallbackData: newItem.data 
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR: THE SAFETY NET ---
API.interceptors.response.use(
  (response) => response, 
  async (error) => {
    // 3. Catch the Hijack or a standard Network Error
    const isOffline = !navigator.onLine || error.message === 'Network Error' || error.isOfflineHijack;
    
    if (isOffline && error.isOfflineHijack) {
      // Return the fake success to the UI
      return Promise.resolve({
        data: error.fallbackData,
        status: 202,
        offline: true
      });
    }

    // Handle unexpected network drops during an active request
    if (isOffline && ['post', 'put', 'delete'].includes(error.config?.method)) {
        // ... (Same queue logic as above can be added here as a backup)
        return Promise.resolve({ data: {}, status: 202, offline: true });
    }

    return Promise.reject(error);
  }
);

export default API;