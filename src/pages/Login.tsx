import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

type LoginStep = 'credentials' | 'otp' | 'forgot-password' | 'reset-otp' | 'new-password';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  // Forgot Password
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, this would call API to send OTP
    console.log('Sending OTP to:', email);
    setStep('otp');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // In real app, verify OTP with backend
      console.log('Verifying OTP:', otpCode);
      onLogin();
    } else {
      alert('Please enter complete OTP');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, send reset OTP to email
    console.log('Sending reset OTP to:', resetEmail);
    setStep('reset-otp');
  };

  const handleResetOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // In real app, verify reset OTP
      console.log('Verifying reset OTP:', otpCode);
      setStep('new-password');
    } else {
      alert('Please enter complete OTP');
    }
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    // In real app, update password via API
    console.log('Password reset successful');
    alert('Password reset successful! Please login with your new password.');
    setStep('credentials');
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp(['', '', '', '', '', '']);
  };

  const handleResendOtp = () => {
    // In real app, resend OTP
    console.log('Resending OTP');
    alert('OTP resent successfully!');
  };

  const handleBackToLogin = () => {
    setStep('credentials');
    setOtp(['', '', '', '', '', '']);
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="login-card">
          <motion.div
            className="login-logo"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Trophy className="logo-trophy" />
          </motion.div>

          <h1 className="logo-text">LULU Bingo</h1>

          <AnimatePresence mode="wait">
            {/* Step 1: Credentials */}
            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="login-subtitle">{t('login.subtitle')}</p>

                <form onSubmit={handleCredentialsSubmit} className="login-form">
                  <div className="input-group">
                    <Mail className="input-icon" />
                    <Input
                      type="email"
                      placeholder={t('login.username')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="login-input"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="login-button">
                      {t('login.button')}
                    </Button>
                  </motion.div>
                </form>

                <div className="login-footer">
                  <button 
                    className="forgot-link"
                    onClick={() => setStep('forgot-password')}
                  >
                    {t('login.forgotPassword')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="login-subtitle">Enter the 6-digit code sent to {email}</p>

                <form onSubmit={handleOtpSubmit} className="login-form">
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="otp-input"
                        required
                      />
                    ))}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="login-button">
                      Verify OTP
                    </Button>
                  </motion.div>

                  <button
                    type="button"
                    className="resend-link"
                    onClick={handleResendOtp}
                  >
                    Resend OTP
                  </button>
                </form>

                <div className="login-footer">
                  <button className="back-link" onClick={handleBackToLogin}>
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Forgot Password - Email */}
            {step === 'forgot-password' && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="login-subtitle">Enter your email to reset password</p>

                <form onSubmit={handleForgotPasswordSubmit} className="login-form">
                  <div className="input-group">
                    <Mail className="input-icon" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="login-input"
                      required
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="login-button">
                      Send Reset Code
                    </Button>
                  </motion.div>
                </form>

                <div className="login-footer">
                  <button className="back-link" onClick={handleBackToLogin}>
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Reset OTP Verification */}
            {step === 'reset-otp' && (
              <motion.div
                key="reset-otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="login-subtitle">Enter the 6-digit code sent to {resetEmail}</p>

                <form onSubmit={handleResetOtpSubmit} className="login-form">
                  <div className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="otp-input"
                        required
                      />
                    ))}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="login-button">
                      Verify Code
                    </Button>
                  </motion.div>

                  <button
                    type="button"
                    className="resend-link"
                    onClick={handleResendOtp}
                  >
                    Resend Code
                  </button>
                </form>

                <div className="login-footer">
                  <button className="back-link" onClick={handleBackToLogin}>
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: New Password */}
            {step === 'new-password' && (
              <motion.div
                key="new-password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="login-subtitle">Create a new password</p>

                <form onSubmit={handleNewPasswordSubmit} className="login-form">
                  <div className="input-group">
                    <KeyRound className="input-icon" />
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="login-input"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="login-input"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="password-requirements">
                    <p>Password must be at least 8 characters</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit" className="login-button">
                      Reset Password
                    </Button>
                  </motion.div>
                </form>

                <div className="login-footer">
                  <button className="back-link" onClick={handleBackToLogin}>
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <motion.div
          className="decorative-circles"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="circle circle-1" />
          <div className="circle circle-2" />
          <div className="circle circle-3" />
        </motion.div>
      </motion.div>
    </div>
  );
};
