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

import React, { useEffect, useRef, useState } from "react";
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
import { BackgroundEffects } from "./components/BackgroundEffects";
import { BackendStatusBadge } from "./components/BackendStatusBadge";

import { Dashboard } from "./pages/Dashboard";
import { Playground } from "./pages/Playground";
import { NewGame } from "./pages/NewGame";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { PublicCartella } from "./pages/PublicCartella";
import {
  Error400Page,
  Error401Page,
  Error403Page,
  Error404Page,
  Error418Page,
  Error429Page,
  Error500Page,
  Error503Page,
} from "./pages/ErrorPages";
import { authApi, shopApi } from "./services/api";
import { useTheme } from "./contexts/ThemeContext";
import { useLanguage } from "./contexts/LanguageContext";
import { setCurrencySetting } from "./services/settings";

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
  cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
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
  const { setTheme } = useTheme();
  const { setLanguage } = useLanguage();
  const settingsSyncedRef = useRef(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlaygroundFullscreen, setIsPlaygroundFullscreen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (settingsSyncedRef.current) {
      return;
    }
    settingsSyncedRef.current = true;

    let isMounted = true;

    const syncUserSettings = async () => {
      try {
        const profile = await shopApi.getProfile();
        if (!isMounted) return;

        const savedLanguage = localStorage.getItem("language");
        const savedTheme = localStorage.getItem("theme");

        const flags =
          profile.feature_flags && typeof profile.feature_flags === "object"
            ? profile.feature_flags
            : {};

        if (
          !savedLanguage &&
          (flags.language === "en" || flags.language === "am")
        ) {
          setLanguage(flags.language);
          localStorage.setItem("language", flags.language);
        }

        if (
          !savedTheme &&
          (flags.theme === "light" || flags.theme === "dark")
        ) {
          setTheme(flags.theme);
          localStorage.setItem("theme", flags.theme);
        }

        setCurrencySetting(flags.currency ?? "birr");

        if (flags.auto_call_seconds != null) {
          localStorage.setItem(
            "autoCallSeconds",
            String(flags.auto_call_seconds),
          );
        }
      } catch (error) {
        console.error("Failed to sync profile settings", error);
      }
    };

    void syncUserSettings();
    return () => {
      isMounted = false;
    };
  }, [setLanguage, setTheme]);

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
      <BackgroundEffects />
      {!isPlaygroundFullscreen && (
        <Sidebar
          isGameActive={isGameActive}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />
      )}
      <div
        className={`relative z-10 flex flex-1 flex-col ${isPlaygroundFullscreen ? "ml-0" : `max-md:ml-50 max-sm:ml-17.5 ${isSidebarCollapsed ? "ml-22" : "ml-62.5"}`}`}
      >
        {!isPlaygroundFullscreen && (
          <Header
            onLogout={onLogout}
            username={username}
            sidebarCollapsed={isSidebarCollapsed}
          />
        )}
        <main
          className={`flex-1 ${isPlaygroundFullscreen ? "mt-0 min-h-screen" : "mt-20 min-h-[calc(100vh-80px)]"} overflow-y-auto overflow-x-hidden`}
        >
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
                  onFullscreenChange={setIsPlaygroundFullscreen}
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
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </main>
        {!isPlaygroundFullscreen && (
          <footer className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            © {currentYear} Lulu Bingo. All rights reserved.
          </footer>
        )}
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
            <BackendStatusBadge />
            <Routes>
              <Route path="/" element={<Navigate to="/playground" replace />} />
              <Route path="/public/cartella" element={<PublicCartella />} />
              <Route path="/error/400" element={<Error400Page />} />
              <Route path="/error/401" element={<Error401Page />} />
              <Route path="/error/403" element={<Error403Page />} />
              <Route path="/error/404" element={<Error404Page />} />
              <Route path="/error/418" element={<Error418Page />} />
              <Route path="/error/429" element={<Error429Page />} />
              <Route path="/error/500" element={<Error500Page />} />
              <Route path="/error/503" element={<Error503Page />} />
              <Route
                path="/*"
                element={
                  !isLoggedIn ? (
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
                  )
                }
              />
            </Routes>
          </Router>
        </PopupProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
