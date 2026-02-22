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

  const sidebarParticles = React.useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${(index * 17.5) % 100}%`,
        size: 3 + (index % 5),
        delay: (index % 7) * 0.4,
        duration: 5 + (index % 6) * 0.9,
        drift: ((index % 9) - 4) * 9,
      })),
    [],
  );

  return (
    <>
      {onToggleCollapse && isCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="fixed top-4 left-20 z-120 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label={t("header.toggleSidebar")}
          title={t("header.toggleSidebar")}
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <motion.div
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col overflow-hidden bg-white/95 p-4 backdrop-blur-md transition-[width] duration-300 dark:bg-slate-900/90 max-md:w-50 max-sm:w-17.5 ${isCollapsed ? "w-22" : "w-62.5"}`}
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-4 text-red-200/90 dark:text-slate-700/90">
          <svg
            viewBox="0 0 20 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M2 0 Q16 5 2 10 T2 20 T2 30 T2 40 T2 50 T2 60 T2 70 T2 80 T2 90 T2 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-4 -left-3 h-24 w-20 rotate-8 bg-red-200/30 dark:bg-red-300/12 [clip-path:polygon(50%_0%,100%_32%,84%_100%,16%_100%,0%_32%)]" />
          <div className="absolute top-26 right-2 h-16 w-14 -rotate-8 bg-amber-200/30 dark:bg-amber-300/10 [clip-path:polygon(50%_0%,100%_34%,82%_100%,18%_100%,0%_34%)]" />
          <div className="absolute bottom-18 left-3 h-18 w-15 rotate-10 bg-rose-200/30 dark:bg-rose-300/10 [clip-path:polygon(50%_0%,100%_36%,84%_100%,16%_100%,0%_36%)]" />
          <div className="absolute inset-0 opacity-40 dark:opacity-30 bg-[radial-gradient(circle_at_18%_20%,rgba(239,68,68,0.2)_1px,transparent_1.5px),radial-gradient(circle_at_78%_60%,rgba(251,113,133,0.22)_1px,transparent_1.5px)] bg-size-[20px_20px,26px_26px]" />
          {sidebarParticles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute bottom-0 rounded-full bg-red-400/35 shadow-[0_0_10px_rgba(248,113,113,0.35)] dark:bg-rose-200/35 dark:shadow-[0_0_10px_rgba(251,191,36,0.25)]"
              style={{
                left: particle.left,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
              animate={{
                y: [0, -26, -72, -120],
                x: [0, particle.drift * 0.35, particle.drift],
                opacity: [0, 0.85, 0.55, 0],
                scale: [0.8, 1.1, 1, 0.7],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mb-6 flex items-center px-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-red-700 max-sm:mx-auto" />
          </div>

          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="absolute top-0 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label={t("header.toggleSidebar")}
              title={t("header.toggleSidebar")}
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative z-10 mb-2 h-px bg-slate-200/80 dark:bg-slate-700/80" />

        {/* NAVIGATION */}
        <nav className="relative z-10 flex flex-1 flex-col gap-3 pt-2">
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
            className="relative z-10 mt-auto rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 dark:border-emerald-700/50 dark:bg-emerald-900/25"
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
    </>
  );
};
