import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Bell, Lock, Globe, Palette, Moon, Sun } from "lucide-react";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { useTheme } from "../contexts/ThemeContext";
import { authApi, shopApi } from "../services/api";
import { Input } from "../components/ui/input";
import { formatCurrency, setCurrencySetting } from "../services/settings";
import { TwoFactorMethod } from "../services/types";
import { pickRandomBingoIllustration } from "../assets/illustrations";

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const popup = usePopup();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [currency, setCurrency] = useState("birr");
  const [autoCallSeconds, setAutoCallSeconds] = useState("5");
  const [defaultGameBet, setDefaultGameBet] = useState("10");
  const [shopCutPercentage, setShopCutPercentage] = useState("0");
  const [luluCutPercentage, setLuluCutPercentage] = useState("0");
  const [availableBalance, setAvailableBalance] = useState("0");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const featureFlagsRef = useRef<Record<string, any>>({});
  const isHydratingRef = useRef(true);
  const autosaveInitializedRef = useRef<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<
    Record<string, "saving" | "saved" | null>
  >({});
  const saveStatusTimeoutsRef = useRef<Record<string, number>>({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordOtp, setPasswordOtp] = useState("");
  const [password2faEnabled, setPassword2faEnabled] = useState(false);
  const [password2faMethods, setPassword2faMethods] = useState<
    TwoFactorMethod[]
  >([]);
  const [password2faMethod, setPassword2faMethod] =
    useState<TwoFactorMethod>("totp");
  const [pageIllustration] = useState(() => pickRandomBingoIllustration());

  const getDefaultGameBetValue = (flags?: Record<string, any>) => {
    const parsed = Number.parseFloat(String(flags?.default_game_bet ?? "10"));
    if (!Number.isFinite(parsed) || parsed < 10) {
      return "10.00";
    }
    return parsed.toFixed(2);
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOtp("");
  };

  const persistFeatureFlagsPatch = async (
    patch: Record<string, any>,
    errorMessage: string,
    settingKey?: string,
  ) => {
    if (settingKey) {
      setSaveStatus((prev) => ({ ...prev, [settingKey]: "saving" }));
      if (saveStatusTimeoutsRef.current[settingKey]) {
        window.clearTimeout(saveStatusTimeoutsRef.current[settingKey]);
      }
    }

    const nextFlags = {
      ...featureFlagsRef.current,
      ...patch,
    };
    featureFlagsRef.current = nextFlags;
    setFeatureFlags(nextFlags);

    try {
      await shopApi.updateProfile({
        feature_flags: nextFlags,
      });
      if (settingKey) {
        setSaveStatus((prev) => ({ ...prev, [settingKey]: "saved" }));
        saveStatusTimeoutsRef.current[settingKey] = window.setTimeout(() => {
          setSaveStatus((prev) => ({ ...prev, [settingKey]: null }));
        }, 1400);
      }
    } catch (error) {
      console.error("Failed to auto-save feature flags", error);
      popup.error(errorMessage);
      if (settingKey) {
        setSaveStatus((prev) => ({ ...prev, [settingKey]: null }));
      }
    }
  };

  const renderSaveStatus = (key: string) => {
    const status = saveStatus[key];
    if (!status) return null;
    return (
      <span className="mt-1 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {status === "saving" ? "Saving..." : "Saved"}
      </span>
    );
  };

  const shouldSkipInitialAutosave = (key: string) => {
    if (!autosaveInitializedRef.current[key]) {
      autosaveInitializedRef.current[key] = true;
      return true;
    }
    return false;
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const profile = await shopApi.getProfile();
        const flags = profile.feature_flags || {};

        const methods =
          Array.isArray(profile.two_factor_methods) &&
          profile.two_factor_methods.length > 0
            ? profile.two_factor_methods
            : profile.two_factor_enabled
              ? [profile.two_factor_method || "totp"]
              : [];
        setPassword2faEnabled(Boolean(profile.two_factor_enabled));
        setPassword2faMethods(methods as TwoFactorMethod[]);
        setPassword2faMethod((methods[0] as TwoFactorMethod) || "totp");

        setFeatureFlags(flags);
        featureFlagsRef.current = flags;
        setNotifications(Boolean(flags.push_notifications ?? true));
        setEmailAlerts(Boolean(flags.email_alerts ?? true));
        setAutoBackup(Boolean(flags.auto_backup ?? false));
        setCurrency(String(flags.currency ?? "birr"));
        setDefaultGameBet(getDefaultGameBetValue(flags));
        setAutoCallSeconds(
          String(
            flags.auto_call_seconds ??
              localStorage.getItem("autoCallSeconds") ??
              "5",
          ),
        );
        setShopCutPercentage(String(profile.shop_cut_percentage ?? "0"));
        setLuluCutPercentage(String(profile.lulu_cut_percentage ?? "0"));
        setAvailableBalance(String(profile.wallet_balance ?? "0"));

        if (flags.language === "en" || flags.language === "am") {
          setLanguage(flags.language);
        }
        if (flags.theme === "light" || flags.theme === "dark") {
          setTheme(flags.theme);
        }

        localStorage.setItem(
          "autoCallSeconds",
          String(flags.auto_call_seconds ?? "5"),
        );
        setCurrencySetting(flags.currency ?? "birr");
      } catch (error) {
        console.error("Failed to load settings", error);
        popup.error("Failed to load settings from backend.");
      } finally {
        setSaveStatus({});
        Object.values(saveStatusTimeoutsRef.current).forEach((timeoutId) => {
          window.clearTimeout(timeoutId);
        });
        saveStatusTimeoutsRef.current = {};
        window.setTimeout(() => {
          isHydratingRef.current = false;
        }, 0);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [popup, setLanguage]);

  const handleSaveDefaultGameBet = async () => {
    const parsed = Number.parseFloat(defaultGameBet);
    if (!Number.isFinite(parsed) || parsed < 10) {
      popup.warning("Default game bet must be at least 10 ETB.");
      setDefaultGameBet(getDefaultGameBetValue(featureFlagsRef.current));
      return;
    }

    const normalized = parsed.toFixed(2);
    setDefaultGameBet(normalized);
    await persistFeatureFlagsPatch(
      { default_game_bet: parsed },
      "Default game bet changed locally, but backend sync failed.",
      "defaultGameBet",
    );
  };

  useEffect(() => {
    if (isHydratingRef.current) return;
    if (shouldSkipInitialAutosave("notifications")) return;
    void persistFeatureFlagsPatch(
      { push_notifications: notifications },
      "Push notification setting changed locally, but backend sync failed.",
      "notifications",
    );
  }, [notifications]);

  useEffect(() => {
    if (isHydratingRef.current) return;
    if (shouldSkipInitialAutosave("emailAlerts")) return;
    void persistFeatureFlagsPatch(
      { email_alerts: emailAlerts },
      "Email alert setting changed locally, but backend sync failed.",
      "emailAlerts",
    );
  }, [emailAlerts]);

  useEffect(() => {
    if (isHydratingRef.current) return;
    if (shouldSkipInitialAutosave("autoBackup")) return;
    void persistFeatureFlagsPatch(
      { auto_backup: autoBackup },
      "Auto backup setting changed locally, but backend sync failed.",
      "autoBackup",
    );
  }, [autoBackup]);

  useEffect(() => {
    return () => {
      Object.values(saveStatusTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const handleSendPasswordOtp = async () => {
    if (isSendingPasswordOtp) return;
    if (password2faMethod !== "email_code") {
      popup.info("Use your authenticator app code for this method.");
      return;
    }

    setIsSendingPasswordOtp(true);
    try {
      await authApi.send2FAEmailCode("change_password");
      popup.success("Verification code sent to your email.");
    } catch (error) {
      console.error("Failed to send password change OTP", error);
      popup.error("Failed to send verification code.");
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (isChangingPassword) return;

    if (!currentPassword.trim() || !newPassword.trim()) {
      popup.warning("Please enter current and new password.");
      return;
    }

    if (newPassword.length < 8) {
      popup.warning("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      popup.warning("New password and confirmation do not match.");
      return;
    }

    if (password2faEnabled && passwordOtp.trim().length === 0) {
      popup.warning("Enter OTP code to confirm password change.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        method: password2faEnabled ? password2faMethod : undefined,
        otp: password2faEnabled ? passwordOtp : undefined,
      });
      popup.success("Password changed successfully.");
      setShowPasswordDialog(false);
      resetPasswordForm();
    } catch (error: any) {
      console.error("Failed to change password", error);
      const errorData = error?.data || error?.response?.data || {};
      const detail =
        errorData?.otp ||
        errorData?.new_password ||
        errorData?.current_password ||
        errorData?.detail ||
        "Failed to change password.";
      popup.error(Array.isArray(detail) ? detail[0] : String(detail));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, cardIdx) => (
            <Card key={cardIdx} className="space-y-4 p-5">
              <Skeleton className="h-6 w-48" />
              {Array.from({ length: 3 }).map((__, rowIdx) => (
                <div
                  key={`${cardIdx}-${rowIdx}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            resetPasswordForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password, new password, and confirm with 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPassword}
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChangingPassword}
            />

            {password2faEnabled && (
              <>
                {password2faMethods.length > 1 && (
                  <Select
                    value={password2faMethod}
                    onValueChange={(value) =>
                      setPassword2faMethod(value as TwoFactorMethod)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select 2FA method" />
                    </SelectTrigger>
                    <SelectContent>
                      {password2faMethods.includes("totp") && (
                        <SelectItem value="totp">Authenticator App</SelectItem>
                      )}
                      {password2faMethods.includes("email_code") && (
                        <SelectItem value="email_code">Email Code</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}

                <Input
                  type="text"
                  maxLength={6}
                  placeholder={
                    password2faMethod === "email_code"
                      ? "Enter email OTP code"
                      : "Enter authenticator OTP code"
                  }
                  value={passwordOtp}
                  onChange={(e) => setPasswordOtp(e.target.value)}
                  disabled={isChangingPassword}
                />

                {password2faMethod === "email_code" && (
                  <Button
                    variant="outline"
                    onClick={handleSendPasswordOtp}
                    disabled={isSendingPasswordOtp || isChangingPassword}
                  >
                    {isSendingPasswordOtp ? "Sending..." : "Send OTP to Email"}
                  </Button>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        className="mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("settings.title")}
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="overflow-hidden p-2">
          <img
            src={pageIllustration}
            alt="Bingo illustration"
            className="h-40 w-full rounded-lg object-cover"
          />
        </Card>
      </motion.div>

      <div className="grid gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-700" />
                <h3 className="text-lg font-semibold">
                  {t("settings.notifications")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.pushNotifications")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.pushNotificationsDesc")}
                    </p>
                    {renderSaveStatus("notifications")}
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.emailAlerts")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.emailAlertsDesc")}
                    </p>
                    {renderSaveStatus("emailAlerts")}
                  </div>
                  <Switch
                    checked={emailAlerts}
                    onCheckedChange={setEmailAlerts}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-red-700" />
                <h3 className="text-lg font-semibold">
                  {t("settings.languageRegion")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.language")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.languageDesc")}
                    </p>
                    {renderSaveStatus("language")}
                  </div>
                  <Select
                    value={language}
                    onValueChange={async (value: string) => {
                      if (value === "en" || value === "am") {
                        setLanguage(value);
                        localStorage.setItem("language", value);
                        await persistFeatureFlagsPatch(
                          { language: value },
                          "Language changed locally, but backend sync failed.",
                          "language",
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-45">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.currency")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.currencyDesc")}
                    </p>
                    {renderSaveStatus("currency")}
                  </div>
                  <Select
                    value={currency}
                    onValueChange={async (value) => {
                      setCurrency(value);
                      setCurrencySetting(value);
                      await persistFeatureFlagsPatch(
                        { currency: value },
                        "Currency changed locally, but backend sync failed.",
                        "currency",
                      );
                    }}
                  >
                    <SelectTrigger className="w-45">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="birr">ETB (Birr)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-700" />
                <h3 className="text-lg font-semibold">
                  {t("settings.security")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.autoBackup")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.autoBackupDesc")}
                    </p>
                    {renderSaveStatus("autoBackup")}
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.changePassword")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.changePasswordDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="min-w-24"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    {t("settings.change")}
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Auto-call Timer
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Choose seconds between automatic calls.
                    </p>
                    {renderSaveStatus("autoCallSeconds")}
                  </div>
                  <Select
                    value={autoCallSeconds}
                    onValueChange={async (value) => {
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            Default Game Bet
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-300">
                            Used as the initial bet value in New Game setup.
                            Minimum is 10 ETB.
                          </p>
                          {renderSaveStatus("defaultGameBet")}
                        </div>
                        <Input
                          type="number"
                          min={10}
                          value={defaultGameBet}
                          onChange={(event) =>
                            setDefaultGameBet(event.target.value)
                          }
                          onBlur={() => {
                            void handleSaveDefaultGameBet();
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleSaveDefaultGameBet();
                            }
                          }}
                          className="w-45"
                        />
                      </div>;
                      setAutoCallSeconds(value);
                      localStorage.setItem("autoCallSeconds", value);
                      await persistFeatureFlagsPatch(
                        { auto_call_seconds: Number.parseInt(value, 10) || 5 },
                        "Auto-call timer changed locally, but backend sync failed.",
                        "autoCallSeconds",
                      );
                    }}
                  >
                    <SelectTrigger className="w-45">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3s</SelectItem>
                      <SelectItem value="5">5s</SelectItem>
                      <SelectItem value="10">10s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Shop Cut Percentage
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Applied on each game pool before payout. Manager-only
                      setting.
                    </p>
                  </div>
                  <Input
                    type="number"
                    value={shopCutPercentage}
                    disabled
                    className="w-45"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Lulu Cut Percentage
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Deducted from your shop cut. Manager-only setting.
                    </p>
                  </div>
                  <Input
                    type="number"
                    value={luluCutPercentage}
                    disabled
                    className="w-45"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Lulu Reserve Balance
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Current reserve balance used for Lulu-cut checks before
                      creating games.
                    </p>
                  </div>
                  <Input
                    value={formatCurrency(availableBalance)}
                    disabled
                    className="w-45"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Auto Save
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      All settings are saved automatically as you change them.
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-red-700" />
                <h3 className="text-lg font-semibold">
                  {t("settings.appearance")}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.themeMode")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.themeModeDesc")}
                    </p>
                    {renderSaveStatus("theme")}
                  </div>
                  <Button
                    variant="outline"
                    className="min-w-32"
                    onClick={async () => {
                      const nextTheme = theme === "dark" ? "light" : "dark";
                      setTheme(nextTheme);
                      localStorage.setItem("theme", nextTheme);
                      await persistFeatureFlagsPatch(
                        { theme: nextTheme },
                        "Theme changed locally, but backend sync failed.",
                        "theme",
                      );
                    }}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="h-4 w-4" /> Light
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" /> Dark
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
