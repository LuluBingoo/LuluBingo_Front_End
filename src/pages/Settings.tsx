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
import { setCurrencySetting } from "../services/settings";
import { TwoFactorMethod } from "../services/types";

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const popup = usePopup();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [currency, setCurrency] = useState("birr");
  const [autoCallSeconds, setAutoCallSeconds] = useState("5");
  const [cutPercentage, setCutPercentage] = useState("10");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const featureFlagsRef = useRef<Record<string, any>>({});
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

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOtp("");
  };

  const persistFeatureFlagsPatch = async (
    patch: Record<string, any>,
    errorMessage: string,
  ) => {
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
    } catch (error) {
      console.error("Failed to auto-save feature flags", error);
      popup.error(errorMessage);
    }
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
        setAutoCallSeconds(
          String(
            flags.auto_call_seconds ??
              localStorage.getItem("autoCallSeconds") ??
              "5",
          ),
        );
        const fallbackCut =
          flags.cut_percentage ??
          (flags.win_percentage != null
            ? Math.max(
                0,
                Math.min(100, 100 - Number(flags.win_percentage || 90)),
              )
            : 10);
        setCutPercentage(String(fallbackCut));

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
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [popup, setLanguage]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updatedFlags = {
        ...featureFlags,
        push_notifications: notifications,
        email_alerts: emailAlerts,
        auto_backup: autoBackup,
        currency,
        language,
        theme,
        cut_percentage: Math.max(
          0,
          Math.min(100, Number.parseFloat(cutPercentage || "10") || 10),
        ),
        auto_call_seconds: Number.parseInt(autoCallSeconds, 10),
      };

      await shopApi.updateProfile({
        feature_flags: updatedFlags,
      });

      setFeatureFlags(updatedFlags);
      localStorage.setItem("autoCallSeconds", autoCallSeconds);
      setCurrencySetting(currency);
      localStorage.setItem("language", language);
      localStorage.setItem("theme", theme);
      popup.success("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings", error);
      popup.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

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
                  </div>
                  <Select
                    value={currency}
                    onValueChange={async (value) => {
                      setCurrency(value);
                      setCurrencySetting(value);
                      await persistFeatureFlagsPatch(
                        { currency: value },
                        "Currency changed locally, but backend sync failed.",
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
                  </div>
                  <Select
                    value={autoCallSeconds}
                    onValueChange={async (value) => {
                      setAutoCallSeconds(value);
                      localStorage.setItem("autoCallSeconds", value);
                      await persistFeatureFlagsPatch(
                        { auto_call_seconds: Number.parseInt(value, 10) || 5 },
                        "Auto-call timer changed locally, but backend sync failed.",
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
                      Cut Percentage
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Deducted from total winner pool for each game.
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={cutPercentage}
                    onChange={(e) => setCutPercentage(e.target.value)}
                    className="w-45"
                  />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {t("settings.saveSettings")}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      {t("settings.syncSettings")}
                    </p>
                  </div>
                  <Button
                    className="min-w-24"
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                  >
                    {isSaving ? t("settings.saving") : t("common.save")}
                  </Button>
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
