# Testing Guide - Game State Management

## Quick Test Scenarios

### Scenario 1: Basic Game Flow (2 minutes)
**Purpose**: Verify complete game lifecycle

1. **Login** to the application
2. **Navigate** to "New Game"
3. **Configure** game:
   - Game: 2
   - Bet: 10 BIRR
   - Players: 3
   - Win: 50 BIRR
4. **Select** patterns: 7, 14, 15
5. **Click** "Confirm"
6. **Verify** alert shows cartela numbers: 007, 014, 015
7. **Check** Playground loads automatically
8. **Verify** header shows:
   - Game: 2
   - Stake: 10 BIRR
   - Win Price: 50
   - Cartelas: 3
9. **Check** Sidebar shows "Game Active" indicator
10. **Navigate** to Dashboard
11. **Verify** Dashboard shows:
    - Games Today: 1
    - Recent Games table has 1 entry with status "PLAYING"
    - Players: 3

**Expected Result**: ✓ All data consistent across pages

---

### Scenario 2: Cartela Removal (1 minute)
**Purpose**: Verify cartela removal works correctly

1. **Start** from Scenario 1 (game with 3 cartelas)
2. **Go** to Playground
3. **Click** "View All Cartelas" button
4. **Verify** dropdown shows: 007, 014, 015
5. **Select** cartela 014
6. **Verify** cartela displays with BINGO board
7. **Click** "Remove Player"
8. **Confirm** removal
9. **Verify** modal closes
10. **Click** "View All Cartelas" again
11. **Verify** dropdown now shows only: 007, 015
12. **Check** header shows "Cartelas: 2"

**Expected Result**: ✓ Cartela 014 removed, count updated

---

### Scenario 3: Game Stop (1 minute)
**Purpose**: Verify game state updates when stopped

1. **Start** from active game
2. **Verify** Sidebar shows "Game Active"
3. **Go** to Playground
4. **Click** "Stop Game"
5. **Confirm** stop
6. **Verify** Sidebar indicator disappears
7. **Navigate** to Dashboard
8. **Verify** indicator still gone
9. **Navigate** to Settings
10. **Verify** indicator still gone

**Expected Result**: ✓ Game indicator disappears everywhere

---

### Scenario 4: Cartela Viewing (1 minute)
**Purpose**: Verify cartela display and number calling

1. **Start** from active game
2. **Go** to Playground
3. **Call** 5 random numbers by clicking "Call Number"
4. **Note** the called numbers (e.g., B 7, I 23, N 35, G 52, O 68)
5. **Click** "View All Cartelas"
6. **Select** any cartela
7. **Verify** cartela board displays 5x5 grid with "FREE" in center
8. **Check** if any called numbers are marked with ✓
9. **Verify** stats show "Called: X/24" and "Remaining: Y"
10. **Try** different cartelas

**Expected Result**: ✓ Called numbers marked correctly

---

### Scenario 5: Winner Declaration (1 minute)
**Purpose**: Verify winner declaration stops game

1. **Start** from active game
2. **Go** to Playground
3. **Click** "View All Cartelas"
4. **Select** any cartela
5. **Click** "Declare Winner"
6. **Confirm** declaration
7. **Verify** alert shows winner message
8. **Verify** game stops (modal closes)
9. **Check** Sidebar indicator disappears
10. **Verify** "Start New Game" button appears

**Expected Result**: ✓ Game stops, winner declared

---

### Scenario 6: Multiple Cartela Removals (2 minutes)
**Purpose**: Verify multiple removals work correctly

1. **Create** game with 5 cartelas (patterns: 1, 2, 3, 4, 5)
2. **Verify** header shows "Cartelas: 5"
3. **Remove** cartela 001
4. **Verify** count: 4
5. **Remove** cartela 003
6. **Verify** count: 3
7. **Remove** cartela 005
8. **Verify** count: 2
9. **Verify** dropdown shows only: 002, 004
10. **Try** to view cartela 001
11. **Verify** error: "Cartela 001 not in game"

**Expected Result**: ✓ All removals work, count accurate

---

### Scenario 7: Dashboard Consistency (1 minute)
**Purpose**: Verify dashboard updates with game state

1. **Go** to Dashboard (no game)
2. **Note** stats (Games Today: 0, Balance: default)
3. **Create** new game (Bet: 20, Players: 4, Win: 100)
4. **Return** to Dashboard
5. **Verify** Games Today: 1
6. **Verify** Available Balance: 100
7. **Verify** Recent Games shows 1 game
8. **Go** to Playground
9. **Stop** game
10. **Return** to Dashboard
11. **Verify** data still consistent

**Expected Result**: ✓ Dashboard reflects game state

---

### Scenario 8: Pattern Number Verification (1 minute)
**Purpose**: Verify cartela numbers match pattern numbers

1. **Create** game with patterns: 7, 14, 15, 23, 99
2. **Verify** confirmation shows: 007, 014, 015, 023, 099
3. **Go** to Playground
4. **Open** cartela viewer
5. **Verify** dropdown shows exactly: 007, 014, 015, 023, 099
6. **NOT**: 001, 002, 003, 004, 005

**Expected Result**: ✓ Cartela numbers = pattern numbers

---

## Edge Cases to Test

### Edge Case 1: Remove All Cartelas
1. Create game with 2 cartelas
2. Remove both cartelas
3. Verify count shows 0
4. Try to view cartelas
5. Should show "No cartelas in game"

### Edge Case 2: Stop Game Without Playing
1. Create game
2. Immediately stop game
3. Verify no errors
4. Verify sidebar indicator disappears

### Edge Case 3: Navigate During Active Game
1. Start game
2. Navigate to Profile
3. Navigate to Settings
4. Navigate back to Playground
5. Verify game state preserved
6. Verify sidebar indicator still shows

### Edge Case 4: Create Multiple Games
1. Create game 1
2. Stop game 1
3. Create game 2
4. Verify dashboard shows correct data
5. Verify only game 2 is active

---

## Performance Tests

### Test 1: Large Game (100 cartelas)
1. Create game with 100 patterns
2. Verify all cartelas load
3. Test dropdown performance
4. Test removal performance

### Test 2: Many Number Calls
1. Create game
2. Call 50 numbers
3. View cartela
4. Verify performance is acceptable

---

## Browser Compatibility

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Responsiveness

Test on:
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

---

## Regression Tests

After any code changes, run:
1. Scenario 1 (Basic Flow)
2. Scenario 2 (Cartela Removal)
3. Scenario 3 (Game Stop)
4. Scenario 8 (Pattern Numbers)

---

## Bug Report Template

If you find a bug, report it with:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[If applicable]

**Browser/Device**:
[Chrome 120, Windows 11, etc.]

**Console Errors**:
[Any errors in browser console]
```

---

## Success Criteria

All scenarios should pass with:
- ✓ No console errors
- ✓ No visual glitches
- ✓ Data consistency across pages
- ✓ Smooth animations
- ✓ Responsive design works
- ✓ All buttons functional
- ✓ All modals open/close correctly
