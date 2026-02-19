// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: true, // Toggle between mock and real API
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/password/change',
    FORGOT_PASSWORD: '/auth/password/forgot',
    RESET_PASSWORD: '/auth/password/reset',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    SETUP_2FA: '/auth/2fa/setup',
  },
  // Games
  GAMES: {
    LIST: '/games/games',
    CREATE: '/games/games',
    DETAIL: (code: string) => `/games/games/${code}`,
    DRAW: (code: string) => `/games/games/${code}/draw`,
    COMPLETE: (code: string) => `/games/games/${code}/complete`,
    CARTELLA_DRAW: (code: string, cartellaNumber: number) => 
      `/games/games/${code}/cartellas/${cartellaNumber}/draw`,
  },
  // Shop Profile
  SHOP: {
    PROFILE: '/shop/profile',
    UPDATE_PROFILE: '/shop/profile',
  },
  // Transactions
  TRANSACTIONS: {
    HISTORY: '/transactions/transactions/history',
    DEPOSIT: '/transactions/transactions/deposit',
    WITHDRAW: '/transactions/transactions/withdraw',
  },
};

// Toggle between mock and real API
export const setUseMock = (useMock: boolean) => {
  API_CONFIG.USE_MOCK = useMock;
};

// Get current mode
export const isMockMode = () => API_CONFIG.USE_MOCK;
