# Quick Reference - Service Layer

## 🚀 Quick Start

```typescript
// 1. Import the API
import { authApi, gamesApi, shopApi, transactionsApi } from '../services';

// 2. Use it
const games = await gamesApi.getGames();
```

## 🔄 Switch Between Mock and Real

```typescript
// In src/services/config.ts
USE_MOCK: true   // ← Mock data (current)
USE_MOCK: false  // ← Real backend (when ready)
```

## 📚 Common Operations

### Authentication
```typescript
// Login
const response = await authApi.login({ username, password });
const token = response.token;
const user = response.user;

// Get current user
const { user } = await authApi.getMe();

// Logout
authApi.logout();

// Check if logged in
if (authApi.isAuthenticated()) { ... }
```

### Games
```typescript
// Get all games
const games = await gamesApi.getGames();

// Create game
const newGame = await gamesApi.createGame({
  bet_amount: '10.00',
  num_players: 4,
  win_amount: '40.00',
  cartella_numbers: [[1, 16, 31, 46, 61]]
});

// Get specific game
const game = await gamesApi.getGame('GAME123');

// Complete game
await gamesApi.completeGame('GAME123', {
  status: 'completed',
  winners: [1, 2]
});
```

### Profile
```typescript
// Get profile
const profile = await shopApi.getProfile();

// Update profile
await shopApi.updateProfile({
  name: 'New Name',
  contact_email: 'new@email.com'
});
```

### Transactions
```typescript
// Get history
const transactions = await transactionsApi.getHistory();

// Deposit
await transactionsApi.deposit('100.00', 'DEP001');

// Withdraw
await transactionsApi.withdraw('50.00', 'WD001');
```

### Helpers
```typescript
import { apiHelpers } from '../services';

// Calculate win amount
const win = apiHelpers.calculateWinAmount('10.00', 4); // '40.00'

// Get today's transactions
const today = apiHelpers.getTodayTransactions(allTxs);

// Validate
apiHelpers.isValidEmail('test@example.com'); // true
apiHelpers.isValidPhone('+251911234567'); // true
apiHelpers.isValidAmount('100.00'); // true
```

## 🎯 Component Pattern

```typescript
import React, { useState, useEffect } from 'react';
import { gamesApi, Game } from '../services';

export const MyComponent: React.FC = () => {
  const [data, setData] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await gamesApi.getGames();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* Render data */}</div>;
};
```

## 📦 Available Types

```typescript
import {
  // User types
  ShopUser,
  ShopProfile,
  
  // Game types
  Game,
  GameCreateRequest,
  GameCompleteRequest,
  
  // Transaction types
  Transaction,
  TransactionRequest,
  
  // Auth types
  LoginRequest,
  AuthTokenResponse,
  ChangePasswordRequest,
  
  // Other
  ShopStatus,
  GameStatus,
  TransactionType
} from '../services';
```

## ⚠️ Error Handling

```typescript
try {
  const result = await gamesApi.createGame(data);
  // Success
} catch (error: any) {
  // Error
  console.error(error.message);
  alert('Failed: ' + error.message);
}
```

## 🔧 Configuration

```typescript
// src/services/config.ts
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: true,  // ← Change this
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

## 📁 File Locations

```
src/services/
├── api.ts          ← Main API (use this!)
├── config.ts       ← Configuration (change USE_MOCK here)
├── types.ts        ← TypeScript types
├── index.ts        ← Exports
├── api/
│   └── client.ts   ← HTTP client
└── mock/
    ├── mockData.ts ← Mock data
    └── mockApi.ts  ← Mock API
```

## 🎨 Import Patterns

```typescript
// Import APIs
import { authApi, gamesApi, shopApi, transactionsApi } from '../services';

// Import types
import { Game, ShopProfile, Transaction } from '../services';

// Import helpers
import { apiHelpers } from '../services';

// Import config
import { setUseMock, isMockMode } from '../services';
```

## ✅ Checklist

### Development (Mock Mode)
- [x] Service layer created
- [ ] Update components to use API
- [ ] Test all features
- [ ] Verify error handling

### Production (Real Backend)
- [ ] Backend deployed
- [ ] Endpoints verified
- [ ] CORS configured
- [ ] Change USE_MOCK to false
- [ ] Test with real data

## 📖 Documentation

- `INTEGRATION_GUIDE.md` - How to use in components
- `ARCHITECTURE.md` - System architecture
- `SERVICE_LAYER_SUMMARY.md` - Overview
- `src/services/README.md` - Detailed API docs

## 🆘 Common Issues

### "Cannot find module '../services'"
- Check import path is correct
- Make sure you're in the right directory

### "Property 'getGames' does not exist"
- Import the correct API: `import { gamesApi } from '../services'`
- Check spelling

### Mock data not updating
- Mock data resets on page refresh
- Edit `src/services/mock/mockData.ts` to change initial data

### Real API not working
- Check `USE_MOCK` is `false`
- Verify `BASE_URL` is correct
- Check browser console for errors
- Verify backend is running

## 💡 Tips

1. **Always use try-catch** for API calls
2. **Import types** for better TypeScript support
3. **Use helpers** for common operations
4. **Check mock data** to see example structures
5. **Read error messages** - they're helpful!

## 🎯 Next Steps

1. Update your components to use the API
2. Test everything with mock data
3. When backend is ready, change `USE_MOCK` to `false`
4. Test with real data
5. Deploy!

---

**Current Mode:** 🟢 MOCK DATA (Development)

**To switch:** Change `USE_MOCK` to `false` in `src/services/config.ts`
