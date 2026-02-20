import React from "react";
import { motion } from "motion/react";

const particleConfig = [
  { left: "6%", top: "14%", size: 6, duration: 13, delay: 0.2 },
  { left: "12%", top: "68%", size: 5, duration: 16, delay: 0.9 },
  { left: "18%", top: "36%", size: 4, duration: 12, delay: 0.4 },
  { left: "26%", top: "82%", size: 7, duration: 18, delay: 1.2 },
  { left: "34%", top: "22%", size: 5, duration: 15, delay: 0.5 },
  { left: "42%", top: "58%", size: 6, duration: 14, delay: 0.7 },
  { left: "51%", top: "12%", size: 4, duration: 17, delay: 0.1 },
  { left: "58%", top: "76%", size: 8, duration: 19, delay: 1.5 },
  { left: "66%", top: "34%", size: 5, duration: 16, delay: 0.6 },
  { left: "73%", top: "62%", size: 6, duration: 14, delay: 0.8 },
  { left: "80%", top: "18%", size: 7, duration: 15, delay: 1.1 },
  { left: "86%", top: "48%", size: 4, duration: 13, delay: 0.3 },
  { left: "92%", top: "72%", size: 5, duration: 17, delay: 1.4 },
];

const ringConfig = [
  {
    className:
      "-top-20 -left-20 h-72 w-72 border border-sky-200/60 dark:border-sky-900/30",
    duration: 28,
  },
  {
    className:
      "top-1/4 -right-18 h-64 w-64 border border-violet-200/60 dark:border-violet-900/30",
    duration: 32,
  },
  {
    className:
      "-bottom-24 left-1/3 h-80 w-80 border border-rose-200/50 dark:border-rose-900/30",
    duration: 36,
  },
];

interface BackgroundEffectsProps {
  className?: string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.10),transparent_35%),radial-gradient(circle_at_82%_14%,rgba(139,92,246,0.12),transparent_38%),radial-gradient(circle_at_72%_76%,rgba(244,63,94,0.10),transparent_35%),radial-gradient(circle_at_16%_78%,rgba(14,165,233,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_82%_14%,rgba(139,92,246,0.18),transparent_38%),radial-gradient(circle_at_72%_76%,rgba(236,72,153,0.14),transparent_35%),radial-gradient(circle_at_16%_78%,rgba(14,165,233,0.14),transparent_32%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f01a_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f01a_1px,transparent_1px)] bg-size-[4rem_4rem] dark:bg-[linear-gradient(to_right,#1e293b4d_1px,transparent_1px),linear-gradient(to_bottom,#1e293b4d_1px,transparent_1px)]" />

      <motion.div
        className="absolute -top-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-linear-to-br from-sky-300/25 to-blue-500/5 blur-3xl dark:from-blue-700/25 dark:to-slate-900/10"
        animate={{ x: [0, 45, -25, 0], y: [0, 18, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-[30rem] w-[30rem] rounded-full bg-linear-to-tl from-violet-300/25 to-indigo-500/5 blur-3xl dark:from-violet-700/20 dark:to-slate-900/10"
        animate={{ x: [0, -38, 24, 0], y: [0, -24, 14, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/3 h-64 w-64 rounded-full bg-linear-to-tr from-amber-200/25 to-orange-400/10 blur-3xl dark:from-amber-600/12 dark:to-orange-700/8"
        animate={{ x: [0, 24, -16, 0], y: [0, -18, 12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {ringConfig.map((ring, index) => (
        <motion.div
          key={ring.className}
          className={`absolute rounded-full ${ring.className}`}
          animate={{ rotate: [0, index % 2 === 0 ? 360 : -360] }}
          transition={{
            duration: ring.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {particleConfig.map((particle, index) => (
        <motion.div
          key={`${particle.left}-${particle.top}`}
          className="absolute rounded-full bg-slate-400/35 dark:bg-slate-300/25"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -14, 8, 0],
            x: [0, index % 2 === 0 ? 8 : -8, 0],
            opacity: [0.2, 0.7, 0.3, 0.2],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};
