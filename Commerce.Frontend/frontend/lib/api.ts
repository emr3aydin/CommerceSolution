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
    ApiResponse,
    PaginatedProductsResponse,
    TokenResponseDto,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '@/types'; const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7057';

// Temel API istemcisi
export const apiClient = {
    baseURL: API_BASE_URL,

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        // Önce token geçerliliğini kontrol et ve gerekirse yenile
        if (typeof window !== 'undefined') {
            const shouldRefresh = this.shouldRefreshToken(endpoint);
            if (shouldRefresh) {
                const refreshed = await this.tryRefreshToken();
                if (!refreshed) {
                    // Token yenilenemezse logout yap ve login sayfasına yönlendir
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('tokenExpiry');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                    throw new Error('Session expired. Please login again.');
                }
            }
        }

        const url = `${this.baseURL}${endpoint}`;

        const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Token varsa header'a ekle (sadece browser'da)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
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

            // 401 durumunda token yenilemeyi dene
            if (response.status === 401 && typeof window !== 'undefined') {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    // Token yenilendi, request'i tekrar dene
                    const newToken = localStorage.getItem('accessToken');
                    if (newToken) {
                        config.headers = {
                            ...config.headers,
                            'Authorization': `Bearer ${newToken}`,
                        };
                        return this.request<T>(endpoint, options);
                    }
                } else {
                    // Token yenilenemezse logout yap ve login sayfasına yönlendir
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('tokenExpiry');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/login';
                    throw new Error('Session expired. Please login again.');
                }
            }

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

    // Token yenileme gerekip gerekmediğini kontrol et
    shouldRefreshToken(endpoint: string): boolean {
        // Auth endpoint'lerinde token kontrolü yapma
        if (endpoint.includes('/api/Auth/login') || 
            endpoint.includes('/api/Auth/register') || 
            endpoint.includes('/api/Auth/refresh-token') ||
            endpoint.includes('/api/Auth/forgot-password') ||
            endpoint.includes('/api/Auth/reset-password')) {
            return false;
        }

        const token = localStorage.getItem('accessToken');
        const expiry = localStorage.getItem('tokenExpiry');
        
        console.log('Token check:', { 
            hasToken: !!token, 
            expiry: expiry, 
            endpoint: endpoint 
        });
        
        if (!token || !expiry) {
            console.log('No token or expiry found');
            return false;
        }

        // Token 1 dakika içinde expire olacaksa yenile
        const expiryDate = new Date(expiry);
        const now = new Date();
        const oneMinute = 60 * 1000; // 1 dakika ms cinsinden
        
        const timeLeft = expiryDate.getTime() - now.getTime();
        const shouldRefresh = timeLeft < oneMinute;
        
        console.log('Token expiry check:', { 
            expiryDate: expiryDate.toISOString(), 
            now: now.toISOString(), 
            timeLeft: timeLeft,
            shouldRefresh: shouldRefresh
        });
        
        return shouldRefresh;
    },

    // Token yenilemeyi dene
    async tryRefreshToken(): Promise<boolean> {
        console.log('Attempting token refresh...');
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.log('No refresh token found');
                return false;
            }

            console.log('Making refresh token request...');
            const response = await fetch(`${this.baseURL}/api/Auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            console.log('Refresh token response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Refresh token response data:', data);
                
                if (data.success && data.data) {
                    const tokenData = data.data as TokenResponseDto;
                    localStorage.setItem('accessToken', tokenData.accessToken);
                    localStorage.setItem('refreshToken', tokenData.refreshToken);
                    localStorage.setItem('tokenExpiry', tokenData.expiresAt);
                    console.log('Tokens refreshed successfully');
                    return true;
                }
            } else {
                const errorText = await response.text();
                console.log('Refresh token failed:', errorText);
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        
        return false;
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
        if (params?.categoryId && params.categoryId > 0) query.append('categoryId', params.categoryId.toString());
        if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());
        if (params?.searchTerm) query.append('searchTerm', params.searchTerm);
        if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
        if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

        const queryString = query.toString();
        console.log('ProductAPI.getAll - Full URL:', `/api/Products${queryString ? `?${queryString}` : ''}`);
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

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        return apiClient.post<TokenResponseDto>('/api/Auth/refresh-token', { refreshToken });
    },

    async revokeToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        return apiClient.post('/api/Auth/revoke-token', { refreshToken });
    },

    async forgotPassword(email: string) {
        return apiClient.post('/api/Auth/forgot-password', { email });
    },

    async resetPassword(email: string, resetCode: string, newPassword: string) {
        return apiClient.post('/api/Auth/reset-password', { 
            email, 
            code: resetCode, 
            newPassword,
            confirmPassword: newPassword
        });
    },

    async updateProfile(profileData: {
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        dateOfBirth?: string;
        gender?: string;
    }) {
        return apiClient.put('/api/Auth/profile', profileData);
    },

    async changePassword(currentPassword: string, newPassword: string) {
        return apiClient.post('/api/Auth/change-password', {
            currentPassword,
            newPassword
        });
    },

    async logout() {
        try {
            // Refresh token'ı revoke et
            await this.revokeToken();
        } catch (error) {
            console.warn('Token revoke failed:', error);
        } finally {
            // Local storage'ı temizle
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tokenExpiry');
                localStorage.removeItem('userInfo');
            }
        }
    },

    // Token yenileme kontrolü
    isTokenExpired(): boolean {
        if (typeof window === 'undefined') return true;
        
        const expiry = localStorage.getItem('tokenExpiry');
        if (!expiry) return true;
        
        return new Date() >= new Date(expiry);
    },

    // Otomatik token yenileme
    async ensureValidToken(): Promise<boolean> {
        if (typeof window === 'undefined') return false;

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) return false;

        if (this.isTokenExpired()) {
            try {
                const response = await this.refreshToken();
                if (response.success && response.data) {
                    const tokenData = response.data as TokenResponseDto;
                    localStorage.setItem('accessToken', tokenData.accessToken);
                    localStorage.setItem('refreshToken', tokenData.refreshToken);
                    localStorage.setItem('tokenExpiry', tokenData.expiresAt);
                    return true;
                }
            } catch (error) {
                console.error('Token refresh failed:', error);
                await this.logout();
                return false;
            }
        }

        return true;
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
