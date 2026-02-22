// Type definitions based on the API schema

export type ShopStatus = "pending" | "active" | "suspended" | "blocked";
export type GameStatus = "pending" | "active" | "completed" | "cancelled";
export type TwoFactorMethod = "totp" | "email_code";
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "bet_debit"
  | "bet_credit"
  | "adjustment";

// User/Shop types
export interface ShopUser {
  id: number;
  username: string;
  name: string;
  shop_code: string;
  human_shop_id?: string | null;
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
  two_factor_totp_enabled?: boolean;
  two_factor_email_enabled?: boolean;
  two_factor_methods?: TwoFactorMethod[];
  must_change_password: boolean;
  created_at: string;
}

export interface ShopProfile {
  username: string;
  name: string;
  shop_code: string;
  human_shop_id?: string | null;
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
  two_factor_totp_enabled?: boolean;
  two_factor_email_enabled?: boolean;
  two_factor_methods?: TwoFactorMethod[];
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
  method?: TwoFactorMethod;
  otp?: string;
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
  cartella_draw_sequences: number[][];
  draw_sequence: number[];
  called_numbers?: number[];
  call_cursor?: number;
  current_called_number?: number | null;
  status: GameStatus;
  winners: number[];
  banned_cartellas?: number[];
  cartella_statuses?: Record<string, "active" | "banned" | "winner">;
  awarded_claims?: Array<Record<string, unknown>>;
  total_pool?: string;
  cut_percentage?: string;
  win_percentage?: string;
  payout_amount?: string;
  shop_cut_amount?: string;
  winning_pattern?: string;
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
  status: "completed" | "cancelled";
  winners: number[];
}

export interface GameClaimRequest {
  cartella_index: number;
  called_numbers?: number[];
  pattern?: "row" | "diagonal";
}

export interface GameClaimResponse {
  game_code: string;
  cartella_index: number;
  pattern?: "row" | "diagonal";
  is_bingo: boolean;
  is_banned?: boolean;
  cartella_status?: "active" | "banned" | "winner";
  cartella_statuses?: Record<string, "active" | "banned" | "winner">;
  status?: GameStatus;
  matched_count?: number;
  required_count?: number;
  missing_numbers?: number[];
  detail?: string;
  winner?: number;
  total_pool?: string;
  cut_percentage?: string;
  payout_amount?: string;
  shop_cut_amount?: string;
}

export interface ShopBingoPlayer {
  player_name: string;
  cartella_numbers: number[];
  bet_per_cartella: string;
  total_bet: string;
  paid: boolean;
  reserved_at?: string;
  paid_at?: string;
}

export interface ShopBingoSession {
  session_id: string;
  status: "waiting" | "locked" | "cancelled";
  fixed_players: number;
  min_bet_per_cartella: string;
  players_data: ShopBingoPlayer[];
  locked_cartellas: number[];
  total_payable: string;
  created_at: string;
  updated_at: string;
  game: number | null;
}

export interface ShopBingoSessionCreateRequest {
  min_bet_per_cartella?: string;
  fixed_players?: number;
}

export interface ShopBingoReserveRequest {
  player_name: string;
  cartella_numbers: number[];
  bet_per_cartella: string;
}

export interface ShopBingoConfirmPaymentRequest {
  player_name: string;
}

export interface ShopBingoConfirmPaymentResponse {
  session: ShopBingoSession;
  game_created: boolean;
  game?: Game;
}

export interface GameStateResponse {
  game_code: string;
  status: GameStatus;
  started_at: string | null;
  call_cursor: number;
  current_called_number: number | null;
  current_called_formatted: string | null;
  called_numbers: number[];
  cartella_statuses?: Record<string, "active" | "banned" | "winner">;
}

export interface GameNextCallResponse {
  game_code: string;
  called_number?: number;
  called_formatted?: string;
  called_numbers: number[];
  call_cursor?: number;
  current_called_number?: number;
  current_called_formatted?: string | null;
  is_complete: boolean;
}

export interface PublicCartellaResponse {
  game_id: string;
  cartella_number: number;
  cartella_numbers: number[];
  cartella_draw_sequence: number[];
  status: GameStatus;
  called_numbers: number[];
  created_at: string;
}

// Transaction types
export interface Transaction {
  id: number;
  tx_type: TransactionType;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GameHistoryItem {
  game_id: string;
  date: string;
  players: number;
  total_pool: string;
  winner: string[];
  shop_cut: string;
  status: GameStatus;
}

export interface WinHistoryItem {
  game_id: string;
  winner_indexes: number[];
  winning_pattern: string;
  payout_amount: string;
  date: string;
}

export interface BannedCartellaItem {
  game_id: string;
  cartella_index: number;
  status: string;
  date: string;
}

export interface ReportTransactionItem {
  id: number;
  game_id: string;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  reference: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface GameAuditReportResponse {
  game_history: GameHistoryItem[];
  win_history: WinHistoryItem[];
  banned_cartellas: BannedCartellaItem[];
  transactions: ReportTransactionItem[];
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
  feature_flags?: Record<string, any>;
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
