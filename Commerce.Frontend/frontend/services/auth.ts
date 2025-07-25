import api from '@/lib/api';
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authService = {
  // Kullanıcı kayıt
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Kullanıcı giriş
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Çıkış
  logout(): void {
    // API'de logout endpoint'i yoksa sadece token'ı temizle
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  },
};
