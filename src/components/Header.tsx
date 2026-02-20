import React, { useState } from "react";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

interface HeaderProps {
  username?: string;
  onLogout?: () => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({
  username = "surafel-worabe",
  onLogout,
}) => {
  const Navigate = useNavigate();
  const popup = usePopup();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (isLoggingOut) {
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
      className="header"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="header-title">
        {/* <h1 className="logo-text">LULU Bingo</h1> */}
        <button className="logo-text" onClick={() => Navigate("/newgame")}>
          New Game
        </button>
      </div>

      <div className="header-actions">
        <div className="user-info">
          <User className="user-icon" />
          <span>{username}</span>
        </div>

        <motion.button
          className="theme-toggle"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === "light" ? (
            <Moon className="theme-icon" />
          ) : (
            <Sun className="theme-icon" />
          )}
        </motion.button>

        <motion.button
          className="logout-button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="logout-icon" />
          <span className="logout-text">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </motion.button>
      </div>
    </motion.header>
  );
};
