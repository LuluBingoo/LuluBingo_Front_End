# Service Layer Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     UI COMPONENTS                            │
│  (Login, Dashboard, NewGame, Playground, Profile, etc.)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ import { authApi, gamesApi, ... }
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   services/api.ts                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   authApi    │  │   gamesApi   │  │   shopApi    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│              if (USE_MOCK) ? mock : real                    │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   MOCK API      │    │   REAL API      │
│                 │    │                 │
│ mock/mockApi.ts │    │ api/client.ts   │
│       │         │    │       │         │
│       ▼         │    │       ▼         │
│ mock/mockData.ts│    │  Backend Server │
└─────────────────┘    └─────────────────┘
```

## Data Flow

### With Mock Data (Development)

```
Component
   │
   │ await gamesApi.getGames()
   ▼
api.ts (USE_MOCK = true)
   │
   │ calls mockGamesApi.getGames()
   ▼
mockApi.ts
   │
   │ returns data from mockData.ts
   ▼
Component receives mock data
```

### With Real Backend (Production)

```
Component
   │
   │ await gamesApi.getGames()
   ▼
api.ts (USE_MOCK = false)
   │
   │ calls apiClient.get('/games/games')
   ▼
client.ts
   │
   │ HTTP GET request
   ▼
Backend Server
   │
   │ JSON response
   ▼
Component receives real data
```

## File Responsibilities

### `config.ts`
- API base URL
- **USE_MOCK flag** ← Change this to switch modes
- Timeout settings
- API endpoint definitions

### `types.ts`
- TypeScript interfaces
- Type definitions for all data structures
- Matches backend Swagger schema

### `api.ts` ⭐ Main File
- Exports: authApi, gamesApi, shopApi, transactionsApi
- Routes calls to mock or real API based on USE_MOCK
- Single source of truth for all API calls

### `api/client.ts`
- HTTP client for real API calls
- Handles authentication tokens
- Error handling
- Request/response interceptors

### `mock/mockData.ts`
- Mock data definitions
- Sample users, games, transactions
- Helper functions to generate data

### `mock/mockApi.ts`
- Mock API implementations
- Simulates network delays
- Returns mock data
- Maintains state in memory

### `index.ts`
- Central export point
- Re-exports everything for easy imports

## Component Integration

### Before (Direct API calls)
```typescript
// ❌ Bad - tightly coupled to implementation
const response = await fetch('https://api.example.com/games', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const games = await response.json();
```

### After (Using Service Layer)
```typescript
// ✅ Good - uses service layer
import { gamesApi } from '../services';
const games = await gamesApi.getGames();
```

## Benefits

1. **Separation of Concerns**
   - UI components focus on presentation
   - Service layer handles data fetching
   - Easy to test components in isolation

2. **Flexibility**
   - Switch between mock and real data instantly
   - No component changes needed
   - Easy to add new endpoints

3. **Type Safety**
   - Full TypeScript support
   - Catch errors at compile time
   - Better IDE autocomplete

4. **Maintainability**
   - All API logic in one place
   - Easy to update endpoints
   - Consistent error handling

5. **Development Speed**
   - Work on UI without backend
   - Predictable mock data
   - Fast iteration

## Configuration

### Development Mode (Default)
```typescript
// config.ts
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: true, // ← Using mock data
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

### Production Mode
```typescript
// config.ts
export const API_CONFIG = {
  BASE_URL: 'https://lulubingo-back-end-kvf3.onrender.com/api',
  USE_MOCK: false, // ← Using real backend
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

## API Endpoints Mapping

Based on your Swagger documentation:

| Frontend API | Backend Endpoint | Method |
|-------------|------------------|--------|
| `authApi.login()` | `/auth/login` | POST |
| `authApi.getMe()` | `/auth/me` | GET |
| `gamesApi.getGames()` | `/games/games` | GET |
| `gamesApi.createGame()` | `/games/games` | POST |
| `gamesApi.getGame(code)` | `/games/games/{code}` | GET |
| `shopApi.getProfile()` | `/shop/profile` | GET |
| `shopApi.updateProfile()` | `/shop/profile` | PUT |
| `transactionsApi.getHistory()` | `/transactions/transactions/history` | GET |
| `transactionsApi.deposit()` | `/transactions/transactions/deposit` | POST |
| `transactionsApi.withdraw()` | `/transactions/transactions/withdraw` | POST |

## Error Handling Flow

```
Component calls API
   │
   ▼
api.ts
   │
   ├─ Mock Mode ──▶ mockApi.ts ──▶ Returns data or throws error
   │
   └─ Real Mode ──▶ client.ts ──▶ HTTP request
                        │
                        ├─ Success ──▶ Returns data
                        │
                        └─ Error ──▶ Throws ApiError
                                        │
                                        ▼
                                   Component catch block
```

## State Management

Currently: **Local component state**
- Each component manages its own data
- Simple and straightforward
- Good for current app size

Future options (if needed):
- React Context for shared state
- Redux for complex state
- Zustand for lightweight state

## Testing Strategy

### Unit Tests
```typescript
// Mock the API
jest.mock('../services', () => ({
  gamesApi: {
    getGames: jest.fn().mockResolvedValue([mockGame1, mockGame2])
  }
}));

// Test component
test('displays games', async () => {
  render(<GamesList />);
  expect(await screen.findByText('GAME001')).toBeInTheDocument();
});
```

### Integration Tests
- Use mock mode for predictable data
- Test complete user flows
- Verify UI updates correctly

### E2E Tests
- Use real backend
- Test actual API integration
- Verify end-to-end functionality

## Migration Path

### Phase 1: ✅ Setup (Complete)
- Create service layer
- Define types
- Implement mock API
- Configure endpoints

### Phase 2: ⏳ Integration (Next)
- Update components to use API
- Remove direct fetch calls
- Add error handling
- Test with mock data

### Phase 3: ⏳ Backend Integration (When Ready)
- Verify backend endpoints
- Test authentication
- Switch USE_MOCK to false
- Test with real data

### Phase 4: ⏳ Optimization (Future)
- Add caching if needed
- Implement retry logic
- Add loading states
- Optimize performance

## Best Practices

1. **Always use the API layer**
   ```typescript
   // ✅ Good
   import { gamesApi } from '../services';
   const games = await gamesApi.getGames();
   
   // ❌ Bad
   const response = await fetch('/api/games');
   ```

2. **Handle errors properly**
   ```typescript
   try {
     const games = await gamesApi.getGames();
     setGames(games);
   } catch (error) {
     console.error('Failed:', error);
     setError(error.message);
   }
   ```

3. **Use TypeScript types**
   ```typescript
   import { Game } from '../services';
   const [games, setGames] = useState<Game[]>([]);
   ```

4. **Keep components clean**
   - Components handle UI
   - API handles data
   - Clear separation

## Summary

The service layer provides:
- ✅ Single point to switch between mock and real data
- ✅ Type-safe API calls
- ✅ Consistent error handling
- ✅ Easy to test
- ✅ Easy to maintain
- ✅ Ready for backend integration

Just change `USE_MOCK` from `true` to `false` when your backend is ready!
