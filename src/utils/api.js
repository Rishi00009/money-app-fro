import axios from 'axios';

const API = axios.create({
  // Make sure this matches your backend port
  baseURL: 'https://money-app-back.onrender.com/api', 
});

// Request interceptor to attach the JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Must match the key your backend middleware expects
      config.headers['x-auth-token'] = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This is the line your Home.jsx is screaming for!
export default API;