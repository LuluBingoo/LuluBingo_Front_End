import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Power,
  QrCode,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { shopApi, authApi } from "../services/api";
import { ShopProfile, TwoFactorSetup } from "../services/types";
import { QRCodeSVG } from "qrcode.react";
import "./Profile.css";

export const Profile: React.FC = () => {
  const { t } = useLanguage();
  const popup = usePopup();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ShopProfile | null>(null);

  // 2FA State
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(
    null,
  );
  const [otp, setOtp] = useState("");
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [isTwoFactorSetupLoading, setIsTwoFactorSetupLoading] = useState(false);
  const [twoFactorSetupError, setTwoFactorSetupError] = useState<string | null>(
    null,
  );
  const [showDisableTwoFactorDialog, setShowDisableTwoFactorDialog] =
    useState(false);
  const [showTwoFactorConfirmDialog, setShowTwoFactorConfirmDialog] =
    useState(false);
  const [twoFactorConfirmAction, setTwoFactorConfirmAction] = useState<
    "enable" | "disable" | null
  >(null);
  const [disableOtp, setDisableOtp] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await shopApi.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ShopProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await shopApi.updateProfile({
        name: profile.name,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        bank_name: profile.bank_name,
        bank_account_name: profile.bank_account_name,
        bank_account_number: profile.bank_account_number,
      });
      popup.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      popup.error("Failed to update profile.");
    }
  };

  const startTwoFactorSetup = async () => {
    setShowTwoFactorSetup(true);
    setIsTwoFactorSetupLoading(true);
    setTwoFactorSetupError(null);
    setTwoFactorSetup(null);
    setOtp("");

    try {
      const data = await authApi.setup2FA();
      setTwoFactorSetup(data);
    } catch (error) {
      console.error("Failed to start 2FA setup", error);
      setTwoFactorSetupError(
        "Failed to load 2FA setup. Please check your connection and try again.",
      );
      popup.error("Failed to start 2FA setup.");
    } finally {
      setIsTwoFactorSetupLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!otp.trim()) {
      popup.warning("Please enter OTP code.");
      return;
    }

    try {
      await authApi.enable2FA(otp);
      popup.success("Two-factor authentication enabled successfully!");
      setShowTwoFactorSetup(false);
      setTwoFactorSetup(null);
      setOtp("");
      loadProfile(); // Refresh profile to update verify status
    } catch (error) {
      console.error("Failed to enable 2FA", error);
      popup.error("Invalid OTP or server error.");
    }
  };

  const disableTwoFactor = async () => {
    if (!disableOtp.trim()) {
      popup.warning("Please enter OTP code.");
      return;
    }

    try {
      await authApi.disable2FA(disableOtp);
      popup.success("Two-factor authentication disabled.");
      setShowDisableTwoFactorDialog(false);
      setDisableOtp("");
      loadProfile();
    } catch (error) {
      console.error("Failed to disable 2FA", error);
      popup.error("Failed to disable 2FA. Invalid OTP?");
    }
  };

  const openTwoFactorConfirmation = (action: "enable" | "disable") => {
    setTwoFactorConfirmAction(action);
    setShowTwoFactorConfirmDialog(true);
  };

  const confirmTwoFactorAction = () => {
    const action = twoFactorConfirmAction;
    setShowTwoFactorConfirmDialog(false);

    if (action === "enable") {
      startTwoFactorSetup();
      return;
    }

    if (action === "disable") {
      setShowDisableTwoFactorDialog(true);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load profile data.
      </div>
    );
  }

  return (
    <div className="profile-page">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>{t("profile.title")}</h1>
      </motion.div>

      <div className="profile-content">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="profile-card">
            <div className="profile-avatar-section">
              <motion.div
                className="avatar-circle"
                whileHover={{ scale: 1.05 }}
              >
                <User className="avatar-icon" />
              </motion.div>
              <h2>{profile.name || profile.username}</h2>
              <p className="user-role">{profile.shop_code}</p>

              <div className="mt-6 w-full">
                <div className="text-sm font-medium mb-2 text-gray-400">
                  Security
                </div>
                {profile.two_factor_enabled ? (
                  <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
                      <Shield size={18} />
                      <span className="font-semibold">2FA Enabled</span>
                    </div>
                    <button
                      type="button"
                      className="twofa-power-wrap"
                      onClick={() => openTwoFactorConfirmation("disable")}
                    >
                      <span className="twofa-power-label">ON</span>
                      <span
                        className="twofa-power-button twofa-power-button--on"
                        aria-label="Turn off 2FA"
                      >
                        <Power size={18} />
                      </span>
                      <span className="twofa-power-label">OFF</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20 text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
                      <Shield size={18} />
                      <span className="font-semibold">2FA Disabled</span>
                    </div>
                    <button
                      type="button"
                      className="twofa-power-wrap"
                      onClick={() => openTwoFactorConfirmation("enable")}
                    >
                      <span className="twofa-power-label">ON</span>
                      <span
                        className="twofa-power-button twofa-power-button--off"
                        aria-label="Turn on 2FA"
                      >
                        <Power size={18} />
                      </span>
                      <span className="twofa-power-label">OFF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="profile-details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Dialog
            open={showTwoFactorConfirmDialog}
            onOpenChange={setShowTwoFactorConfirmDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {twoFactorConfirmAction === "enable"
                    ? "Turn ON Two-Factor Authentication"
                    : "Turn OFF Two-Factor Authentication"}
                </DialogTitle>
                <DialogDescription>
                  {twoFactorConfirmAction === "enable"
                    ? "Do you want to turn ON 2FA security for this account?"
                    : "Do you want to turn OFF 2FA security for this account?"}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTwoFactorConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={confirmTwoFactorAction}>
                  {twoFactorConfirmAction === "enable" ? "Turn ON" : "Turn OFF"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showDisableTwoFactorDialog}
            onOpenChange={setShowDisableTwoFactorDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                <DialogDescription>
                  Enter your authenticator OTP code to disable 2FA.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Enter 6-digit code"
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value)}
                maxLength={6}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDisableTwoFactorDialog(false);
                    setDisableOtp("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={disableTwoFactor}
                >
                  Disable 2FA
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="details-card">
            <h3>{t("profile.personalInfo")}</h3>
            <form className="profile-form" onSubmit={handleSave}>
              <div className="form-field">
                <label>
                  <User className="field-icon" />
                  {t("profile.fullName")}
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="form-field">
                <label>
                  <Mail className="field-icon" />
                  {t("profile.email")}
                </label>
                <Input
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) =>
                    handleChange("contact_email", e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  <Phone className="field-icon" />
                  {t("profile.phone")}
                </label>
                <Input
                  type="tel"
                  value={profile.contact_phone}
                  onChange={(e) =>
                    handleChange("contact_phone", e.target.value)
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  <Calendar className="field-icon" />
                  Member Since
                </label>
                <Input
                  defaultValue={new Date(
                    profile.created_at,
                  ).toLocaleDateString()}
                  disabled
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="save-button">
                  {t("common.save")} Changes
                </Button>
              </motion.div>
            </form>

            {!profile.two_factor_enabled && showTwoFactorSetup ? (
              <div className="twofa-inline-section">
                <div className="twofa-inline-header">
                  <QrCode size={18} />
                  <h4>Setup Two-Factor Authentication</h4>
                </div>
                <p className="twofa-inline-description">
                  Scan this QR code with your authenticator app, then enter the
                  6-digit code to enable 2FA.
                </p>

                {isTwoFactorSetupLoading ? (
                  <div className="twofa-setup-content">
                    <p className="twofa-setup-message">Loading 2FA setup...</p>
                  </div>
                ) : twoFactorSetupError ? (
                  <div className="twofa-setup-content">
                    <p className="twofa-setup-error">{twoFactorSetupError}</p>
                    <Button
                      variant="outline"
                      onClick={startTwoFactorSetup}
                      className="twofa-retry-btn"
                    >
                      Retry Setup
                    </Button>
                  </div>
                ) : twoFactorSetup ? (
                  <div className="twofa-setup-content">
                    <div className="twofa-qr-wrap">
                      <QRCodeSVG
                        value={twoFactorSetup.provisioning_uri}
                        size={170}
                      />
                    </div>

                    <Input
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center text-lg tracking-widest twofa-otp-input"
                      maxLength={6}
                    />

                    <div className="twofa-inline-actions">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowTwoFactorSetup(false);
                          setTwoFactorSetup(null);
                          setTwoFactorSetupError(null);
                          setIsTwoFactorSetupLoading(false);
                          setOtp("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="twofa-enable-btn"
                        onClick={enableTwoFactor}
                        disabled={otp.trim().length !== 6}
                      >
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
