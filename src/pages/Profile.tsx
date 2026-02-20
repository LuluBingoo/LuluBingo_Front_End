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
    return <div className="p-8 text-center">{t("profile.loading")}</div>;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load profile data.
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
          {t("profile.title")}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5">
            <div className="flex flex-col items-center text-center">
              <motion.div
                className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-slate-800"
                whileHover={{ scale: 1.05 }}
              >
                <User className="h-9 w-9 text-red-700 dark:text-red-400" />
              </motion.div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {profile.name || profile.username}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                {profile.shop_code}
              </p>

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
                      className="mx-auto mt-1 flex items-center gap-3 rounded-full border border-green-500/40 bg-green-500/10 px-3 py-1"
                      onClick={() => openTwoFactorConfirmation("disable")}
                    >
                      <span className="text-xs font-semibold text-green-500">
                        ON
                      </span>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white"
                        aria-label="Turn off 2FA"
                      >
                        <Power size={18} />
                      </span>
                      <span className="text-xs font-semibold text-green-500/70">
                        OFF
                      </span>
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
                      className="mx-auto mt-1 flex items-center gap-3 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1"
                      onClick={() => openTwoFactorConfirmation("enable")}
                    >
                      <span className="text-xs font-semibold text-yellow-500">
                        ON
                      </span>
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-slate-700"
                        aria-label="Turn on 2FA"
                      >
                        <Power size={18} />
                      </span>
                      <span className="text-xs font-semibold text-yellow-500/70">
                        OFF
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="space-y-4"
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

          <Card className="p-5">
            <h3 className="mb-4 text-lg font-semibold">
              {t("profile.personalInfo")}
            </h3>
            <form className="space-y-4" onSubmit={handleSave}>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <User className="h-4 w-4" />
                  {t("profile.fullName")}
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Mail className="h-4 w-4" />
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Phone className="h-4 w-4" />
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <Calendar className="h-4 w-4" />
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
                <Button
                  type="submit"
                  className="bg-red-700 text-white shadow-sm hover:bg-red-800"
                >
                  {t("common.save")} Changes
                </Button>
              </motion.div>
            </form>

            {!profile.two_factor_enabled && showTwoFactorSetup ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="mb-2 flex items-center gap-2">
                  <QrCode size={18} className="text-red-700" />
                  <h4 className="font-semibold">
                    Setup Two-Factor Authentication
                  </h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Scan this QR code with your authenticator app, then enter the
                  6-digit code to enable 2FA.
                </p>

                {isTwoFactorSetupLoading ? (
                  <div className="mt-3">
                    <p className="text-sm text-slate-500">
                      Loading 2FA setup...
                    </p>
                  </div>
                ) : twoFactorSetupError ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-red-600">
                      {twoFactorSetupError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={startTwoFactorSetup}
                      className="h-9"
                    >
                      Retry Setup
                    </Button>
                  </div>
                ) : twoFactorSetup ? (
                  <div className="mt-3 space-y-3">
                    <div className="mx-auto w-fit rounded-lg bg-white p-3">
                      <QRCodeSVG
                        value={twoFactorSetup.provisioning_uri}
                        size={170}
                      />
                    </div>

                    <Input
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />

                    <div className="flex justify-end gap-2">
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
                        className="bg-red-700 text-white hover:bg-red-800"
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
