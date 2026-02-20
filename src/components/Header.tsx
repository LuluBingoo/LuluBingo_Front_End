import React, { useState } from "react";
import { Moon, Sun, User, LogOut, Menu } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

interface HeaderProps {
  username?: string;
  onLogout?: () => Promise<void> | void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  username = "surafel-worabe",
  onLogout,
  sidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const popup = usePopup();
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { theme, toggleTheme } = useTheme();

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

  return (
    <motion.header
      className={`fixed top-0 right-0 z-40 flex h-20 items-center justify-between border-b border-red-100 bg-white/95 px-6 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 max-md:left-50 max-sm:left-17.5 ${sidebarCollapsed ? "left-22" : "left-62.5"}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={t("header.toggleSidebar")}
            title={t("header.toggleSidebar")}
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            className="rounded-md px-3 py-2 text-lg font-bold tracking-wide text-red-700 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-800"
            onClick={() => navigate("/newgame")}
          >
            {t("common.newGame")}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm text-slate-700 md:flex dark:bg-slate-800 dark:text-slate-200">
          <User className="h-4 w-4" />
          <span>{username}</span>
        </div>

        <motion.button
          className="rounded-full border border-red-200 p-2 text-slate-700 transition hover:bg-red-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={toggleTheme}
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
          className="flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleLogout}
          disabled={isLoggingOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="h-4 w-4" />
          <span>
            {isLoggingOut ? t("header.loggingOut") : t("common.logout")}
          </span>
        </motion.button>
      </div>
    </motion.header>
  );
};
