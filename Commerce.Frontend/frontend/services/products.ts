import api from '@/lib/api';
import { Product } from '@/types';

export const productService = {
  // Tüm ürünleri getir
  async getProducts(params?: {
    categoryId?: number;
    isActive?: boolean;
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<Product[]> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // ID'ye göre ürün getir
  async getProductById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Kategoriye göre ürünleri getir
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const response = await api.get(`/products?categoryId=${categoryId}`);
    return response.data;
  },

  // Ürün ara
  async searchProducts(searchTerm: string, pageNumber = 1, pageSize = 12): Promise<Product[]> {
    const response = await api.get('/products', {
      params: { searchTerm, pageNumber, pageSize }
    });
    return response.data;
  },
};
