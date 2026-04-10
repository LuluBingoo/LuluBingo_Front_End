const getEnvString = (value: string | undefined, fallback: string): string => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
};

const getEnvNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getEnvBoolean = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return fallback;
};

type RuntimeEnv = {
  VITE_API_BASE_URL?: string;
  VITE_API_USE_MOCK?: string;
  VITE_API_TIMEOUT?: string;
  VITE_API_RETRY_ATTEMPTS?: string;
};

const runtimeEnv = ((import.meta as ImportMeta & { env?: RuntimeEnv }).env ||
  {}) as RuntimeEnv;

// API Configuration
export const API_CONFIG = {
  BASE_URL: getEnvString(
    runtimeEnv.VITE_API_BASE_URL,
    "https://api.lulubingo.com/api",
  ),
  USE_MOCK: getEnvBoolean(runtimeEnv.VITE_API_USE_MOCK, false),
  TIMEOUT: getEnvNumber(runtimeEnv.VITE_API_TIMEOUT, 10000),
  RETRY_ATTEMPTS: getEnvNumber(runtimeEnv.VITE_API_RETRY_ATTEMPTS, 3),
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/password/change",
    FORGOT_PASSWORD: "/auth/password/forgot",
    RESET_PASSWORD: "/auth/password/reset",
    ENABLE_2FA: "/auth/2fa/enable",
    DISABLE_2FA: "/auth/2fa/disable",
    SETUP_2FA: "/auth/2fa/setup",
    EMAIL_2FA_CODE: "/auth/2fa/email-code",
  },
  // Games
  GAMES: {
    LIST: "/games/games",
    CREATE: "/games/games",
    SHOP_SESSION_CREATE: "/games/games/shop-mode/sessions",
    SHOP_SESSION_DETAIL: (sessionId: string) =>
      `/games/games/shop-mode/sessions/${sessionId}`,
    SHOP_SESSION_RESERVE: (sessionId: string) =>
      `/games/games/shop-mode/sessions/${sessionId}/reserve`,
    SHOP_SESSION_CONFIRM: (sessionId: string) =>
      `/games/games/shop-mode/sessions/${sessionId}/confirm-payment`,
    SHOP_SESSION_CREATE_GAME: (sessionId: string) =>
      `/games/games/shop-mode/sessions/${sessionId}/create-game`,
    DETAIL: (code: string) => `/games/games/${code}`,
    DRAW: (code: string) => `/games/games/${code}/draw`,
    STATE: (code: string) => `/games/games/${code}/state`,
    SHUFFLE: (code: string) => `/games/games/${code}/shuffle`,
    START: (code: string) => `/games/games/${code}/start`,
    NEXT_CALL: (code: string) => `/games/games/${code}/next-call`,
    REPORTS: "/games/games/reports",
    CLAIM: (code: string) => `/games/games/${code}/claim`,
    COMPLETE: (code: string) => `/games/games/${code}/complete`,
    CARTELLA_DRAW: (code: string, cartellaNumber: number) =>
      `/games/games/${code}/cartellas/${cartellaNumber}/draw`,
    PUBLIC_CARTELLA: "/games/game/cartellas/check",
  },
  // Shop Profile
  SHOP: {
    PROFILE: "/shop/profile",
    UPDATE_PROFILE: "/shop/profile",
  },
  // Transactions
  TRANSACTIONS: {
    HISTORY: "/transactions/transactions/history",
    DEPOSIT: "/transactions/transactions/deposit",
    WITHDRAW: "/transactions/transactions/withdraw",
  },
  // Admin (manager only)
  ADMIN: {
    SHOPS: "/admin/shops",
    SHOP_DETAIL: (shopId: number) => `/admin/shops/${shopId}`,
    SHOP_FILL_BALANCE: (shopId: number) =>
      `/admin/shops/${shopId}/fill-balance`,
    MANAGERS: "/admin/managers",
    GAMES: "/admin/games",
    TRANSACTIONS: "/admin/transactions",
  },
};

// Toggle between mock and real API
export const setUseMock = (useMock: boolean) => {
  API_CONFIG.USE_MOCK = useMock;
};

// Get current mode
export const isMockMode = () => API_CONFIG.USE_MOCK;
