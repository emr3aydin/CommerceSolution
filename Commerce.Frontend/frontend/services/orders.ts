import api from '@/lib/api';
import { Order } from '@/types';

export const orderService = {
  // Kullanıcının siparişlerini getir
  async getOrders(params?: {
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Order[]> {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // ID'ye göre sipariş getir
  async getOrderById(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Sipariş oluştur
  async createOrder(data: { shippingAddress: string }): Promise<{ id: number; message: string }> {
    const response = await api.post('/orders', data);
    return response.data;
  },
};
