import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface StatusOverlaysProps {
  isCheckingCartela: boolean;
  isStoppingGame: boolean;
  showBallPopup: boolean;
  ballPopupLabel: string;
  isFullscreen: boolean;
}

export const StatusOverlays: React.FC<StatusOverlaysProps> = ({
  isCheckingCartela,
  isStoppingGame,
  showBallPopup,
  ballPopupLabel,
  isFullscreen,
}) => {
  return (
    <AnimatePresence>
      {isStoppingGame && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1400] flex items-center justify-center overflow-hidden bg-slate-950/85 px-4"
        >
          <motion.div
            className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-500/35 blur-3xl"
            animate={{ x: [0, 30, -20, 0], y: [0, -18, 24, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-amber-400/30 blur-3xl"
            animate={{ x: [0, -28, 16, 0], y: [0, 20, -24, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ scale: 0.92, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            className="relative w-[min(92vw,640px)] rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              {["B", "I", "N", "G", "O"].map((letter, index) => (
                <motion.div
                  key={letter}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/15 font-black"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: index * 0.08,
                  }}
                >
                  {letter}
                </motion.div>
              ))}
            </div>

            <h3 className="text-center text-2xl font-black tracking-wide">
              Closing Game
            </h3>
            <p className="mt-2 text-center text-sm text-white/85">
              Finalizing cancellation with no winner. Please wait...
            </p>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-linear-to-r from-red-400 via-amber-300 to-emerald-400"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {isCheckingCartela && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1350] flex items-center justify-center bg-black/40 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 8, opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Checking cartela...
            </span>
          </motion.div>
        </motion.div>
      )}

      {showBallPopup && ballPopupLabel && (
        <motion.div
          key={ballPopupLabel}
          initial={{ opacity: 0, scale: 0.5, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -30 }}
          transition={{ 
            duration: 0.3,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          className="pointer-events-none fixed inset-0 z-1200 flex items-center justify-center"
        >
          <motion.div
            className={`${isFullscreen ? "h-56 w-56 text-8xl" : "h-48 w-48 text-7xl"} flex items-center justify-center rounded-full border-8 border-white bg-linear-to-br from-red-500 via-red-600 to-red-800 font-black text-white shadow-[0_0_80px_rgba(239,68,68,0.8),0_0_120px_rgba(239,68,68,0.5)]`}
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 80px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.5)",
                "0 0 100px rgba(239,68,68,0.9), 0 0 150px rgba(239,68,68,0.6)",
                "0 0 80px rgba(239,68,68,0.8), 0 0 120px rgba(239,68,68,0.5)"
              ]
            }}
            transition={{ 
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {ballPopupLabel}
          </motion.div>
          
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className={`${isFullscreen ? "h-72 w-72" : "h-64 w-64"} rounded-full bg-red-500/30 blur-3xl`} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
