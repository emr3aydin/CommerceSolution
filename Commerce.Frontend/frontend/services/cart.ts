import api from '@/lib/api';
import { Cart, AddToCartRequest } from '@/types';

export const cartService = {
  // Kullanıcının sepetini getir
  async getCart(): Promise<Cart> {
    const response = await api.get('/carts');
    return response.data;
  },

  // Sepete ürün ekle
  async addToCart(data: AddToCartRequest): Promise<{ message: string }> {
    const response = await api.post('/carts/add', data);
    return response.data;
  },

  // Sepetten ürün çıkar
  async removeFromCart(cartItemId: number): Promise<{ message: string }> {
    const response = await api.delete(`/carts/remove/${cartItemId}`);
    return response.data;
  },

  // Sepeti temizle
  async clearCart(): Promise<{ message: string }> {
    const response = await api.delete('/carts/clear');
    return response.data;
  },
};
