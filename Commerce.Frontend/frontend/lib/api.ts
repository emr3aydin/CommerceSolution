// API konfigürasyonu ve utility fonksiyonları
import {
    RegisterDto,
    LoginDto,
    CreateAdminDto,
    AddToCartRequest,
    CreateCategoryCommand,
    UpdateCategoryCommand,
    CreateProductCommand,
    UpdateProductCommand,
    CreateOrderCommand,
    UpdateOrderStatusRequest,
    ApiResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057';

// Temel API istemcisi
export const apiClient = {
    baseURL: API_BASE_URL,

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Token varsa header'a ekle (sadece browser'da)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                let errorMessage;
                try {
                    // Response'ı kopyalayalım ki hem JSON hem text denemesi yapabilelim
                    const responseClone = response.clone();
                    const errorData = await responseClone.json();
                    errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
                } catch {
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || `API Error: ${response.status} ${response.statusText}`;
                    } catch {
                        errorMessage = `API Error: ${response.status} ${response.statusText}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                // Non-JSON response için default success response
                return {
                    success: true,
                    message: 'Operation successful',
                    data: {} as T
                };
            }
        } catch (error) {
            console.error('API Request Error:', {
                url,
                method: config.method || 'GET',
                error: error instanceof Error ? error.message : error
            });

            // Network error vs API error ayırımı
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
            }

            throw error;
        }
    },

    get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    },

    post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    },

    patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    },
};

// Product API fonksiyonları
export const productAPI = {
    async getAll(params?: {
        categoryId?: number;
        isActive?: boolean;
        searchTerm?: string;
        pageNumber?: number;
        pageSize?: number;
    }) {
        const query = new URLSearchParams();
        if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
        if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
        if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

        const queryString = query.toString();
        return apiClient.get(`/api/Products${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id: number) {
        return apiClient.get(`/api/Products/${id}`);
    },

    async create(productData: CreateProductCommand) {
        return apiClient.post('/api/Products', productData);
    },

    async update(id: number, productData: UpdateProductCommand) {
        return apiClient.put(`/api/Products/${id}`, productData);
    },

    async delete(id: number) {
        return apiClient.delete(`/api/Products/${id}`);
    },
};

// Category API fonksiyonları
export const categoryAPI = {
    async getAll() {
        return apiClient.get('/api/Categories/getAll');
    },

    async getById(id: number) {
        return apiClient.get(`/api/Categories/${id}`);
    },

    async create(categoryData: CreateCategoryCommand) {
        return apiClient.post('/api/Categories/new', categoryData);
    },

    async update(categoryData: UpdateCategoryCommand) {
        return apiClient.post('/api/Categories/update', categoryData);
    },

    async delete(id: number) {
        return apiClient.delete(`/api/Categories/${id}`);
    },
};

// Auth API fonksiyonları
export const authAPI = {
    async login(credentials: LoginDto) {
        return apiClient.post('/api/Auth/login', credentials);
    },

    async register(userData: RegisterDto) {
        return apiClient.post('/api/Auth/register', userData);
    },

    async createAdmin(adminData: CreateAdminDto) {
        return apiClient.post('/api/Auth/create-admin', adminData);
    },

    async getCurrentUser() {
        return apiClient.get('/api/Auth/me');
    },

    async logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');
        }
    },
};

// Cart API fonksiyonları
export const cartAPI = {
    async getCart() {
        return apiClient.get('/api/Carts');
    },

    async addToCart(request: AddToCartRequest) {
        return apiClient.post('/api/Carts/add', request);
    },

    async removeFromCart(cartItemId: number) {
        return apiClient.delete(`/api/Carts/remove/${cartItemId}`);
    },

    async clearCart() {
        return apiClient.delete('/api/Carts/clear');
    },
};

// Orders API fonksiyonları
export const orderAPI = {
    async getAll(params?: {
        status?: string;
        pageNumber?: number;
        pageSize?: number;
    }) {
        const query = new URLSearchParams();
        if (params?.status) query.append('status', params.status);
        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

        const queryString = query.toString();
        return apiClient.get(`/api/Orders${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id: number) {
        return apiClient.get(`/api/Orders/${id}`);
    },

    async create(orderData: CreateOrderCommand) {
        return apiClient.post('/api/Orders', orderData);
    },

    async updateStatus(id: number, statusRequest: UpdateOrderStatusRequest) {
        return apiClient.patch(`/api/Orders/${id}/status`, statusRequest);
    },
};

// Logs API fonksiyonları
export const logsAPI = {
    async getAll(params?: {
        level?: string;
        startDate?: string;
        endDate?: string;
        pageNumber?: number;
        pageSize?: number;
    }) {
        const query = new URLSearchParams();
        if (params?.level) query.append('level', params.level);
        if (params?.startDate) query.append('startDate', params.startDate);
        if (params?.endDate) query.append('endDate', params.endDate);
        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

        const queryString = query.toString();
        return apiClient.get(`/api/Logs${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id: number) {
        return apiClient.get(`/api/Logs/${id}`);
    },

    async getStats() {
        return apiClient.get('/api/Logs/stats');
    },

    async clearOldLogs(daysToKeep: number = 30) {
        return apiClient.delete(`/api/Logs/clear?daysToKeep=${daysToKeep}`);
    },
};
