import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authService.login(credentials);
          const { token } = response;
          
          // Token'ı cookie'ye kaydet
          Cookies.set('auth-token', token, { expires: 7 });
          
          set({
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await authService.register(userData);
          set({ isLoading: false, error: null });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Kayıt olunurken bir hata oluştu',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        Cookies.remove('auth-token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const token = Cookies.get('auth-token');
        if (token) {
          set({
            token,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
