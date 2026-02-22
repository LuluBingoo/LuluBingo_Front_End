import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { authApi } from "../services/api";
import { BackgroundEffects } from "../components/BackgroundEffects";
import illustration1 from "../assets/illustration1.svg";

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

  // Credentials
  const [email, setEmail] = useState(""); // This is actually username in backend
  const [password, setPassword] = useState("");

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpMethod, setOtpMethod] = useState<"totp" | "email_code">("totp");
  const [otpMethods, setOtpMethods] = useState<Array<"totp" | "email_code">>([
    "totp",
  ]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forgot Password
  const [resetEmail, setResetEmail] = useState("");
  const rightPanelParticles = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    left: `${(index * 13) % 100}%`,
    size: 5 + (index % 6) * 3,
    delay: (index % 8) * 0.35,
    duration: 4.8 + (index % 5) * 1.1,
    drift: ((index % 7) - 3) * 16,
  }));

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authApi.login({ username: email, password });
      popup.success("Logged in successfully.");
      onLogin();
    } catch (err: any) {
      const errorData = err?.data || err?.response?.data || {};
      if (errorData?.otp) {
        const methodsFromServer = Array.isArray(errorData?.two_factor_methods)
          ? (errorData.two_factor_methods.filter(
              (method: string) => method === "totp" || method === "email_code",
            ) as Array<"totp" | "email_code">)
          : [];
        const normalizedMethods =
          methodsFromServer.length > 0
            ? methodsFromServer
            : [
                errorData?.two_factor_method === "email_code"
                  ? "email_code"
                  : "totp",
              ];

        setOtpMethods(
          normalizedMethods.filter(
            (method): method is "totp" | "email_code" =>
              method === "totp" || method === "email_code",
          ),
        );
        setOtpMethod(
          errorData?.two_factor_method === "email_code" ? "email_code" : "totp",
        );
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
      popup.success("Logged in successfully.");
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
      await authApi.forgotPassword(resetEmail);
      popup.success(
        "If an account exists, a reset email has been sent. Check your inbox.",
      );
      setStep("credentials");
    } catch (err: any) {
      const errorData = err?.data || err?.response?.data || {};
      if (typeof errorData?.detail === "string" && errorData.detail) {
        setError(errorData.detail);
      } else {
        setError("Failed to process request");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setOtpMethods(["totp"]);
    setResetEmail("");
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-8 dark:bg-slate-950">
      <BackgroundEffects />
      <motion.div
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-red-100/80 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90 lg:grid-cols-[1fr_1.1fr]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="relative hidden overflow-hidden bg-linear-to-br from-red-700 via-red-800 to-red-950 p-8 text-white lg:order-2 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.24),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.2),transparent_40%)]" />
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {rightPanelParticles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute bottom-0 rounded-full bg-white/40 shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                style={{
                  left: particle.left,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                }}
                animate={{
                  y: [0, -70, -180, -280],
                  x: [0, particle.drift * 0.4, particle.drift],
                  opacity: [0, 0.92, 0.6, 0],
                  scale: [0.8, 1.12, 1.02, 0.7],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}

            <motion.div
              className="absolute top-20 left-8 h-10 w-10 rounded-full border border-white/35 bg-white/12"
              animate={{ y: [0, -16, 0], x: [0, 8, 0], rotate: [0, 8, 0] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute right-10 bottom-24 h-14 w-14 rounded-full border border-amber-200/45 bg-amber-100/10"
              animate={{ y: [0, -22, 0], x: [0, -10, 0], rotate: [0, -10, 0] }}
              transition={{
                duration: 6.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5" /> Premium Bingo Experience
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight">
                LULU Bingo
              </h1>
              <p className="mt-3 max-w-sm text-sm text-red-100/95">
                Secure access for operators with fast verification and smooth
                gameplay management.
              </p>
            </div>

            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/10 p-2 shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
                <div className="relative h-64 w-full overflow-hidden rounded-xl">
                  <motion.img
                    src={illustration1}
                    alt="Animated cartoon people playing bingo"
                    className="absolute inset-0 h-full w-full object-cover"
                    animate={{ y: [0, -4, 0], scale: [1, 1.01, 1] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 lg:order-1 lg:p-8">
          <Card className="rounded-2xl border border-red-100/80 bg-white/95 p-5 shadow-none dark:border-slate-700 dark:bg-slate-900/95 sm:p-6">
            <motion.div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-700/10"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Trophy className="h-7 w-7 text-red-700" />
            </motion.div>

            <h2 className="text-center text-2xl font-bold tracking-wide text-red-700">
              Welcome Back
            </h2>
            <p className="mt-1 mb-5 text-center text-sm text-slate-500 dark:text-slate-300">
              {t("login.subtitle")}
            </p>

            <AnimatePresence mode="wait">
              {step === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <form
                    onSubmit={handleCredentialsSubmit}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="text"
                        placeholder={t("login.username")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-slate-300 pl-10 dark:border-slate-700"
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
                        className="h-11 rounded-xl border-slate-300 pl-10 pr-10 dark:border-slate-700"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-red-700 text-white hover:bg-red-800"
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
                      disabled={loading}
                    >
                      {t("login.forgotPassword")}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-300">
                    Enter the 6-digit verification code
                  </p>

                  <p className="mb-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Method:{" "}
                    {otpMethods.length > 1
                      ? "Authenticator App or Email Code"
                      : otpMethod === "email_code"
                        ? "Email Code"
                        : "Authenticator App"}
                  </p>

                  {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
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
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-red-700 text-white hover:bg-red-800"
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
                      disabled={loading}
                    >
                      <ArrowLeft size={16} />
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}

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
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/35 dark:text-red-300">
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
                        className="h-11 rounded-xl border-slate-300 pl-10 dark:border-slate-700"
                        required
                        disabled={loading}
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-red-700 text-white hover:bg-red-800"
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
                      disabled={loading}
                    >
                      <ArrowLeft size={16} />
                      Back to Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
