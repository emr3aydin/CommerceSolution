// API konfigürasyonu ve utility fonksiyonları

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057';

// Temel API istemcisi
export const apiClient = {
    baseURL: API_BASE_URL,

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Expected JSON response but got: ${text}`);
            }
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    },

    post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
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
        return apiClient.get(`/api/products${queryString ? `?${queryString}` : ''}`);
    },

    async getById(id: number) {
        return apiClient.get(`/api/products/${id}`);
    },

    async create(productData: {
        name: string;
        description?: string;
        price: number;
        stock: number;
        imageUrl: string;
        sku: string;
        categoryId: number;
        isActive: boolean;
    }) {
        return apiClient.post('/api/products', productData);
    },

    async update(id: number, productData: {
        id: number;
        name: string;
        description?: string;
        price: number;
        stock: number;
        imageUrl: string;
        sku: string;
        categoryId: number;
        isActive: boolean;
    }) {
        return apiClient.put(`/api/products/${id}`, productData);
    },

    async delete(id: number) {
        return apiClient.delete(`/api/products/${id}`);
    },
};

// Category API fonksiyonları
export const categoryAPI = {
    async getAll() {
        return apiClient.get('/categories/getAll');
    },

    async getById(id: number) {
        return apiClient.get(`/categories/${id}`);
    },

    async create(categoryData: {
        name: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
    }) {
        return apiClient.post('/categories/new', categoryData);
    },

    async update(categoryData: {
        id: number;
        name: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
    }) {
        return apiClient.post('/categories/update', categoryData);
    },

    async delete(id: number) {
        return apiClient.delete(`/categories/${id}`);
    },
};

// Auth API fonksiyonları
export const authAPI = {
    async login(email: string, password: string) {
        return apiClient.post('/api/auth/login', { email, password });
    },

    async register(userData: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        gender: string;
        phoneNumber: string;
    }) {
        return apiClient.post('/api/auth/register', userData);
    },

    async getCurrentUser() {
        return apiClient.get('/api/auth/me');
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
        return apiClient.get('/api/carts');
    },

    async addToCart(productId: number, quantity: number) {
        return apiClient.post('/api/carts/add', { productId, quantity });
    },

    async updateCart(cartItemId: number, quantity: number) {
        return apiClient.put(`/api/carts/update/${cartItemId}`, { quantity });
    },

    async removeFromCart(cartItemId: number) {
        return apiClient.delete(`/api/carts/remove/${cartItemId}`);
    },
};
