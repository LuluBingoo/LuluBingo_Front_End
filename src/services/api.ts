// Main API file - handles both mock and real backend data
// Toggle USE_MOCK to switch between mock data and real backend

import { apiClient } from "./api/client";
import {
  mockAuthApi,
  mockGamesApi,
  mockShopApi,
  mockTransactionsApi,
} from "./mock/mockApi";
import { API_CONFIG, API_ENDPOINTS } from "./config";
import {
  LoginRequest,
  AuthTokenResponse,
  ChangePasswordRequest,
  TwoFactorSetup,
  ShopUser,
  ShopProfile,
  ProfileUpdateRequest,
  Game,
  GameCreateRequest,
  GameClaimRequest,
  GameClaimResponse,
  GameCompleteRequest,
  ShopBingoConfirmPaymentRequest,
  ShopBingoConfirmPaymentResponse,
  ShopBingoReserveRequest,
  ShopBingoSession,
  ShopBingoSessionCreateRequest,
  Transaction,
  TransactionRequest,
} from "./types";

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthTokenResponse> {
    if (API_CONFIG.USE_MOCK) {
      const response = await mockAuthApi.login(credentials);
      apiClient.setToken(response.token);
      return response;
    }
    const response = await apiClient.post<AuthTokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials,
    );
    apiClient.setToken(response.token);
    return response;
  },

  async getMe(): Promise<{ user: ShopUser }> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.getMe();
    }
    return await apiClient.get<{ user: ShopUser }>(API_ENDPOINTS.AUTH.ME);
  },

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<AuthTokenResponse> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.changePassword(data);
    }
    const response = await apiClient.post<AuthTokenResponse>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data,
    );
    apiClient.setToken(response.token);
    return response;
  },

  async forgotPassword(username: string, email: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.forgotPassword({
        username,
        contact_email: email,
      });
    }
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      username,
      contact_email: email,
    });
  },

  async resetPassword(
    uid: string,
    token: string,
    newPassword: string,
  ): Promise<AuthTokenResponse> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.resetPassword({
        uid,
        token,
        new_password: newPassword,
      });
    }
    const response = await apiClient.post<AuthTokenResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { uid, token, new_password: newPassword },
    );
    apiClient.setToken(response.token);
    return response;
  },

  async setup2FA(): Promise<TwoFactorSetup> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.setup2FA();
    }
    return await apiClient.get<TwoFactorSetup>(API_ENDPOINTS.AUTH.SETUP_2FA);
  },

  async enable2FA(otp: string): Promise<ShopUser> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.enable2FA(otp);
    }
    return await apiClient.post<ShopUser>(API_ENDPOINTS.AUTH.ENABLE_2FA, {
      otp,
    });
  },

  async disable2FA(otp: string): Promise<ShopUser> {
    if (API_CONFIG.USE_MOCK) {
      return await mockAuthApi.disable2FA(otp);
    }
    return await apiClient.post<ShopUser>(API_ENDPOINTS.AUTH.DISABLE_2FA, {
      otp,
    });
  },

  async logout(): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      apiClient.setToken(null);
      return;
    }
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      apiClient.setToken(null);
    }
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  getToken(): string | null {
    return apiClient.getToken();
  },
};

// =============================================================================
// GAMES API
// =============================================================================

