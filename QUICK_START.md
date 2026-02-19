# Quick Start Guide - Testing Game State Fixes

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- npm installed
- Browser (Chrome, Firefox, Safari, or Edge)

### Installation
```bash
cd FrontEnd
npm install
npm run dev
```

The app will open at `http://localhost:5173`

---

## ⚡ 5-Minute Test

### Step 1: Login (30 seconds)
1. Open browser to `http://localhost:5173`
2. Click "Login" (or enter any credentials)
3. You should see the Dashboard

### Step 2: Create Game (1 minute)
1. Click "New Game" in sidebar
2. Enter configuration:
   - Game: `2`
   - Bet: `10`
   - Players: `3`
   - Win: `50`
3. Click patterns: `7`, `14`, `15`
4. Click "Confirm"
5. ✅ Alert should show cartela numbers: 007, 014, 015
6. ✅ Should redirect to Playground

### Step 3: Verify Game Active (30 seconds)
1. Check Playground header shows:
   - Game: 2
   - Stake: 10 BIRR
   - Win Price: 50
   - Cartelas: 3
2. ✅ Sidebar should show "Game Active" indicator
3. Click "Dashboard" in sidebar
4. ✅ Dashboard should show:
   - Games Today: 1
   - Recent game with status "PLAYING"

### Step 4: Test Cartela Removal (1 minute)
1. Go back to Playground
2. Click "View All Cartelas" button
3. ✅ Dropdown should show: 007, 014, 015
4. Select "Cartela 014"
5. ✅ Should see BINGO board with numbers
6. Click "Remove Player"
7. Confirm removal
8. ✅ Modal should close
9. Click "View All Cartelas" again
10. ✅ Dropdown should now show only: 007, 015
11. ✅ Header should show "Cartelas: 2"

### Step 5: Test Game Stop (1 minute)
1. ✅ Verify sidebar still shows "Game Active"
2. Click "Stop Game" in Playground
3. Confirm stop
4. ✅ Sidebar indicator should disappear
5. Navigate to Dashboard
6. ✅ Indicator should still be gone
7. ✅ "Start New Game" button should appear in Playground

### Step 6: Call Numbers (1 minute)
1. Click "Start New Game" in Playground
2. Confirm
3. Click "Call Number" 5 times
4. Note the called numbers (e.g., B 7, I 23, etc.)
5. Click "View All Cartelas"
6. Select any cartela
7. ✅ Called numbers should be marked with ✓
8. ✅ Stats should show "Called: X/24"

---

## ✅ Success Checklist

After completing the 5-minute test, verify:

- [x] Cartela numbers are 007, 014, 015 (not 001, 002, 003)
- [x] Cartela removal actually removes the cartela
- [x] Cartela count updates after removal
- [x] Sidebar "Game Active" indicator appears when game starts
- [x] Sidebar indicator disappears when game stops
- [x] Dashboard shows current game data
- [x] Called numbers are marked on cartelas
- [x] No console errors

---

## 🐛 If Something Goes Wrong

### Issue: Build fails
```bash
cd FrontEnd
rm -rf node_modules
npm install
npm run dev
```

### Issue: Page won't load
1. Check console for errors (F12)
2. Verify dev server is running
3. Try different browser
4. Clear browser cache

### Issue: Cartela removal doesn't work
1. Open browser console (F12)
2. Check for errors
3. Verify you're clicking "Remove Player" not "Declare Winner"
4. Check that modal closes after removal

### Issue: Sidebar indicator stuck
1. Refresh page (will lose game state)
2. Create new game
3. Stop game properly
4. Check console for errors

### Issue: Wrong cartela numbers
1. Verify you selected patterns 7, 14, 15
2. Check confirmation alert shows correct numbers
3. If still wrong, check NewGame.tsx implementation

---

## 📊 What to Look For

### Visual Indicators
- ✅ Green "Game Active" indicator in sidebar
- ✅ Cartela count in Playground header
- ✅ Called numbers highlighted in blue
- ✅ Checkmarks on called numbers in cartela view
- ✅ Smooth animations and transitions

### Data Consistency
- ✅ Same cartela count everywhere
- ✅ Dashboard reflects current game
- ✅ Cartela numbers match patterns
- ✅ Called numbers consistent across views

### Functionality
- ✅ All buttons clickable
- ✅ Modals open and close
- ✅ Dropdowns work
- ✅ Navigation works
- ✅ Confirmations appear

---

## 🎯 Key Features to Test

### 1. Cartela Management
- Create game with specific patterns
- View cartelas by number
- View all cartelas in dropdown
- Remove cartelas
- Verify count updates

### 2. Game State
- Start game
- Stop game
- Sidebar indicator updates
- Dashboard updates
- State persists across navigation

### 3. Number Calling
- Call random numbers
- Call specific numbers
- View called numbers on cartelas
- Auto-call feature
- Number display

### 4. Winner Declaration
- View cartela
- Declare winner
- Game stops
- Confirmation shown

---

## 📝 Quick Reference

### Keyboard Shortcuts
- `Enter` in cartela input: View cartela
- `Esc` in modal: Close modal

### Navigation
- Dashboard: Overview and stats
- Playground: Active game area
- New Game: Create new game
- Profile: User profile
- Settings: App settings

### Game Flow
```
New Game → Configure → Select Patterns → Confirm
    ↓
Playground → Call Numbers → View Cartelas → Remove/Declare Winner
    ↓
Stop Game → Dashboard (updated stats)
```

---

## 🔍 Detailed Testing

For comprehensive testing, see:
- **TESTING_GUIDE.md** - All test scenarios
- **GAME_STATE_FIXES.md** - Technical details
- **IMPLEMENTATION_SUMMARY.md** - Complete overview

---

## 💡 Tips

1. **Use Chrome DevTools**: Press F12 to see console, network, and React components
2. **Test in Multiple Browsers**: Ensure compatibility
3. **Test Mobile View**: Resize browser or use device emulator
4. **Check Console**: Look for errors or warnings
5. **Test Edge Cases**: Try removing all cartelas, stopping without playing, etc.

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Review TESTING_GUIDE.md
3. Check GAME_STATE_FIXES.md for implementation details
4. Verify all files are saved
5. Try rebuilding: `npm run build`

---

## ✨ What's New

### Fixed Issues
1. ✅ Cartela removal now works
2. ✅ Sidebar indicator updates correctly
3. ✅ Dashboard shows live data
4. ✅ Cartela numbers match patterns

### New Features
1. ✅ Cartela dropdown selector
2. ✅ Remove player functionality
3. ✅ Declare winner functionality
4. ✅ Live cartela count
5. ✅ Game state synchronization

---

## 🎉 Success!

If all tests pass, you're ready to:
1. Deploy to staging
2. Conduct user acceptance testing
3. Integrate with backend API
4. Add more features

**Happy Testing! 🚀**
