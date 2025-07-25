// API Configuration
export const apiConfig = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com' 
    : 'https://localhost:7057',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me',
      initAdmin: '/api/auth/init-admin',
      createAdmin: '/api/auth/create-admin',
    },
    products: '/api/products',
    categories: '/api/categories',
    orders: '/api/orders',
    carts: '/api/carts',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${apiConfig.baseUrl}${endpoint}`;
};

// API request helper with error handling
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(getApiUrl(endpoint), config);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    throw new Error('Network error - unable to connect to server');
  }
};
