# Services Layer Documentation

This directory contains the service layer that manages all API communication and data fetching for the Dallol Bingo frontend application.

## Architecture Overview

The service layer is designed to:
- Provide a clean abstraction between UI components and backend API
- Support both mock data (for development) and real API calls
- Maintain consistent data flow across all pages
- Make backend integration seamless by changing a single configuration flag

## Directory Structure

```
services/
├── api/
│   └── client.ts          # HTTP client for real API calls
├── mock/
│   ├── mockData.ts        # Mock data definitions
│   └── mockApi.ts         # Mock API implementations
├── config.ts              # API configuration and endpoints
├── types.ts               # TypeScript type definitions
├── api.ts                 # Main API file (handles mock/real switching)
└── index.ts               # Central export point
```

## Quick Start

### 1. Import API

```typescript
import { authApi, gamesApi, shopApi, transactionsApi, apiHelpers } from '../services';
```

### 2. Toggle Between Mock and Real API

```typescript
import { setUseMock, isMockMode } from '../services';

// Use mock data (default)
setUseMock(true);

// Use real API
setUseMock(false);

// Check current mode
const isUsingMock = isMockMode();
```

### 3. Use API in Components

```typescript
// Login example
const handleLogin = async () => {
  try {
    const response = await authApi.login({
      username: 'shop_demo',
      password: 'password123'
    });
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Create game example
const handleCreateGame = async () => {
  try {
    const game = await gamesApi.createGame({
      bet_amount: '10.00',
      num_players: 4,
      win_amount: '40.00',
      cartella_numbers: [[1, 16, 31, 46, 61]]
    });
    console.log('Game created:', game);
  } catch (error) {
    console.error('Failed to create game:', error);
  }
};

// Get profile example
const loadProfile = async () => {
  try {
    const profile = await shopApi.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};
```

## API Reference

### authApi

Authentication and user management.

**Methods:**
- `login(credentials)` - Login with username/password
- `getMe()` - Get current user info
- `changePassword(data)` - Change password
- `forgotPassword(username, email)` - Request password reset
- `resetPassword(uid, token, newPassword)` - Reset password
- `setup2FA()` - Setup two-factor authentication
- `enable2FA(otp)` - Enable 2FA
- `disable2FA(otp)` - Disable 2FA
- `logout()` - Logout user
- `isAuthenticated()` - Check if user is authenticated
- `getToken()` - Get auth token

### gamesApi

Game operations.

**Methods:**
- `getGames()` - Get all games
- `createGame(data)` - Create new game
- `getGame(code)` - Get game by code
- `getGameDraw(code)` - Get game draw sequence
- `completeGame(code, data)` - Complete or cancel game
- `getCartellaDraw(code, cartellaNumber)` - Get cartella draw

### shopApi

Shop profile management.

**Methods:**
- `getProfile()` - Get shop profile
- `updateProfile(data)` - Update shop profile

### transactionsApi

Financial transactions.

**Methods:**
- `getHistory()` - Get transaction history
- `deposit(amount, reference)` - Make deposit
- `withdraw(amount, reference)` - Make withdrawal

### apiHelpers

Utility functions.

**Methods:**
- `calculateWinAmount(betAmount, numPlayers)` - Calculate win amount
- `getTodayTransactions(transactions)` - Filter today's transactions
- `calculateTodayEarnings(transactions)` - Calculate today's earnings
- `getTodayDeposits(transactions)` - Count today's deposits
- `getTodayGames(games)` - Filter today's games
- `isValidEmail(email)` - Validate email format
- `isValidPhone(phone)` - Validate phone format
- `isValidAmount(amount)` - Validate amount

## Switching from Mock to Real API

When your backend is ready:

1. **Update the configuration:**
```typescript
// In src/services/config.ts
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: false, // Change this to false
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

2. **Or toggle at runtime:**
```typescript
import { setUseMock } from './services';

// In your app initialization or settings
setUseMock(false);
```

3. **That's it!** All components will automatically use the real API.

## Error Handling

All API calls throw errors that can be caught and handled:

```typescript
try {
  await gamesApi.createGame(gameData);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Type Safety

All APIs are fully typed with TypeScript. Import types as needed:

```typescript
import { 
  Game, 
  ShopProfile, 
  Transaction,
  GameCreateRequest 
} from '../services';
```

## Best Practices

1. **Always use the API** - Never make direct API calls from components
2. **Handle errors** - Always wrap API calls in try-catch
3. **Type everything** - Leverage TypeScript for type safety
4. **Use helpers** - Utilize apiHelpers for common operations

## Example Component Usage

```typescript
import React, { useState, useEffect } from 'react';
import { gamesApi, shopApi, Game, ShopProfile } from '../services';

const MyComponent = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gamesData, profileData] = await Promise.all([
        gamesApi.getGames(),
        shopApi.getProfile()
      ]);
      setGames(gamesData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome {profile?.name}</h1>
      <p>Games: {games.length}</p>
    </div>
  );
};
```

## Testing

Mock mode is perfect for:
- Development without backend
- Testing UI flows
- Demos and presentations
- Unit testing components

## Backend Integration Checklist

- [ ] Backend API is deployed and accessible
- [ ] API endpoints match the schema in `config.ts`
- [ ] Authentication tokens are working
- [ ] CORS is configured on backend
- [ ] Change `USE_MOCK` to `false` in config
- [ ] Test all major flows (login, create game, etc.)
- [ ] Handle backend-specific error responses
