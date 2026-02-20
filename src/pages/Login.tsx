import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { authApi } from "../services/api";

interface LoginProps {
  onLogin: () => void;
}

type LoginStep =
  | "credentials"
  | "otp"
  | "forgot-password"
  | "reset-otp"
  | "new-password";

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const popup = usePopup();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Credentials
  const [email, setEmail] = useState(""); // This is actually username in backend
  const [password, setPassword] = useState("");

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetUid, setResetUid] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.login({ username: email, password });
      onLogin();
    } catch (err: any) {
      const errorData = err?.data || err?.response?.data || {};
      if (errorData?.otp) {
        setStep("otp");
      } else if (errorData?.non_field_errors?.length) {
        setError(errorData.non_field_errors[0]);
      } else if (errorData?.detail) {
        setError(errorData.detail);
      } else {
        setError("Invalid credentials or server error");
      }
    } finally {
      setLoading(false);
    }
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
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter complete OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.login({ username: email, password, otp: otpCode });
      onLogin();
    } catch (err: any) {
      const errorData = err?.data || err?.response?.data || {};
      if (errorData?.otp) {
        setError("Invalid or expired OTP");
      } else if (errorData?.detail) {
        setError(errorData.detail);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Backend expects username, but UI asks for email.
      // Adjust backend if needed, or ask user for username.
      // Based on API, it accepts username OR email.
      await authApi.forgotPassword(resetEmail, resetEmail);
      popup.success(
        "If an account exists, a reset email has been sent. Check your inbox.",
      );
      // In a real flow, the user would click a link in email.
      // For this UI, we might not be able to proceed without the token from the email link.
      // However, usually the link opens a page.
      // Let's assume the user clicks the link and comes back.
      // The current UI flow 'reset-otp' seems to expect manual token entry which might not match the URL flow.
      // But let's keep the UI as is for now and just show a message.
      setStep("credentials");
    } catch (err) {
      setError("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  // Note: Reset Password flow usually involves a link with token.
  // The current UI has 'reset-otp', which suggests entering a code.
  // The backend `PasswordResetConfirmView` expects `uid` and `token`.
  // I will skip implementing 'reset-otp' and 'new-password' fully in this modal
  // because typically that happens on a separate route handled by the email link.
  // For now, I'll just redirect back to login after requesting reset.

  const handleBackToLogin = () => {
    setStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setResetEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-rose-50 via-white to-rose-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="rounded-2xl border border-red-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
          <motion.div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-700/10"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Trophy className="h-7 w-7 text-red-700" />
          </motion.div>

          <h1 className="mb-5 text-center text-2xl font-bold tracking-wide text-red-700">
            LULU Bingo
          </h1>

          <AnimatePresence mode="wait">
            {/* Step 1: Credentials */}
            {step === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-300">
                  {t("login.subtitle")}
                </p>

                {error && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder={t("login.username")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("login.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pl-10 pr-10"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="h-11 w-full bg-red-700 text-white hover:bg-red-800"
                      disabled={loading}
                    >
                      {loading ? t("login.loggingIn") : t("login.button")}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-4 text-center">
                  <button
                    className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50 dark:border-red-800/70 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800"
                    onClick={() => setStep("forgot-password")}
                  >
                    {t("login.forgotPassword")}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-300">
                  Enter the 6-digit code from your authenticator app
                </p>

                {error && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="flex justify-center gap-2">
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
                        className="h-11 w-10 rounded-md border border-slate-300 text-center text-lg font-semibold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30 dark:border-slate-700 dark:bg-slate-900"
                        required
                        disabled={loading}
                        title={`OTP digit ${index + 1}`}
                        aria-label={`OTP digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="h-11 w-full bg-red-700 text-white hover:bg-red-800"
                      disabled={loading}
                    >
                      {loading ? t("login.verifying") : "Verify OTP"}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-4 text-center">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={handleBackToLogin}
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Forgot Password - Email */}
            {step === "forgot-password" && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-300">
                  Enter your email to reset password
                </p>

                {error && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {error}
                  </div>
                )}

                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Username or Email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-11 pl-10"
                      required
                      disabled={loading}
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="h-11 w-full bg-red-700 text-white hover:bg-red-800"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </motion.div>
                </form>

                <div className="mt-4 text-center">
                  <button
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    onClick={handleBackToLogin}
                  >
                    <ArrowLeft size={16} />
                    Back to Login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <motion.div
          className="pointer-events-none absolute -z-10"
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
          <div className="absolute -top-24 -left-24 h-44 w-44 rounded-full bg-red-200/40 blur-2xl" />
          <div className="absolute -right-24 -bottom-20 h-52 w-52 rounded-full bg-orange-200/40 blur-2xl" />
          <div className="absolute top-20 right-28 h-28 w-28 rounded-full bg-rose-200/30 blur-xl" />
        </motion.div>
      </motion.div>
    </div>
  );
};
