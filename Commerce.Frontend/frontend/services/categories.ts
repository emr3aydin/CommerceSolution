import api from '@/lib/api';
import { Category } from '@/types';

export const categoryService = {
  // Tüm kategorileri getir
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/Categories/getAll');
    return response.data;
  },

  // ID'ye göre kategori getir
  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/Categories/${id}`);
    return response.data;
  },
};
