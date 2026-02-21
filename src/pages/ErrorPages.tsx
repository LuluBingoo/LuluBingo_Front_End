import React from "react";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Ban,
  Bomb,
  Coffee,
  Ghost,
  Home,
  KeyRound,
  RefreshCw,
  ServerCrash,
  TimerReset,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";

type ErrorConfig = {
  code: number;
  title: string;
  subtitle: string;
  joke: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
};

const ERROR_CONFIG: Record<number, ErrorConfig> = {
  400: {
    code: 400,
    title: "Bad Request",
    subtitle: "That request came in with tangled bingo balls.",
    joke: "Our server squinted at it, sighed, and asked for a cleaner card.",
    icon: AlertTriangle,
    accentClass: "text-amber-600 dark:text-amber-400",
  },
  401: {
    code: 401,
    title: "Unauthorized",
    subtitle: "This room needs a secret bingo password.",
    joke: "No worries, even the caller forgot the code once.",
    icon: KeyRound,
    accentClass: "text-sky-600 dark:text-sky-400",
  },
  403: {
    code: 403,
    title: "Forbidden",
    subtitle: "The bouncer says this cartella is VIP-only.",
    joke: "Try another route before security yells BING-NO.",
    icon: Ban,
    accentClass: "text-rose-600 dark:text-rose-400",
  },
  404: {
    code: 404,
    title: "Page Not Found",
    subtitle: "That page rolled under the bingo table.",
    joke: "We checked all 75 numbers and still couldn’t call it.",
    icon: Ghost,
    accentClass: "text-violet-600 dark:text-violet-400",
  },
  418: {
    code: 418,
    title: "I’m a Teapot",
    subtitle: "This endpoint only brews coffee-adjacent chaos.",
    joke: "Server says: no tea, only dramatic steam.",
    icon: Coffee,
    accentClass: "text-orange-600 dark:text-orange-400",
  },
  429: {
    code: 429,
    title: "Too Many Requests",
    subtitle: "You’re calling numbers faster than the announcer.",
    joke: "Take a breath. Even bingo needs suspense.",
    icon: TimerReset,
    accentClass: "text-red-600 dark:text-red-400",
  },
  500: {
    code: 500,
    title: "Server Error",
    subtitle: "A backend bingo ball exploded mid-air.",
    joke: "Our engineers are already chasing it with a net.",
    icon: Bomb,
    accentClass: "text-red-700 dark:text-red-400",
  },
  503: {
    code: 503,
    title: "Service Unavailable",
    subtitle: "The bingo hall is on a snack break.",
    joke: "Please wait while the server refills its popcorn.",
    icon: ServerCrash,
    accentClass: "text-indigo-600 dark:text-indigo-400",
  },
};

const DEFAULT_ERROR = ERROR_CONFIG[500];

export const FunnyErrorPage: React.FC<{ code: number }> = ({ code }) => {
  const navigate = useNavigate();
  const error = ERROR_CONFIG[code] || DEFAULT_ERROR;
  const Icon = error.icon;

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-slate-200 bg-white/95 p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
          {error.code === 503 && (
            <div className="mx-auto mb-3 w-fit rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-800/60 dark:bg-red-900/30 dark:text-red-300">
              Backend Offline
            </div>
          )}
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <Icon className={`h-10 w-10 ${error.accentClass}`} />
          </motion.div>

          <div className="mb-2 text-sm font-semibold tracking-widest text-slate-500 dark:text-slate-300">
            ERROR {error.code}
          </div>
          <h1 className={`text-3xl font-black ${error.accentClass}`}>
            {error.title}
          </h1>
          <p className="mt-3 text-base text-slate-700 dark:text-slate-200">
            {error.subtitle}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {error.joke}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              <RefreshCw className="h-4 w-4" /> Go Back
            </Button>
            <Button onClick={() => navigate("/dashboard")}>Go Dashboard</Button>
            <Button onClick={() => navigate("/")} variant="ghost">
              <Home className="h-4 w-4" /> Home
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export const Error400Page = () => <FunnyErrorPage code={400} />;
export const Error401Page = () => <FunnyErrorPage code={401} />;
export const Error403Page = () => <FunnyErrorPage code={403} />;
export const Error404Page = () => <FunnyErrorPage code={404} />;
export const Error418Page = () => <FunnyErrorPage code={418} />;
export const Error429Page = () => <FunnyErrorPage code={429} />;
export const Error500Page = () => <FunnyErrorPage code={500} />;
export const Error503Page = () => <FunnyErrorPage code={503} />;