export const gamesApi = {
  async getGames(): Promise<Game[]> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.getGames();
    }
    return await apiClient.get<Game[]>(API_ENDPOINTS.GAMES.LIST);
  },

  async createGame(data: GameCreateRequest): Promise<Game> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.createGame(data);
    }
    return await apiClient.post<Game>(API_ENDPOINTS.GAMES.CREATE, data);
  },

  async createShopSession(
    data: ShopBingoSessionCreateRequest,
  ): Promise<ShopBingoSession> {
    if (API_CONFIG.USE_MOCK) {
      throw new Error("Shop mode is not available in mock mode");
    }
    return await apiClient.post<ShopBingoSession>(
      API_ENDPOINTS.GAMES.SHOP_SESSION_CREATE,
      data,
    );
  },

  async getShopSession(sessionId: string): Promise<ShopBingoSession> {
    if (API_CONFIG.USE_MOCK) {
      throw new Error("Shop mode is not available in mock mode");
    }
    return await apiClient.get<ShopBingoSession>(
      API_ENDPOINTS.GAMES.SHOP_SESSION_DETAIL(sessionId),
    );
  },

  async reserveShopCartellas(
    sessionId: string,
    data: ShopBingoReserveRequest,
  ): Promise<ShopBingoSession> {
    if (API_CONFIG.USE_MOCK) {
      throw new Error("Shop mode is not available in mock mode");
    }
    return await apiClient.post<ShopBingoSession>(
      API_ENDPOINTS.GAMES.SHOP_SESSION_RESERVE(sessionId),
      data,
    );
  },

  async confirmShopPlayerPayment(
    sessionId: string,
    data: ShopBingoConfirmPaymentRequest,
  ): Promise<ShopBingoConfirmPaymentResponse> {
    if (API_CONFIG.USE_MOCK) {
      throw new Error("Shop mode is not available in mock mode");
    }
    return await apiClient.post<ShopBingoConfirmPaymentResponse>(
      API_ENDPOINTS.GAMES.SHOP_SESSION_CONFIRM(sessionId),
      data,
    );
  },

  async getGame(code: string): Promise<Game> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.getGame(code);
    }
    return await apiClient.get<Game>(API_ENDPOINTS.GAMES.DETAIL(code));
  },

  async getGameDraw(code: string): Promise<Game> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.getGameDraw(code);
    }
    return await apiClient.get<Game>(API_ENDPOINTS.GAMES.DRAW(code));
  },

  async completeGame(code: string, data: GameCompleteRequest): Promise<Game> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.completeGame(code, data);
    }
    return await apiClient.post<Game>(API_ENDPOINTS.GAMES.COMPLETE(code), data);
  },

  async claimGame(
    code: string,
    data: GameClaimRequest,
  ): Promise<GameClaimResponse> {
    if (API_CONFIG.USE_MOCK) {
      return {
        game_code: code,
        cartella_index: data.cartella_index,
        is_bingo: false,
        matched_count: 0,
        required_count: 24,
        missing_numbers: [],
      };
    }
    return await apiClient.post<GameClaimResponse>(
      API_ENDPOINTS.GAMES.CLAIM(code),
      data,
    );
  },

  async getCartellaDraw(code: string, cartellaNumber: number): Promise<any> {
    if (API_CONFIG.USE_MOCK) {
      return await mockGamesApi.getCartellaDraw(code, cartellaNumber);
    }
    return await apiClient.get<any>(
      API_ENDPOINTS.GAMES.CARTELLA_DRAW(code, cartellaNumber),
    );
  },

  async getPublicCartella(
    gameId: string,
    cartellaNumber: number,
  ): Promise<any> {
    if (API_CONFIG.USE_MOCK) {
      throw new Error("Public cartella route is not available in mock mode");
    }
    return await apiClient.get<any>(
      API_ENDPOINTS.GAMES.PUBLIC_CARTELLA(gameId, cartellaNumber),
    );
  },
};

// =============================================================================
// SHOP API
// =============================================================================

export const shopApi = {
  async getProfile(): Promise<ShopProfile> {
    if (API_CONFIG.USE_MOCK) {
      return await mockShopApi.getProfile();
    }
    return await apiClient.get<ShopProfile>(API_ENDPOINTS.SHOP.PROFILE);
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<ShopProfile> {
    if (API_CONFIG.USE_MOCK) {
      return await mockShopApi.updateProfile(data);
    }
    return await apiClient.put<ShopProfile>(
      API_ENDPOINTS.SHOP.UPDATE_PROFILE,
      data,
    );
  },
};

// =============================================================================
// TRANSACTIONS API
// =============================================================================

export const transactionsApi = {
  async getHistory(): Promise<Transaction[]> {
    if (API_CONFIG.USE_MOCK) {
      return await mockTransactionsApi.getHistory();
    }
    return await apiClient.get<Transaction[]>(
      API_ENDPOINTS.TRANSACTIONS.HISTORY,
    );
  },

  async deposit(amount: string, reference: string): Promise<Transaction> {
    if (API_CONFIG.USE_MOCK) {
      return await mockTransactionsApi.deposit({ amount, reference });
    }
    return await apiClient.post<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.DEPOSIT,
      { amount, reference },
    );
  },

  async withdraw(amount: string, reference: string): Promise<Transaction> {
    if (API_CONFIG.USE_MOCK) {
      return await mockTransactionsApi.withdraw({ amount, reference });
    }
    return await apiClient.post<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.WITHDRAW,
      { amount, reference },
    );
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const apiHelpers = {
  // Calculate win amount
  calculateWinAmount(betAmount: string, numPlayers: number): string {
    const bet = parseFloat(betAmount);
    const total = bet * numPlayers;
    return total.toFixed(2);
  },

  // Get today's transactions
  getTodayTransactions(transactions: Transaction[]): Transaction[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter((tx) => {
      const txDate = new Date(tx.created_at);
      txDate.setHours(0, 0, 0, 0);
      return txDate.getTime() === today.getTime();
    });
  },

  // Calculate today's earnings
  calculateTodayEarnings(transactions: Transaction[]): number {
    const todayTxs = this.getTodayTransactions(transactions);
    return todayTxs.reduce((total, tx) => {
      if (tx.tx_type === "win" || tx.tx_type === "commission") {
        return total + parseFloat(tx.amount);
      }
      return total;
    }, 0);
  },

  // Get today's deposits count
  getTodayDeposits(transactions: Transaction[]): number {
    const todayTxs = this.getTodayTransactions(transactions);
    return todayTxs.filter((tx) => tx.tx_type === "deposit").length;
  },

  // Get today's games
  getTodayGames(games: Game[]): Game[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return games.filter((game) => {
      const gameDate = new Date(game.created_at);
      gameDate.setHours(0, 0, 0, 0);
      return gameDate.getTime() === today.getTime();
    });
  },

  // Validate email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  },

  // Validate amount
  isValidAmount(amount: string): boolean {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  },
};
