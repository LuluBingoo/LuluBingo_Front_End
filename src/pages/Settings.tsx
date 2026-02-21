import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Bell, Lock, Globe, Palette, Moon, Sun } from "lucide-react";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
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
import { shopApi } from "../services/api";

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const popup = usePopup();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [currency, setCurrency] = useState("birr");
  const [autoCallSeconds, setAutoCallSeconds] = useState("5");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const profile = await shopApi.getProfile();
        const flags = profile.feature_flags || {};

        setFeatureFlags(flags);
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

        if (flags.language === "en" || flags.language === "am") {
          setLanguage(flags.language);
        }
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
        auto_call_seconds: Number.parseInt(autoCallSeconds, 10),
      };

      await shopApi.updateProfile({
        feature_flags: updatedFlags,
      });

      setFeatureFlags(updatedFlags);
      localStorage.setItem("autoCallSeconds", autoCallSeconds);
      popup.success("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings", error);
      popup.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
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
                    onValueChange={(value: string) => {
                      if (value === "en" || value === "am") {
                        setLanguage(value);
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
                  <Select value={currency} onValueChange={setCurrency}>
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
                    onClick={() =>
                      popup.info("Password change dialog would open here")
                    }
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
                    onValueChange={setAutoCallSeconds}
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
                    onClick={toggleTheme}
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
