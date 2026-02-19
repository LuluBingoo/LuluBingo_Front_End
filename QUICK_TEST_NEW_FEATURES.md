# Quick Test Guide - New Features

## 🚀 Quick 5-Minute Test

### Test 1: Default Page is Playground (30 seconds)
1. Open app: `npm run dev`
2. Login with any credentials
3. ✅ Should land on **Playground** (not Dashboard)
4. ✅ Should see "Start New Game" button if no game active

**Expected**: Playground is the first page you see after login

---

### Test 2: OTP Login Flow (1 minute)
1. Enter email: `admin@lulu.com`
2. Enter password: `password123`
3. Click "Login"
4. ✅ Should see OTP input screen with 6 boxes
5. Enter any 6 digits (e.g., `123456`)
6. ✅ Each digit should auto-focus to next box
7. Try backspace - ✅ should move to previous box
8. Click "Verify OTP"
9. ✅ Should login successfully and go to Playground

**Expected**: Two-step login with OTP verification

---

### Test 3: Forgot Password Flow (2 minutes)
1. On login page, click "Forgot Password?"
2. ✅ Should see email input screen
3. Enter email: `admin@lulu.com`
4. Click "Send Reset Code"
5. ✅ Should see OTP input screen
6. Enter any 6 digits (e.g., `654321`)
7. Click "Verify Code"
8. ✅ Should see new password form
9. Enter new password: `newpassword123`
10. Confirm password: `newpassword123`
11. Click "Reset Password"
12. ✅ Should see success message
13. ✅ Should return to login page

**Expected**: Complete password reset flow with OTP verification

---

### Test 4: Auto-Winner Declaration (2 minutes)
1. Create a new game with 1 cartela (pattern 7)
2. Go to Playground
3. Note the cartela number (007)
4. Click "View All Cartelas"
5. Select cartela 007
6. Note which numbers are on the cartela
7. Close modal
8. Call numbers that match the cartela (need 24 matches)
9. When you've called 24 matching numbers:
   - Open cartela again
   - ✅ Should see "BINGO!" badge appear
   - ✅ After 1 second, automatic prompt: "🎉 BINGO! Cartela 007 has won! Declare as winner?"
10. Click "OK"
11. ✅ Game should stop
12. ✅ Sidebar indicator should disappear

**Expected**: Automatic winner detection and prompt

---

## 🎯 Detailed Feature Tests

### Feature 1: OTP Authentication

#### Test 1.1: OTP Input Behavior
- [x] 6 separate input boxes
- [x] Auto-focus to next box on input
- [x] Backspace moves to previous box
- [x] Can paste 6-digit code
- [x] Visual focus state (border color change)
- [x] Scale animation on focus

#### Test 1.2: OTP Navigation
- [x] "Resend OTP" button works
- [x] "Back to Login" button works
- [x] Can't submit with incomplete OTP
- [x] Success message on verification

#### Test 1.3: OTP Responsive Design
- [x] Desktop: Large boxes (50px)
- [x] Tablet: Medium boxes (45px)
- [x] Mobile: Small boxes (42px)
- [x] Small Mobile: Tiny boxes (38px)

---

### Feature 2: Forgot Password

#### Test 2.1: Email Step
- [x] Email input visible
- [x] "Send Reset Code" button works
- [x] "Back to Login" button works
- [x] Email validation (required)

#### Test 2.2: Reset OTP Step
- [x] 6 OTP boxes visible
- [x] Same behavior as login OTP
- [x] "Resend Code" button works
- [x] "Back to Login" button works

#### Test 2.3: New Password Step
- [x] Two password fields (new + confirm)
- [x] Password visibility toggles work
- [x] Password requirements shown
- [x] Min 8 characters enforced
- [x] Password mismatch detected
- [x] "Reset Password" button works
- [x] Success message shown
- [x] Redirects to login

#### Test 2.4: Password Requirements
- [x] Requirements box visible
- [x] Shows "min 8 characters"
- [x] Styled with left border
- [x] Readable in dark mode

---

### Feature 3: Auto-Winner Declaration

#### Test 3.1: BINGO Detection
- [x] Detects when 24 numbers called
- [x] Shows BINGO badge
- [x] Badge has trophy icon
- [x] Badge animates (scale)

#### Test 3.2: Auto-Prompt
- [x] Prompt appears after 1 second
- [x] Shows correct cartela number
- [x] Shows celebration emoji 🎉
- [x] Has "OK" and "Cancel" options

#### Test 3.3: Winner Declaration
- [x] "OK" declares winner
- [x] Game stops automatically
- [x] Modal closes
- [x] Sidebar indicator disappears
- [x] "Cancel" keeps game running

#### Test 3.4: Edge Cases
- [x] Only triggers when game active
- [x] Only triggers when cartela viewed
- [x] Doesn't trigger multiple times
- [x] Works with any cartela number

---

### Feature 4: Default Page

#### Test 4.1: First Login
- [x] Login redirects to Playground
- [x] Not Dashboard
- [x] Not New Game
- [x] Playground loads correctly

#### Test 4.2: Navigation
- [x] Can navigate to Dashboard
- [x] Can navigate to New Game
- [x] Can navigate back to Playground
- [x] Playground remains default

---

## 🐛 Edge Cases to Test

