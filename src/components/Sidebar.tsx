import React from "react";
import {
  Home,
  Gamepad2,
  PlusCircle,
  User,
  Settings,
  Trophy,
  Circle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

interface SidebarProps {
  isGameActive?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isGameActive = false,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: t("common.dashboard"), icon: Home },
    { path: "/playground", label: t("common.playground"), icon: Gamepad2 },
    { path: "/newgame", label: t("common.newGame"), icon: PlusCircle },
    { path: "/profile", label: t("common.profile"), icon: User },
    { path: "/settings", label: t("common.settings"), icon: Settings },
  ];

  return (
    <motion.div
      className={`fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-red-100 bg-white/95 p-4 backdrop-blur-md transition-[width] duration-300 dark:border-slate-700 dark:bg-slate-900/90 max-md:w-50 max-sm:w-17.5 ${isCollapsed ? "w-22" : "w-62.5"}`}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="fixed top-4 left-25 z-80 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={t("header.toggleSidebar")}
          title={t("header.toggleSidebar")}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {/* LOGO */}
      <div className="mb-6 flex items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-red-700 max-sm:mx-auto" />
        </div>
        {!isCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={t("header.toggleSidebar")}
            title={t("header.toggleSidebar")}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-2 h-px bg-slate-200 dark:bg-slate-700" />

      {/* NAVIGATION */}
      <nav className="flex flex-1 flex-col gap-3 pt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition max-sm:justify-center max-sm:px-0 ${
                isActive
                  ? "bg-red-700 text-white"
                  : "text-slate-700 hover:bg-red-50 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="h-4 w-4" />
              <span
                className={`max-sm:hidden ${isCollapsed ? "hidden" : "block"}`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  className={`absolute right-2 h-2 w-2 rounded-full bg-white max-sm:hidden ${isCollapsed ? "hidden" : "block"}`}
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* GAME ACTIVE STATUS */}
      {isGameActive && (
        <motion.div
          className="mt-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-700/50 dark:bg-emerald-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <Circle
              className="h-2 w-2"
              size={8}
              fill="#10b981"
              color="#10b981"
            />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {t("common.gameActive") || "Game Active"}
            </span>
          </div>
          <div
            className={`mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-300/80 max-sm:hidden ${isCollapsed ? "hidden" : "block"}`}
          >
            {t("common.playgroundRunning") || "Playground is running"}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
