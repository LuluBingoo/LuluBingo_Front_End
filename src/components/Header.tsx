import React, { useEffect, useState } from "react";
import {
  Moon,
  Sun,
  User,
  LogOut,
  PlusCircle,
  Trophy,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { shopApi } from "../services/api";

interface HeaderProps {
  username?: string;
  onLogout?: () => Promise<void> | void;
  sidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  username = "surafel-worabe",
  onLogout,
  sidebarCollapsed = false,
}) => {
  const navigate = useNavigate();
  const popup = usePopup();
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSiteFullscreen, setIsSiteFullscreen] = useState(false);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsSiteFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  const handleToggleTheme = async () => {
    if (isSavingTheme) {
      return;
    }

    const nextTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    localStorage.setItem("theme", nextTheme);

    setIsSavingTheme(true);
    try {
      const profile = await shopApi.getProfile();
      const flags =
        profile.feature_flags && typeof profile.feature_flags === "object"
          ? profile.feature_flags
          : {};

      await shopApi.updateProfile({
        feature_flags: {
          ...flags,
          theme: nextTheme,
        },
      });
    } catch (error) {
      console.error("Failed to auto-save theme", error);
      popup.error("Theme changed locally, but failed to sync with backend.");
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    const confirmed = await popup.confirm({
      title: t("header.logoutTitle"),
      description: t("header.logoutDescription"),
      confirmText: t("common.logout"),
      cancelText: t("common.cancel"),
    });

    if (!confirmed) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await onLogout?.();
    } catch (error) {
      console.error("Logout failed", error);
      popup.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggleSiteFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen", error);
      popup.error("Failed to toggle fullscreen mode.");
    }
  };

  return (
    <motion.header
      className={`fixed top-0 right-0 z-40 grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-red-100 bg-white/95 px-3 sm:px-4 md:px-6 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 max-md:left-50 max-sm:left-17.5 ${sidebarCollapsed ? "left-22" : "left-62.5"}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="min-w-0" />

      <div className="pointer-events-none flex items-center justify-center gap-2">
        <Trophy className="h-5 w-5 text-red-700 dark:text-red-400" />
        <div className="text-base font-bold tracking-wide text-red-700 sm:text-lg dark:text-red-400">
          LULU Bingo
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
        <button
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-700 transition hover:bg-red-50 dark:border-slate-700 dark:text-red-300 dark:hover:bg-slate-800"
          onClick={() => navigate("/newgame")}
          aria-label={t("common.newGame")}
          title={t("common.newGame")}
        >
          <PlusCircle className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm text-slate-700 md:flex dark:bg-slate-800 dark:text-slate-200">
          <User className="h-4 w-4" />
          <span className="max-w-28 truncate">{username}</span>
        </div>

        <motion.button
          className="rounded-full border border-red-200 p-2 text-slate-700 transition hover:bg-red-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={handleToggleTheme}
          disabled={isSavingTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </motion.button>

        <motion.button
          className="rounded-full border border-red-200 p-2 text-slate-700 transition hover:bg-red-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={handleToggleSiteFullscreen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isSiteFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isSiteFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isSiteFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </motion.button>

        <motion.button
          className="flex shrink-0 items-center gap-2 rounded-lg bg-red-700 px-2.5 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3"
          onClick={handleLogout}
          disabled={isLoggingOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">
            {isLoggingOut ? t("header.loggingOut") : t("common.logout")}
          </span>
        </motion.button>
      </div>
    </motion.header>
  );
};
