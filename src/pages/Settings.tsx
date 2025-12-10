import React, { useState } from "react";
import { motion } from "motion/react";
import { Bell, Lock, Globe, Palette } from "lucide-react";
import { Card } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";
import "./Settings.css";

export const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);

  return (
    <div className="settings-page">
      <motion.div
        className="settings-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{t("settings.title")}</h1>
      </motion.div>

      <div className="settings-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="settings-card">
            <div className="settings-section">
              <div className="section-header">
                <Bell className="section-icon" />
                <h3>{t("settings.notifications")}</h3>
              </div>
              <div className="settings-items">
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">
                      {t("settings.pushNotifications")}
                    </p>
                    <p className="setting-description">
                      {t("settings.pushNotificationsDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">{t("settings.emailAlerts")}</p>
                    <p className="setting-description">
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
          <Card className="settings-card">
            <div className="settings-section">
              <div className="section-header">
                <Globe className="section-icon" />
                <h3>{t("settings.languageRegion")}</h3>
              </div>
              <div className="settings-items">
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">{t("settings.language")}</p>
                    <p className="setting-description">
                      {t("settings.languageDesc")}
                    </p>
                  </div>
                  <Select
                    value={language}
                    onValueChange={(value: string) =>
                      setLanguage(value as "en" | "am")
                    }
                  >
                    <SelectTrigger className="select-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">{t("settings.currency")}</p>
                    <p className="setting-description">
                      {t("settings.currencyDesc")}
                    </p>
                  </div>
                  <Select defaultValue="birr">
                    <SelectTrigger className="select-trigger">
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
          <Card className="settings-card">
            <div className="settings-section">
              <div className="section-header">
                <Lock className="section-icon" />
                <h3>{t("settings.security")}</h3>
              </div>
              <div className="settings-items">
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">{t("settings.autoBackup")}</p>
                    <p className="setting-description">
                      {t("settings.autoBackupDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">
                      {t("settings.changePassword")}
                    </p>
                    <p className="setting-description">
                      {t("settings.changePasswordDesc")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="action-button"
                    onClick={() =>
                      alert("Password change dialog would open here")
                    }
                  >
                    {t("settings.change")}
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
          <Card className="settings-card">
            <div className="settings-section">
              <div className="section-header">
                <Palette className="section-icon" />
                <h3>{t("settings.appearance")}</h3>
              </div>
              <div className="settings-items">
                <div className="setting-item">
                  <div className="setting-info">
                    <p className="setting-label">{t("settings.themeMode")}</p>
                    <p className="setting-description">
                      {t("settings.themeModeDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
