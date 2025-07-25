import api from '@/lib/api';
import { Category } from '@/types';

export const categoryService = {
  // Tüm kategorileri getir
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories/getAll');
    return response.data;
  },

  // ID'ye göre kategori getir
  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};
