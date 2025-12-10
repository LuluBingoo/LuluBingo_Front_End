import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Gamepad2, Calendar } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  
  const stats = [
    { label: t('dashboard.deposit'), value: '2', icon: DollarSign, color: '#0ea5e9' },
    { label: t('dashboard.gamesToday'), value: '0', icon: Gamepad2, color: '#8b5cf6' },
    { label: t('dashboard.earningToday'), value: '$0', icon: TrendingUp, color: '#10b981' },
    { label: t('dashboard.availableBalance'), value: '$818.00', icon: DollarSign, color: '#f59e0b' },
  ];

  const recentGames = [
    { 
      id: 2860308, 
      stake: 10, 
      players: 4, 
      calls: 1, 
      winner: [], 
      bonus: 0, 
      free: 0, 
      status: 'PLAYING' 
    },
    { 
      id: 2860304, 
      stake: 10, 
      players: 4, 
      calls: 1, 
      winner: [], 
      bonus: 0, 
      free: 0, 
      status: 'PLAYING' 
    },
  ];

  return (
    <div className="dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="date-selector">
          <Calendar className="calendar-icon" />
          <input type="date" className="date-input" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </motion.div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="stat-card">
                <div className="stat-icon" style={{ background: `${stat.color}15` }}>
                  <Icon style={{ color: stat.color }} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="recent-games-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2>{t('dashboard.recentGames')}</h2>
        <Card className="games-table-card">
          <div className="table-wrapper">
            <table className="games-table">
              <thead>
                <tr>
                  <th>{t('dashboard.game')}</th>
                  <th>{t('dashboard.stake')}</th>
                  <th>{t('dashboard.players')}</th>
                  <th>{t('dashboard.calls')}</th>
                  <th>{t('dashboard.winner')}</th>
                  <th>{t('dashboard.bonus')}</th>
                  <th>{t('dashboard.free')}</th>
                  <th>{t('dashboard.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <motion.tr
                    key={game.id}
                    whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.05)' }}
                  >
                    <td>
                      <div className="game-id">{t('dashboard.game')} {game.id}</div>
                    </td>
                    <td>{game.stake}</td>
                    <td>{game.players}</td>
                    <td>{game.calls}</td>
                    <td>{game.winner.length > 0 ? game.winner.join(', ') : '[]'}</td>
                    <td>{game.bonus}</td>
                    <td>{game.free}</td>
                    <td>
                      <Badge className="status-badge status-playing">
                        {t('dashboard.playing')}
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