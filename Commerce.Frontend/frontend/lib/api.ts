import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
  // Development ortamında SSL sertifika hatalarını yoksay
  httpsAgent: process.env.NODE_ENV === 'development' ? {
    rejectUnauthorized: false
  } : undefined,
});

// Request interceptor - JWT token ekle
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Network hatası
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('API sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.');
      error.message = 'API sunucusuna bağlanılamıyor. Lütfen daha sonra tekrar deneyin.';
    }
    
    // 401 Unauthorized
    if (error.response?.status === 401) {
      Cookies.remove('auth-token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    // 500 Server Error
    if (error.response?.status >= 500) {
      error.message = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
