# Backend Integration Guide

This guide explains how to use the service layer in your components and how to switch between mock and real backend data.

## Current Setup

The frontend is currently configured to use **MOCK DATA** for development. This allows you to work on the UI without needing the backend to be ready.

## How It Works

All API calls go through `src/services/api.ts`, which automatically routes requests to either:
- **Mock API** (fake data stored in memory) - for development
- **Real Backend** (actual API calls) - for production

The UI components don't know the difference - they just call the API functions and get data back.

## Quick Start

### 1. Import the API in your component

```typescript
import { authApi, gamesApi, shopApi, transactionsApi } from '../services';
```

### 2. Use the API functions

```typescript
// Example: Login
const handleLogin = async (username: string, password: string) => {
  try {
    const response = await authApi.login({ username, password });
    console.log('User:', response.user);
    console.log('Token:', response.token);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Example: Get games
const loadGames = async () => {
  try {
    const games = await gamesApi.getGames();
    console.log('Games:', games);
  } catch (error) {
    console.error('Failed to load games:', error);
  }
};

// Example: Get profile
const loadProfile = async () => {
  try {
    const profile = await shopApi.getProfile();
    console.log('Profile:', profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};
```

## Switching to Real Backend

When your backend is ready, you have two options:

### Option 1: Change the config file (Permanent)

Edit `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: false, // Change this from true to false
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

### Option 2: Toggle at runtime (Temporary/Testing)

```typescript
import { setUseMock } from './services';

// Use mock data
setUseMock(true);

// Use real backend
setUseMock(false);
```

## Available APIs

### Authentication (authApi)

```typescript
// Login
await authApi.login({ username, password, otp? });

// Get current user
await authApi.getMe();

// Change password
await authApi.changePassword({ current_password, new_password });

// Logout
authApi.logout();

// Check if authenticated
const isAuth = authApi.isAuthenticated();
```

### Games (gamesApi)

```typescript
// Get all games
await gamesApi.getGames();

// Create new game
await gamesApi.createGame({
  bet_amount: '10.00',
  num_players: 4,
  win_amount: '40.00',
  cartella_numbers: [[1, 16, 31, 46, 61]]
});

// Get specific game
await gamesApi.getGame(gameCode);

// Complete game
await gamesApi.completeGame(gameCode, {
  status: 'completed',
  winners: [1, 2]
});
```

### Shop Profile (shopApi)

```typescript
// Get profile
await shopApi.getProfile();

// Update profile
await shopApi.updateProfile({
  name: 'New Shop Name',
  contact_email: 'new@email.com',
  contact_phone: '+251911234567'
});
```

### Transactions (transactionsApi)

```typescript
// Get transaction history
await transactionsApi.getHistory();

// Make deposit
await transactionsApi.deposit('100.00', 'DEP001');

// Make withdrawal
await transactionsApi.withdraw('50.00', 'WD001');
```

### Helpers (apiHelpers)

```typescript
import { apiHelpers } from '../services';

// Calculate win amount
const winAmount = apiHelpers.calculateWinAmount('10.00', 4); // '40.00'

// Get today's transactions
const todayTxs = apiHelpers.getTodayTransactions(allTransactions);

// Calculate today's earnings
const earnings = apiHelpers.calculateTodayEarnings(allTransactions);

// Validate email
const isValid = apiHelpers.isValidEmail('test@example.com');
```

## Example: Complete Component

Here's a complete example of a component using the API:

```typescript
import React, { useState, useEffect } from 'react';
import { gamesApi, shopApi, apiHelpers, Game, ShopProfile } from '../services';

export const Dashboard: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [profile, setProfile] = useState<ShopProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load data in parallel
      const [gamesData, profileData] = await Promise.all([
        gamesApi.getGames(),
        shopApi.getProfile()
      ]);

      setGames(gamesData);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      const newGame = await gamesApi.createGame({
        bet_amount: '10.00',
        num_players: 4,
        win_amount: apiHelpers.calculateWinAmount('10.00', 4),
        cartella_numbers: [[1, 16, 31, 46, 61]]
      });
      
      setGames([newGame, ...games]);
      alert('Game created successfully!');
    } catch (err: any) {
      alert('Failed to create game: ' + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Welcome {profile?.name}</h1>
      <p>Balance: ${profile?.wallet_balance}</p>
      <p>Total Games: {games.length}</p>
      <p>Today's Games: {apiHelpers.getTodayGames(games).length}</p>
      
      <button onClick={handleCreateGame}>Create New Game</button>
      
      <ul>
        {games.map(game => (
          <li key={game.id}>
            {game.game_code} - {game.status}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## TypeScript Types

All API responses are fully typed. Import types as needed:

```typescript
import { 
  Game, 
  ShopProfile, 
  ShopUser,
  Transaction,
  GameCreateRequest,
  AuthTokenResponse 
} from '../services';
```

## Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const result = await gamesApi.createGame(data);
  // Handle success
} catch (error: any) {
  // Handle error
  console.error('Error:', error.message);
  alert('Operation failed: ' + error.message);
}
```

## Testing Checklist

Before switching to real backend:

1. [ ] Test all pages with mock data
2. [ ] Verify all API calls work correctly
3. [ ] Check error handling
4. [ ] Ensure UI updates properly with data
5. [ ] Backend is deployed and accessible
6. [ ] Backend endpoints match the API schema
7. [ ] CORS is configured on backend
8. [ ] Authentication tokens work
9. [ ] Change `USE_MOCK` to `false`
10. [ ] Test with real backend

## Troubleshooting

### Mock data not updating
- Mock data is stored in memory and resets on page refresh
- Check `src/services/mock/mockData.ts` for initial data

### Real API not working
- Check `USE_MOCK` is set to `false` in config
- Verify `BASE_URL` is correct
- Check browser console for CORS errors
- Verify backend is running and accessible

### Type errors
- Make sure you're importing types from `../services`
- Check that your data matches the expected types
- Use TypeScript's type checking to catch issues early

## Need Help?

- Check `src/services/README.md` for detailed API documentation
- Look at `src/services/mock/mockData.ts` to see example data structures
- Review `src/services/types.ts` for all available types