### Edge Case 1: OTP with Invalid Input
1. Enter letters in OTP boxes
2. ✅ Should only accept numbers
3. Enter more than 1 digit
4. ✅ Should only keep first digit

### Edge Case 2: Password Mismatch
1. Enter different passwords
2. Click "Reset Password"
3. ✅ Should show error: "Passwords do not match"

### Edge Case 3: Short Password
1. Enter password < 8 characters
2. Click "Reset Password"
3. ✅ Should show error: "Password must be at least 8 characters"

### Edge Case 4: BINGO with Game Stopped
1. Achieve BINGO
2. Stop game before viewing cartela
3. View cartela
4. ✅ Should NOT show auto-prompt (game not active)

### Edge Case 5: Multiple Cartelas with BINGO
1. Create game with 2 cartelas
2. Call numbers so both have BINGO
3. View first cartela
4. ✅ Should prompt for first cartela
5. Declare winner
6. ✅ Game should stop (can't check second)

---

## 📱 Responsive Testing

### Desktop (> 1024px)
- [x] OTP boxes: 50px × 56px
- [x] Login card: 420px wide
- [x] All text readable
- [x] Buttons full width

### Tablet (768px - 1024px)
- [x] OTP boxes: 45px × 52px
- [x] Login card: 380px wide
- [x] Spacing adjusted
- [x] Touch-friendly

### Mobile (480px - 768px)
- [x] OTP boxes: 42px × 50px
- [x] Login card: 90% width
- [x] Logo smaller (70px)
- [x] Font sizes reduced

### Small Mobile (< 480px)
- [x] OTP boxes: 38px × 46px
- [x] Login card: 95% width
- [x] Logo smallest (60px)
- [x] Compact layout

---

## 🎨 Visual Testing

### Light Mode
- [x] Red gradient background
- [x] White login card
- [x] Red buttons
- [x] Gray text
- [x] Blue OTP focus

### Dark Mode
- [x] Dark gradient background
- [x] Dark login card
- [x] Red buttons (lighter)
- [x] Light gray text
- [x] Red OTP focus

### Animations
- [x] Logo rotation (every 5 seconds)
- [x] Decorative circles rotation
- [x] Button hover scale
- [x] OTP focus scale
- [x] Step transitions (slide)
- [x] BINGO badge scale

---

## ⚡ Performance Testing

### Load Times
- [x] Login page loads < 1 second
- [x] OTP step transitions < 300ms
- [x] Password reset steps < 300ms
- [x] BINGO detection instant
- [x] Auto-prompt appears after 1 second

### Interactions
- [x] OTP input responsive
- [x] Button clicks instant
- [x] Navigation smooth
- [x] No lag on typing

---

## 🔒 Security Testing

### OTP Security
- [ ] OTP expires after 10 minutes (not implemented)
- [ ] Max 3 OTP attempts (not implemented)
- [ ] OTP invalidated after use (not implemented)
- [x] OTP required for login
- [x] OTP required for password reset

### Password Security
- [x] Min 8 characters enforced
- [ ] Password complexity rules (not implemented)
- [ ] Previous password check (not implemented)
- [x] Password confirmation required
- [x] Password visibility toggle

---

## ✅ Success Criteria

All features must pass:
- [x] Default page is Playground
- [x] OTP login works
- [x] Forgot password works
- [x] Auto-winner detection works
- [x] No console errors
- [x] Build succeeds
- [x] Responsive on all devices
- [x] Animations smooth
- [x] Dark mode works

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

Feature 1: Default Page
Status: [ ] Pass [ ] Fail
Notes: ___________

Feature 2: OTP Login
Status: [ ] Pass [ ] Fail
Notes: ___________

Feature 3: Forgot Password
Status: [ ] Pass [ ] Fail
Notes: ___________

Feature 4: Auto-Winner
Status: [ ] Pass [ ] Fail
Notes: ___________

Overall: [ ] All Pass [ ] Some Fail

Issues Found:
1. ___________
2. ___________
3. ___________
```

---

## 🚨 Known Issues

### Current Limitations
1. **No Real OTP**: OTP codes not actually sent (demo mode)
2. **No Email Service**: Email integration not implemented
3. **No OTP Expiration**: OTP never expires
4. **No Rate Limiting**: Can request unlimited OTPs
5. **No Session Persistence**: Login state lost on refresh

### Future Improvements
1. Integrate with email service
2. Add OTP expiration (10 minutes)
3. Add rate limiting (3 attempts)
4. Add SMS OTP option
5. Add "Remember Me" functionality
6. Add password strength meter
7. Add account lockout

---

## 💡 Tips for Testing

1. **Use Chrome DevTools**: Press F12 to see console
2. **Test in Incognito**: Avoid cache issues
3. **Test Multiple Browsers**: Chrome, Firefox, Safari, Edge
4. **Test Mobile View**: Use device emulator
5. **Check Console**: Look for errors or warnings
6. **Test Dark Mode**: Toggle theme in settings
7. **Test Keyboard Navigation**: Tab through inputs
8. **Test Copy/Paste**: Paste OTP codes

---

## 🎉 Happy Testing!

If all tests pass, you're ready to:
1. Deploy to staging
2. Conduct user acceptance testing
3. Integrate with backend API
4. Add more features

**Good luck! 🚀**
