// Type definitions based on the API schema

export type ShopStatus = 'pending' | 'active' | 'suspended' | 'blocked';
export type GameStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type TwoFactorMethod = 'totp';
export type TransactionType = 'deposit' | 'withdraw' | 'bet' | 'win' | 'commission';

// User/Shop types
export interface ShopUser {
  id: number;
  username: string;
  name: string;
  shop_code: string;
  status: ShopStatus;
  contact_phone: string;
  contact_email: string;
  wallet_balance: string;
  commission_rate: string;
  max_stake: string;
  feature_flags: Record<string, any>;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  profile_completed: boolean;
  two_factor_enabled: boolean;
  two_factor_method: TwoFactorMethod;
  must_change_password: boolean;
  created_at: string;
}

export interface ShopProfile {
  username: string;
  name: string;
  shop_code: string;
  contact_phone: string;
  contact_email: string;
  bank_name: string;
  bank_account_name: string;
  bank_account_number: string;
  profile_completed: boolean;
  status: ShopStatus;
  wallet_balance: string;
  commission_rate: string;
  max_stake: string;
  feature_flags: Record<string, any>;
  two_factor_enabled: boolean;
  two_factor_method: TwoFactorMethod;
  created_at: string;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
  otp?: string;
}

export interface AuthTokenResponse {
  token: string;
  requires_password_change: boolean;
  user: ShopUser;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface TwoFactorSetup {
  secret: string;
  provisioning_uri: string;
}

// Game types
export interface Game {
  id: number;
  game_code: string;
  bet_amount: string;
  num_players: number;
  win_amount: string;
  cartella_numbers: number[][];
  cartella_draw_sequences: Record<string, any>;
  draw_sequence: number[];
  status: GameStatus;
  winners: number[];
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface GameCreateRequest {
  bet_amount: string;
  num_players: number;
  win_amount: string;
  cartella_numbers: number[][];
}

export interface GameCompleteRequest {
  status: 'completed' | 'cancelled';
  winners: number[];
}

// Transaction types
export interface Transaction {
  id: number;
  tx_type: TransactionType;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  metadata: string;
  created_at: string;
}

export interface TransactionRequest {
  amount: string;
  reference: string;
}

// Profile update types
export interface ProfileUpdateRequest {
  name?: string;
  contact_phone?: string;
  contact_email?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  profile_completed?: boolean;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

// Dashboard stats
export interface DashboardStats {
  deposit: string;
  gamesToday: number;
  earningToday: string;
  availableBalance: string;
}
