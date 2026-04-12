import React from "react";
import {
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Layers3,
  MonitorPlay,
  Sparkles,
  Trophy,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import {
  OFFLINE_CARTELLA_CATALOG,
  getOfflineCartellaBoard,
} from "../data/offlineCartellas";

const steps = [
  {
    title: "Choose your mode",
    description:
      "Start from New Game and choose Online or Offline. Online creates fresh cartellas for that game. Offline uses the fixed printable cartella order.",
    icon: MonitorPlay,
    accent: "from-sky-500/15 to-cyan-500/10",
  },
  {
    title: "Set bet and players",
    description:
      "Lock the minimum bet per cartella and decide how many players will join. Each player can reserve cartellas before the game begins.",
    icon: Layers3,
    accent: "from-violet-500/15 to-fuchsia-500/10",
  },
  {
    title: "Assign cartellas",
    description:
      "Reserve cartellas for each player. In Offline mode, cartella 1, 2, 3, 4 and all the way to 200 always keep the same board order.",
    icon: BookOpen,
    accent: "from-amber-500/15 to-orange-500/10",
  },
  {
    title: "Start calling numbers",
    description:
      "Open the Playground and start the session. Numbers can be called manually or automatically using the timing from settings.",
    icon: Gamepad2,
    accent: "from-emerald-500/15 to-teal-500/10",
  },
  {
    title: "Check bingo claims",
    description:
      "Players can be checked against the called numbers. The game validates row and diagonal bingo patterns and handles banned or winner cartellas correctly.",
    icon: CheckCircle2,
    accent: "from-rose-500/15 to-pink-500/10",
  },
  {
    title: "Celebrate and close",
    description:
      "When a valid winner is found, the Playground closes the game beautifully. If needed, you can also close without a winner.",
    icon: Trophy,
    accent: "from-red-500/15 to-amber-500/10",
  },
] as const;

const offlineCartellaNumbers = Object.keys(OFFLINE_CARTELLA_CATALOG)
  .map((value) => Number.parseInt(value, 10))
  .filter(Number.isFinite)
  .sort((a, b) => a - b);

const About: React.FC = () => {
  const [selectedCartella, setSelectedCartella] = React.useState("1");

  const selectedBoard = React.useMemo(
    () => getOfflineCartellaBoard(selectedCartella) || [],
    [selectedCartella],
  );

  const previewGrid = React.useMemo(
    () =>
      Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => selectedBoard[row * 5 + col]),
      ),
    [selectedBoard],
  );

  return (
    <div className="space-y-8 p-6">
      <section className="relative overflow-hidden rounded-3xl border border-red-100 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <Sparkles className="h-4 w-4" />
              About Lulu Bingo
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Beautiful guide to the whole Bingo flow
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              This page explains how the game works from setup to winner check,
              and it also shows the fixed Offline cartella order so the printed
              boards and the frontend always stay aligned.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 dark:border-sky-800 dark:bg-sky-950/30">
              <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                <Wifi className="h-4 w-4" />
                <span className="font-semibold">Online Mode</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                New random cartellas are created for each game session.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <BookOpen className="h-4 w-4" />
                <span className="font-semibold">Offline Mode</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Cartella numbers 1 to 200 always keep the same fixed boards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Step by step game guide
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Follow this flow from game creation to winner validation.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`overflow-hidden border border-slate-200 bg-linear-to-br ${step.accent} p-0 dark:border-slate-700`}
                >
                  <div className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <Card className="border border-slate-200 bg-white/95 p-5 dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Offline cartella assigned order
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                These numbers are fixed. Selecting Cartella 1, 2, 3, 4 and so on
                will always use the same board in Offline mode.
              </p>
            </div>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
              200 fixed offline cartellas
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="max-h-112 overflow-auto pr-1">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
                {offlineCartellaNumbers.map((cartellaNumber) => {
                  const isActive = selectedCartella === String(cartellaNumber);
                  return (
                    <button
                      key={cartellaNumber}
                      type="button"
                      onClick={() =>
                        setSelectedCartella(String(cartellaNumber))
                      }
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-red-600 bg-red-700 text-white shadow-lg shadow-red-700/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-700 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-[11px] uppercase opacity-75">
                        Cartella
                      </div>
                      <div className="text-lg font-black">{cartellaNumber}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white/95 p-5 dark:border-slate-700 dark:bg-slate-900/90">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Cartella {selectedCartella} preview
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Fixed preview directly from the synced Offline catalog.
              </p>
            </div>
            <div className="rounded-full bg-red-700 px-3 py-1 text-sm font-semibold text-white">
              Constant order
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2">
              {["1", "2", "3", "4", "5"].map((label) => (
                <div
                  key={label}
                  className="rounded-xl bg-red-700 py-2 text-center text-sm font-bold text-white"
                >
                  {label}
                </div>
              ))}
            </div>

            {previewGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {row.map((value, colIndex) => {
                  const isFree = rowIndex === 2 && colIndex === 2;
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`flex h-16 items-center justify-center rounded-xl border text-sm font-bold ${
                        isFree
                          ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                      }`}
                    >
                      {value === 0 ? "FREE" : value}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
            In Offline mode, this preview is exactly what the frontend and
            backend use for checking and viewing the selected cartella number.
          </div>
        </Card>
      </section>
    </div>
  );
};

export default About;
