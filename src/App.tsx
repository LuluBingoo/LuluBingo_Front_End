// import React, { useState } from 'react';
// import { ThemeProvider } from './contexts/ThemeContext';
// import { LanguageProvider } from './contexts/LanguageContext';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';
// import { Dashboard } from './pages/Dashboard';
// import { Playground } from './pages/Playground';
// import { NewGame } from './pages/NewGame';
// import { Profile } from './pages/Profile';
// import { Settings } from './pages/Settings';
// import { Login } from './pages/Login';
// import './styles/globals.css';

// // Create a type for game configuration
// interface GameConfig {
//   game: string;
//   betBirr: string;
//   numPlayers: string;
//   winBirr: string;
//   bonus: string;
//   freeHit: string;
//   selectedPatterns: number[];
// }

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [currentPage, setCurrentPage] = useState('playground');
//   const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
//   const [isGameActive, setIsGameActive] = useState(false);

//   if (!isLoggedIn) {
//     return (
//       <ThemeProvider>
//         <LanguageProvider>
//           <Login onLogin={() => setIsLoggedIn(true)} />
//         </LanguageProvider>
//       </ThemeProvider>
//     );
//   }

//   // Handle game creation from NewGame component
//   const handleGameCreated = (config: Omit<GameConfig, 'selectedPatterns'>, patterns: number[]) => {
//     const fullConfig: GameConfig = {
//       ...config,
//       selectedPatterns: patterns
//     };
//     setGameConfig(fullConfig);
//     setIsGameActive(true);
//     setCurrentPage('playground'); // Navigate to playground
//   };

//   // Handle starting a new game from Playground
//   const handleStartNewGame = () => {
//     setGameConfig(null);
//     setIsGameActive(false);
//     setCurrentPage('newgame'); // Navigate back to new game setup
//   };

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'playground':
//         return (
//           <Playground
//             gameConfig={gameConfig}
//             onStartNewGame={handleStartNewGame}
//           />
//         );
//       case 'newgame':
//         return <NewGame onGameCreated={handleGameCreated} />;
//       case 'profile':
//         return <Profile />;
//       case 'settings':
//         return <Settings />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <ThemeProvider>
//       <LanguageProvider>
//         <div className="app-container">
//           <Sidebar
//             currentPage={currentPage}
//             onNavigate={setCurrentPage}
//             isGameActive={isGameActive}
//           />
//           <div className="main-content">
//             <Header />
//             <main className="page-content">
//               {renderPage()}
//             </main>
//           </div>
//         </div>
//       </LanguageProvider>
//     </ThemeProvider>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PopupProvider } from "./contexts/PopupContext";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

import { Dashboard } from "./pages/Dashboard";
import { Playground } from "./pages/Playground";
import { NewGame } from "./pages/NewGame";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { authApi } from "./services/api";

/* ===============================
   TYPES
================================ */
interface GameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
  selectedPatterns: number[];
  gameCode?: string;
  cartelaNumbers?: string[];
  cartelaData?: number[][];
  drawSequence?: number[];
  cartellaDrawSequences?: number[][];
  backendStatus?: string;
}

/* ===============================
   PROTECTED APP CONTENT
================================ */
function AppLayout({
  gameConfig,
  setGameConfig,
  isGameActive,
  setIsGameActive,
  onLogout,
  username,
}: {
  gameConfig: GameConfig | null;
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig | null>>;
  isGameActive: boolean;
  setIsGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => Promise<void>;
  username: string;
}) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Handle game creation
  const handleGameCreated = (
    config: Omit<GameConfig, "selectedPatterns">,
    patterns: number[],
  ) => {
    const fullConfig: GameConfig = {
      ...config,
      selectedPatterns: patterns,
    };

    setGameConfig(fullConfig);
    setIsGameActive(true);
    navigate("/playground");
  };

  // Handle starting new game
  const handleStartNewGame = () => {
    setGameConfig(null);
    setIsGameActive(false);
    navigate("/newgame");
  };

  // Handle game state changes from Playground
  const handleGameStateChange = (active: boolean) => {
    setIsGameActive(active);
  };

  // Handle cartela removal
  const handleCartelaRemoved = (cartelaNumber: string) => {
    if (gameConfig && gameConfig.cartelaNumbers) {
      setGameConfig({
        ...gameConfig,
        cartelaNumbers: gameConfig.cartelaNumbers.filter(
          (c) => c !== cartelaNumber,
        ),
      });
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-60"></div>
      <motion.div
        className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-linear-to-br from-sky-400/20 to-blue-500/10 blur-3xl dark:from-blue-900/20 dark:to-slate-900/10"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, 15, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 h-96 w-96 rounded-full bg-linear-to-tl from-indigo-400/20 to-purple-500/10 blur-3xl dark:from-indigo-900/20 dark:to-slate-900/10"
        animate={{ x: [0, -30, 25, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-linear-to-tr from-amber-300/15 to-orange-400/10 blur-3xl dark:from-transparent dark:to-transparent"
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <Sidebar isGameActive={isGameActive} isCollapsed={isSidebarCollapsed} />
      <div
        className={`relative z-10 flex flex-1 flex-col max-md:ml-50 max-sm:ml-17.5 ${isSidebarCollapsed ? "ml-22" : "ml-62.5"}`}
      >
        <Header
          onLogout={onLogout}
          username={username}
          sidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <main className="mt-20 min-h-[calc(100vh-80px)] overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  gameConfig={gameConfig}
                  isGameActive={isGameActive}
                />
              }
            />

            <Route
              path="/playground"
              element={
                <Playground
                  gameConfig={gameConfig}
                  onStartNewGame={handleStartNewGame}
                  onGameStateChange={handleGameStateChange}
                  onCartelaRemoved={handleCartelaRemoved}
                />
              }
            />

            <Route
              path="/newgame"
              element={<NewGame onGameCreated={handleGameCreated} />}
            />

            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/playground" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ===============================
   MAIN APP
================================ */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authApi.isAuthenticated());
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [username, setUsername] = useState("Shop User");

  const loadMe = async () => {
    try {
      const response = await authApi.getMe();
      const displayName =
        response.user.name?.trim() ||
        response.user.username?.trim() ||
        "Shop User";
      setUsername(displayName);
    } catch (error) {
      console.error("Failed to load current user", error);
      setUsername("Shop User");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadMe();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggedIn(false);
      setUsername("Shop User");
      setGameConfig(null);
      setIsGameActive(false);
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PopupProvider>
          <Router>
            {!isLoggedIn ? (
              <Login onLogin={() => setIsLoggedIn(true)} />
            ) : (
              <AppLayout
                gameConfig={gameConfig}
                setGameConfig={setGameConfig}
                isGameActive={isGameActive}
                setIsGameActive={setIsGameActive}
                onLogout={handleLogout}
                username={username}
              />
            )}
          </Router>
        </PopupProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
