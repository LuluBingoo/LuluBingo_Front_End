import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface StatusOverlaysProps {
  isCheckingCartela: boolean;
  showBallPopup: boolean;
  ballPopupLabel: string;
  isFullscreen: boolean;
}

export const StatusOverlays: React.FC<StatusOverlaysProps> = ({
  isCheckingCartela,
  showBallPopup,
  ballPopupLabel,
  isFullscreen,
}) => {
  return (
    <AnimatePresence>
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
          initial={{ opacity: 0, scale: 0.35, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.2, y: -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-1200 flex items-center justify-center"
        >
          <motion.div
            className={`${isFullscreen ? "h-48 w-48 text-7xl" : "h-40 w-40 text-6xl"} flex items-center justify-center rounded-full border-4 border-white/60 bg-linear-to-br from-red-400 via-red-600 to-red-800 font-black text-white shadow-[0_0_45px_rgba(239,68,68,0.65)]`}
            animate={{ rotate: [0, -4, 4, 0] }}
            transition={{ duration: 0.35 }}
          >
            {ballPopupLabel}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
