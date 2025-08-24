// Auth utility functions

export const clearAuthData = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('userInfo');
        console.log('All auth data cleared from localStorage');
        
        // Navbar'ı güncellemek için event dispatch et
        window.dispatchEvent(new Event('userInfoChanged'));
    }
};

export const getAuthData = () => {
    if (typeof window === 'undefined') return null;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const userInfo = localStorage.getItem('userInfo');
    
    return {
        accessToken,
        refreshToken,
        tokenExpiry,
        userInfo: userInfo ? JSON.parse(userInfo) : null,
        hasTokens: !!(accessToken && refreshToken),
        isExpired: tokenExpiry ? new Date() > new Date(tokenExpiry) : true
    };
};

export const logAuthState = () => {
    const authData = getAuthData();
    console.log('Current auth state:', authData);
    return authData;
};
