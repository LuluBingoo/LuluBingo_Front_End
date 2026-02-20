// import React from "react";
// import {
//   Home,
//   Gamepad2,
//   PlusCircle,
//   User,
//   Settings,
//   Trophy,
//   Circle,
// } from "lucide-react";
// import { motion } from "motion/react";
// import { useLanguage } from "../contexts/LanguageContext";
// import "./Sidebar.css";

// interface SidebarProps {
//   currentPage: string;
//   onNavigate: (page: string) => void;
//   isGameActive?: boolean; // Added this prop
// }

// export const Sidebar: React.FC<SidebarProps> = ({
//   currentPage,
//   onNavigate,
//   isGameActive = false, // Default value
// }) => {
//   const { t } = useLanguage();

//   const menuItems = [
//     { id: "dashboard", label: t("common.dashboard"), icon: Home },
//     { id: "playground", label: t("common.playground"), icon: Gamepad2 },
//     { id: "newgame", label: t("common.newGame"), icon: PlusCircle },
//     { id: "profile", label: t("common.profile"), icon: User },
//     { id: "settings", label: t("common.settings"), icon: Settings },
//   ];

//   return (
//     <motion.div
//       className="sidebar"
//       initial={{ x: -250 }}
//       animate={{ x: 0 }}
//       transition={{ type: "spring", stiffness: 100 }}
//     >
//       <div className="sidebar-logo">
//         <Trophy className="logo-icon" />
//         <h2 className="logo-text">LULU Bingo</h2>
//       </div>

//       <nav className="sidebar-nav">
//         {menuItems.map((item) => {
//           const Icon = item.icon;
//           const isActive = currentPage === item.id;

//           return (
//             <motion.button
//               key={item.id}
//               className={`nav-item ${isActive ? "active" : ""}`}
//               onClick={() => onNavigate(item.id)}
//               whileHover={{ x: 5 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <Icon className="nav-icon" />
//               <span>{item.label}</span>
//               {isActive && (
//                 <motion.div
//                   className="active-indicator"
//                   layoutId="activeIndicator"
//                   initial={false}
//                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
//                 />
//               )}
//             </motion.button>
//           );
//         })}
//       </nav>

//       {/* Game Active Status Indicator */}
//       {isGameActive && (
//         <motion.div
//           className="game-status-indicator"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//         >
//           <div className="game-status-content">
//             <Circle className="live-dot" size={8} fill="#10b981" color="#10b981" />
//             <span className="game-status-text">Game Active</span>
//           </div>
//           <div className="game-status-subtext">Playground is running</div>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

import React from "react";
import {
  Home,
  Gamepad2,
  PlusCircle,
  User,
  Settings,
  Trophy,
  Circle,
} from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "./Sidebar.css";

interface SidebarProps {
  isGameActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isGameActive = false }) => {
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
      className="sidebar"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      {/* LOGO */}
      <div className="sidebar-logo">
        <Trophy className="logo-icon" />
        <h2 className="logo-text">LULU Bingo</h2>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.button
              key={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(item.path)}
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
          className="game-status-indicator"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="game-status-content">
            <Circle
              className="live-dot"
              size={8}
              fill="#10b981"
              color="#10b981"
            />
            <span className="game-status-text">
              {t("common.gameActive") || "Game Active"}
            </span>
          </div>
          <div className="game-status-subtext">
            {t("common.playgroundRunning") || "Playground is running"}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
