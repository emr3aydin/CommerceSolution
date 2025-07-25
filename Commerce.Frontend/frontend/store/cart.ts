import { create } from 'zustand';
import { Cart, AddToCartRequest } from '@/types';
import { cartService } from '@/services/cart';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartRequest) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Sepet yüklenirken bir hata oluştu',
        isLoading: false,
      });
    }
  },

  addToCart: async (data: AddToCartRequest) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.addToCart(data);
      // Sepeti yeniden yükle
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün sepete eklenirken bir hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  removeFromCart: async (cartItemId: number) => {
    set({ isLoading: true, error: null });
    try {
      await cartService.removeFromCart(cartItemId);
      // Sepeti yeniden yükle
      await get().fetchCart();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ürün sepetten çıkarılırken bir hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartService.clearCart();
      set({ cart: null, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Sepet temizlenirken bir hata oluştu',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
