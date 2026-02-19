// Mock data for development and testing
import { 
  ShopUser, 
  ShopProfile, 
  Game, 
  Transaction, 
  DashboardStats,
  AuthTokenResponse 
} from '../types';

// Mock user data
export const mockUser: ShopUser = {
  id: 1,
  username: 'shop_demo',
  name: 'Dallol Bingo Shop',
  shop_code: 'SHOP001',
  status: 'active',
  contact_phone: '+251911234567',
  contact_email: 'shop@dallolbingo.et',
  wallet_balance: '818.00',
  commission_rate: '5.00',
  max_stake: '1000.00',
  feature_flags: {},
  bank_name: 'Commercial Bank of Ethiopia',
  bank_account_name: 'Dallol Bingo Shop',
  bank_account_number: '1000123456789',
  profile_completed: true,
  two_factor_enabled: false,
  two_factor_method: 'totp',
  must_change_password: false,
  created_at: '2024-01-15T10:00:00Z',
};

export const mockProfile: ShopProfile = {
  username: mockUser.username,
  name: mockUser.name,
  shop_code: mockUser.shop_code,
  contact_phone: mockUser.contact_phone,
  contact_email: mockUser.contact_email,
  bank_name: mockUser.bank_name,
  bank_account_name: mockUser.bank_account_name,
  bank_account_number: mockUser.bank_account_number,
  profile_completed: mockUser.profile_completed,
  status: mockUser.status,
  wallet_balance: mockUser.wallet_balance,
  commission_rate: mockUser.commission_rate,
  max_stake: mockUser.max_stake,
  feature_flags: mockUser.feature_flags,
  two_factor_enabled: mockUser.two_factor_enabled,
  two_factor_method: mockUser.two_factor_method,
  created_at: mockUser.created_at,
};

// Mock games data
export const mockGames: Game[] = [
  {
    id: 2860308,
    game_code: 'GAME2860308',
    bet_amount: '10.00',
    num_players: 4,
    win_amount: '40.00',
    cartella_numbers: [[1, 16, 31, 46, 61], [2, 17, 32, 47, 62]],
    cartella_draw_sequences: {},
    draw_sequence: [5, 12, 23, 34, 45],
    status: 'active',
    winners: [],
    created_at: '2026-02-16T08:00:00Z',
    started_at: '2026-02-16T08:05:00Z',
    ended_at: null,
  },
  {
    id: 2860304,
    game_code: 'GAME2860304',
    bet_amount: '10.00',
    num_players: 4,
    win_amount: '40.00',
    cartella_numbers: [[3, 18, 33, 48, 63], [4, 19, 34, 49, 64]],
    cartella_draw_sequences: {},
    draw_sequence: [7, 14, 21, 28, 35],
    status: 'active',
    winners: [],
    created_at: '2026-02-16T07:00:00Z',
    started_at: '2026-02-16T07:05:00Z',
    ended_at: null,
  },
];

// Mock transactions data
export const mockTransactions: Transaction[] = [
  {
    id: 1,
    tx_type: 'deposit',
    amount: '500.00',
    balance_before: '318.00',
    balance_after: '818.00',
    reference: 'DEP001',
    metadata: '{}',
    created_at: '2026-02-16T06:00:00Z',
  },
  {
    id: 2,
    tx_type: 'bet',
    amount: '-10.00',
    balance_before: '818.00',
    balance_after: '808.00',
    reference: 'GAME2860308',
    metadata: '{"game_id": 2860308}',
    created_at: '2026-02-16T08:00:00Z',
  },
  {
    id: 3,
    tx_type: 'bet',
    amount: '-10.00',
    balance_before: '808.00',
    balance_after: '798.00',
    reference: 'GAME2860304',
    metadata: '{"game_id": 2860304}',
    created_at: '2026-02-16T07:00:00Z',
  },
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  deposit: '2',
  gamesToday: 0,
  earningToday: '$0',
  availableBalance: '$818.00',
};

// Mock auth response
export const mockAuthResponse: AuthTokenResponse = {
  token: 'mock_jwt_token_12345',
  requires_password_change: false,
  user: mockUser,
};

// Helper to generate random cartella numbers
export const generateCartellaNumbers = (): number[][] => {
  const cartella: number[][] = [];
  const columnRanges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 }   // O
  ];

  for (let col = 0; col < 5; col++) {
    const { min, max } = columnRanges[col];
    const columnNumbers: number[] = [];
    
    while (columnNumbers.length < 5) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!columnNumbers.includes(num)) {
        columnNumbers.push(num);
      }
    }
    
    cartella.push(columnNumbers);
  }

  return cartella;
};

// Helper to generate mock game
export const generateMockGame = (
  betAmount: string,
  numPlayers: number,
  winAmount: string
): Game => {
  const gameId = Math.floor(Math.random() * 9000000) + 1000000;
  const cartellaNumbers: number[][] = [];
  
  for (let i = 0; i < numPlayers; i++) {
    cartellaNumbers.push(...generateCartellaNumbers());
  }

  return {
    id: gameId,
    game_code: `GAME${gameId}`,
    bet_amount: betAmount,
    num_players: numPlayers,
    win_amount: winAmount,
    cartella_numbers: cartellaNumbers,
    cartella_draw_sequences: {},
    draw_sequence: [],
    status: 'pending',
    winners: [],
    created_at: new Date().toISOString(),
    started_at: null,
    ended_at: null,
  };
};
