import React from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, Gamepad2, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useLanguage } from "../contexts/LanguageContext";

interface DashboardProps {
  gameConfig?: {
    game: string;
    betBirr: string;
    numPlayers: string;
    winBirr: string;
    selectedPatterns: number[];
    cartelaNumbers?: string[];
  } | null;
  isGameActive?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  gameConfig,
  isGameActive = false,
}) => {
  const { t } = useLanguage();

  // Calculate stats based on current game
  const gamesToday = isGameActive ? 1 : 0;
  const availableBalance = gameConfig
    ? `$${parseFloat(gameConfig.winBirr || "0").toFixed(2)}`
    : "$818.00";

  const stats = [
    {
      label: t("dashboard.deposit"),
      value: "2",
      icon: DollarSign,
      iconClass: "text-sky-500",
      bgClass: "bg-sky-500/15",
    },
    {
      label: t("dashboard.gamesToday"),
      value: gamesToday.toString(),
      icon: Gamepad2,
      iconClass: "text-violet-500",
      bgClass: "bg-violet-500/15",
    },
    {
      label: t("dashboard.earningToday"),
      value: "$0",
      icon: TrendingUp,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/15",
    },
    {
      label: t("dashboard.availableBalance"),
      value: availableBalance,
      icon: DollarSign,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/15",
    },
  ];

  // Show current game if active
  const recentGames =
    isGameActive && gameConfig
      ? [
          {
            id: parseInt(gameConfig.game) || 1,
            stake: parseFloat(gameConfig.betBirr) || 10,
            players: gameConfig.cartelaNumbers?.length || 0,
            calls: 0,
            winner: [],
            bonus: 0,
            free: 0,
            status: "PLAYING",
          },
        ]
      : [];

  return (
    <div className="space-y-6 p-6">
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <Calendar className="h-4 w-4 text-red-700" />
          <input
            type="date"
            className="bg-transparent text-sm outline-none"
            defaultValue={new Date().toISOString().split("T")[0]}
            title="Select date"
            aria-label="Select date"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="flex items-center gap-3 p-4">
                <div className={`rounded-xl p-2 ${stat.bgClass}`}>
                  <Icon className={`h-5 w-5 ${stat.iconClass}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {stat.label}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("dashboard.recentGames")}
        </h2>
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                  <th className="px-3 py-2">{t("dashboard.game")}</th>
                  <th className="px-3 py-2">{t("dashboard.stake")}</th>
                  <th className="px-3 py-2">{t("dashboard.players")}</th>
                  <th className="px-3 py-2">{t("dashboard.calls")}</th>
                  <th className="px-3 py-2">{t("dashboard.winner")}</th>
                  <th className="px-3 py-2">{t("dashboard.bonus")}</th>
                  <th className="px-3 py-2">{t("dashboard.free")}</th>
                  <th className="px-3 py-2">{t("dashboard.status")}</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <motion.tr
                    key={game.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                    whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.05)" }}
                  >
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {t("dashboard.game")} {game.id}
                      </div>
                    </td>
                    <td className="px-3 py-2">{game.stake}</td>
                    <td className="px-3 py-2">{game.players}</td>
                    <td className="px-3 py-2">{game.calls}</td>
                    <td className="px-3 py-2">
                      {game.winner.length > 0 ? game.winner.join(", ") : "[]"}
                    </td>
                    <td className="px-3 py-2">{game.bonus}</td>
                    <td className="px-3 py-2">{game.free}</td>
                    <td className="px-3 py-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {t("dashboard.playing")}
                      </Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
