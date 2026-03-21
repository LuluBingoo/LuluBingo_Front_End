// Mock API implementation for development
import {
  AuthTokenResponse,
  ShopProfile,
  Game,
  Transaction,
  LoginRequest,
  GameCreateRequest,
  TransactionRequest,
  ProfileUpdateRequest,
  ChangePasswordRequest,
  TwoFactorSetup,
  GameCompleteRequest,
} from "../types";
import {
  mockAuthResponse,
  mockProfile,
  mockGames,
  mockTransactions,
  mockUser,
  generateMockGame,
} from "./mockData";

// Simulate network delay
const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock storage for games and transactions
let gamesStore: Game[] = [...mockGames];
let transactionsStore: Transaction[] = [...mockTransactions];
let userProfile: ShopProfile = { ...mockProfile };
let currentUser = { ...mockUser };

export const mockAuthApi = {
  async login(credentials: LoginRequest): Promise<AuthTokenResponse> {
    await delay();

    // Simple mock validation
    if (credentials.username && credentials.password) {
      return { ...mockAuthResponse };
    }

    throw new Error("Invalid credentials");
  },

  async getMe(): Promise<{ user: typeof mockUser }> {
    await delay();
    return { user: currentUser };
  },

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<AuthTokenResponse> {
    await delay();
    return { ...mockAuthResponse };
  },

  async forgotPassword(data: {
    username: string;
    contact_email: string;
  }): Promise<void> {
    await delay();
    console.log("Password reset email sent to:", data.contact_email);
  },

  async resetPassword(data: {
    uid: string;
    token: string;
    new_password: string;
  }): Promise<AuthTokenResponse> {
    await delay();
    return { ...mockAuthResponse };
  },

  async setup2FA(): Promise<TwoFactorSetup> {
    await delay();
    return {
      secret: "MOCK_SECRET_KEY",
      provisioning_uri:
        "otpauth://totp/LuluBingo:shop_demo?secret=MOCK_SECRET_KEY&issuer=LuluBingo",
    };
  },

  async enable2FA(otp: string): Promise<typeof mockUser> {
    await delay();
    currentUser.two_factor_enabled = true;
    return { ...currentUser };
  },

  async disable2FA(otp: string): Promise<typeof mockUser> {
    await delay();
    currentUser.two_factor_enabled = false;
    return { ...currentUser };
  },
};

export const mockGamesApi = {
  async getGames(): Promise<Game[]> {
    await delay();
    return [...gamesStore];
  },

  async createGame(data: GameCreateRequest): Promise<Game> {
    await delay();
    const newGame = generateMockGame(
      data.bet_amount,
      data.num_players,
      data.win_amount,
    );
    gamesStore.unshift(newGame);
    return newGame;
  },

  async getGame(code: string): Promise<Game> {
    await delay();
    const game = gamesStore.find((g) => g.game_code === code);
    if (!game) {
      throw new Error("Game not found");
    }
    return { ...game };
  },

  async getGameDraw(code: string): Promise<Game> {
    await delay();
    const game = gamesStore.find((g) => g.game_code === code);
    if (!game) {
      throw new Error("Game not found");
    }
    return { ...game };
  },

  async completeGame(code: string, data: GameCompleteRequest): Promise<Game> {
    await delay();
    const gameIndex = gamesStore.findIndex((g) => g.game_code === code);
    if (gameIndex === -1) {
      throw new Error("Game not found");
    }

    gamesStore[gameIndex] = {
      ...gamesStore[gameIndex],
      status: data.status,
      winners: data.winners,
      ended_at: new Date().toISOString(),
    };

    return { ...gamesStore[gameIndex] };
  },

  async getCartellaDraw(code: string, cartellaNumber: number): Promise<any> {
    await delay();
    const game = gamesStore.find((g) => g.game_code === code);
    if (!game) {
      throw new Error("Game not found");
    }

    return {
      cartella_number: cartellaNumber,
      draw_sequence: game.draw_sequence,
    };
  },
};

export const mockShopApi = {
  async getProfile(): Promise<ShopProfile> {
    await delay();
    return { ...userProfile };
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<ShopProfile> {
    await delay();
    userProfile = {
      ...userProfile,
      ...data,
    };
    return { ...userProfile };
  },
};

export const mockTransactionsApi = {
  async getHistory(): Promise<Transaction[]> {
    await delay();
    return [...transactionsStore];
  },

  async deposit(data: TransactionRequest): Promise<Transaction> {
    await delay();
    const balanceBefore = parseFloat(userProfile.wallet_balance);
    const amount = parseFloat(data.amount);
    const balanceAfter = balanceBefore + amount;

    const transaction: Transaction = {
      id: transactionsStore.length + 1,
      tx_type: "deposit",
      amount: data.amount,
      balance_before: balanceBefore.toFixed(2),
      balance_after: balanceAfter.toFixed(2),
      reference: data.reference,
      metadata: "{}",
      created_at: new Date().toISOString(),
    };

    transactionsStore.unshift(transaction);
    userProfile.wallet_balance = balanceAfter.toFixed(2);
    currentUser.wallet_balance = balanceAfter.toFixed(2);

    return transaction;
  },

  async withdraw(data: TransactionRequest): Promise<Transaction> {
    await delay();
    const balanceBefore = parseFloat(userProfile.wallet_balance);
    const amount = parseFloat(data.amount);

    if (balanceBefore < amount) {
      throw new Error("Insufficient balance");
    }

    const balanceAfter = balanceBefore - amount;

    const transaction: Transaction = {
      id: transactionsStore.length + 1,
      tx_type: "withdraw",
      amount: `-${data.amount}`,
      balance_before: balanceBefore.toFixed(2),
      balance_after: balanceAfter.toFixed(2),
      reference: data.reference,
      metadata: "{}",
      created_at: new Date().toISOString(),
    };

    transactionsStore.unshift(transaction);
    userProfile.wallet_balance = balanceAfter.toFixed(2);
    currentUser.wallet_balance = balanceAfter.toFixed(2);

    return transaction;
  },
};

// Reset mock data (useful for testing)
export const resetMockData = () => {
  gamesStore = [...mockGames];
  transactionsStore = [...mockTransactions];
  userProfile = { ...mockProfile };
  currentUser = { ...mockUser };
};
