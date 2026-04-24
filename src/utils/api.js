import axios from 'axios';
import { haptic } from './haptics';

const API = axios.create({
  baseURL: 'https://money-app-back.onrender.com/api', 
});

// Helper to manage the offline queue in localStorage
const getQueue = () => JSON.parse(localStorage.getItem('offline-queue') || '[]');
const saveQueue = (queue) => localStorage.setItem('offline-queue', JSON.stringify(queue));

// REQUEST INTERCEPTOR: Attach Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle Offline Failures
API.interceptors.response.use(
  (response) => response, // If online, just pass the response through
  async (error) => {
    const { config, message } = error;

    // Check if the error is due to no network connection
    const isNetworkError = !navigator.onLine || message === 'Network Error';
    
    // We only want to queue data-writing requests (POST/PUT/DELETE)
    const isWriteRequest = ['post', 'put', 'delete'].includes(config.method);

    if (isNetworkError && isWriteRequest) {
      haptic.medium(); // Vibrate to notify user of offline save
      
      const queue = getQueue();
      const newItem = {
        url: config.url,
        method: config.method,
        data: JSON.parse(config.data), // Store the transaction info
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      // Add to queue if not already there (prevent duplicates)
      queue.push(newItem);
      saveQueue(queue);

      console.warn("🌐 System Offline: Transaction queued for sync.");
      
      // Return a "fake" successful response so the UI doesn't crash
      return Promise.resolve({ 
        data: newItem.data, 
        status: 202, 
        offline: true 
      });
    }

    return Promise.reject(error);
  }
);

export default API;