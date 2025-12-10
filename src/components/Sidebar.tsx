import React from "react";
import {
  Home,
  Gamepad2,
  PlusCircle,
  User,
  Settings,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { t } = useLanguage();

  const menuItems = [
    { id: "dashboard", label: t("common.dashboard"), icon: Home },
    { id: "playground", label: t("common.playground"), icon: Gamepad2 },
    { id: "newgame", label: t("common.newGame"), icon: PlusCircle },
    { id: "profile", label: t("common.profile"), icon: User },
    { id: "settings", label: t("common.settings"), icon: Settings },
  ];

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="sidebar-logo">
        <Trophy className="logo-icon" />
        <h2 className="logo-text">LULU Bingo</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.div>
  );
};
