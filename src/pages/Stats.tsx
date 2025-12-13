import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calendar,
  Flame,
  Target,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
  ListTodo,
  Trophy,
  Sparkles
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { storageService } from '../services/storage';
import { PomodoroSession } from '../types';
import { cn } from '../lib/utils';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'indigo';
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
    glow: 'shadow-blue-500/10',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
    glow: 'shadow-emerald-500/10',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
    glow: 'shadow-amber-500/10',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/20',
    glow: 'shadow-purple-500/10',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/20',
    glow: 'shadow-rose-500/10',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20',
    glow: 'shadow-indigo-500/10',
  },
};

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color,
  className 
}) => {
  const colors = colorVariants[color];
  
  return (
    <div className={cn(
      "group relative p-5 rounded-2xl",
      "bg-white dark:bg-zinc-900/50",
      "border border-zinc-100 dark:border-zinc-800/50",
      "hover:border-zinc-200 dark:hover:border-zinc-700/50",
      "transition-all duration-300",
      "hover:shadow-lg",
      colors.glow,
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "p-2.5 rounded-xl",
          colors.bg,
          "ring-1",
          colors.ring
        )}>
          <span className={colors.icon}>{icon}</span>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend.value > 0 
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
              : trend.value < 0 
                ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          )}>
            {trend.value > 0 ? <ArrowUp className="w-3 h-3" /> : 
             trend.value < 0 ? <ArrowDown className="w-3 h-3" /> : 
             <Minus className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-zinc-100 dark:text-zinc-800"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-indigo-500 dark:text-indigo-400 transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-zinc-900 dark:text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Mini Bar Chart
const MiniBarChart: React.FC<{ data: number[]; color?: string }> = ({ data, color = 'indigo' }) => {
  const max = Math.max(...data, 1);
  
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-sm transition-all duration-300",
            value > 0 
              ? `bg-${color}-500 dark:bg-${color}-400` 
              : "bg-zinc-100 dark:bg-zinc-800"
          )}
          style={{ 
            height: value > 0 ? `${(value / max) * 100}%` : '4px',
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  );
};

export const Stats: React.FC = () => {
  const { tasks } = useTasks();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await storageService.pomodoro.getAll();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // This week's sessions
    const thisWeekSessions = sessions.filter(s => new Date(s.startTime) >= weekAgo);
    const lastWeekSessions = sessions.filter(s => {
      const d = new Date(s.startTime);
      return d >= twoWeeksAgo && d < weekAgo;
    });
    
    // Focus time calculations
    const totalFocusMinutes = Math.round(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
    const thisWeekFocusMinutes = Math.round(thisWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
    const lastWeekFocusMinutes = Math.round(lastWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
    
    // Focus trend
    const focusTrend = lastWeekFocusMinutes > 0 
      ? Math.round(((thisWeekFocusMinutes - lastWeekFocusMinutes) / lastWeekFocusMinutes) * 100)
      : thisWeekFocusMinutes > 0 ? 100 : 0;
    
    // Task stats
    const completedTasks = tasks.filter(t => t.isCompleted);
    const pendingTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted);
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
    
    // Today's tasks
    const todayCompletedTasks = completedTasks.filter(t => {
      const completedDate = new Date(t.updatedAt);
      return completedDate >= today;
    });
    
    // Streak calculation (consecutive days with completed tasks)
    const calculateStreak = () => {
      let streak = 0;
      const checkDate = new Date(today);
      
      for (let i = 0; i < 365; i++) {
        const dayTasks = completedTasks.filter(t => {
          const d = new Date(t.updatedAt);
          return d.getDate() === checkDate.getDate() &&
                 d.getMonth() === checkDate.getMonth() &&
                 d.getFullYear() === checkDate.getFullYear();
        });
        
        if (dayTasks.length > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          // If no tasks today, check if there are tasks right now (same day)
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    };
    
    // Weekly data for chart
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - 6 + i);
      return d;
    });
    
    const weeklyData = last7Days.map(date => {
      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.startTime);
        return sDate.getDate() === date.getDate() && 
               sDate.getMonth() === date.getMonth() && 
               sDate.getFullYear() === date.getFullYear();
      });
      
      const dayTasks = completedTasks.filter(t => {
        const tDate = new Date(t.updatedAt);
        return tDate.getDate() === date.getDate() && 
               tDate.getMonth() === date.getMonth() && 
               tDate.getFullYear() === date.getFullYear();
      });

      const minutes = Math.round(daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth();
      
      return {
        day: days[date.getDay()],
        minutes,
        tasks: dayTasks.length,
        date,
        isToday
      };
    });
    
    // Average daily focus
    const activeDays = weeklyData.filter(d => d.minutes > 0).length;
    const avgDailyFocus = activeDays > 0 ? Math.round(thisWeekFocusMinutes / activeDays) : 0;
    
    // Session count
    const totalSessions = sessions.length;
    const weekSessions = thisWeekSessions.length;
    
    return {
      totalFocusMinutes,
      thisWeekFocusMinutes,
      focusTrend,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      completionRate,
      todayCompletedTasks: todayCompletedTasks.length,
      streak: calculateStreak(),
      weeklyData,
      avgDailyFocus,
      totalSessions,
      weekSessions,
      activeDays
    };
  }, [tasks, sessions]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}s ${mins}dk`;
    }
    return `${mins}dk`;
  };

  const maxMinutes = Math.max(...stats.weeklyData.map(d => d.minutes), 30);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 dark:text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">İstatistikler</h1>
              <p className="text-zinc-500 dark:text-zinc-400">Verimlilik ve ilerleme analizin</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Toplam Odak"
            value={formatDuration(stats.totalFocusMinutes)}
            subtitle={`Bu hafta ${formatDuration(stats.thisWeekFocusMinutes)}`}
            icon={<Clock className="w-5 h-5" />}
            trend={{ value: stats.focusTrend, label: 'geçen hafta' }}
            color="blue"
          />
          
          <StatCard
            title="Tamamlanan Görev"
            value={stats.completedTasks}
            subtitle={`${stats.pendingTasks} bekleyen görev`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
          />
          
          <StatCard
            title="Günlük Seri"
            value={`${stats.streak} gün`}
            subtitle="Sürekli aktivite"
            icon={<Flame className="w-5 h-5" />}
            color="amber"
          />
          
          <StatCard
            title="Pomodoro"
            value={stats.totalSessions}
            subtitle={`Bu hafta ${stats.weekSessions} oturum`}
            icon={<Timer className="w-5 h-5" />}
            color="rose"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Weekly Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Haftalık Aktivite</h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Odak (dk)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-zinc-500 dark:text-zinc-400">Görev</span>
                </div>
              </div>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4">
              {stats.weeklyData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex items-end justify-center h-full gap-1">
                    {/* Focus Bar */}
                    <div className="relative flex-1 flex items-end justify-center">
                      {/* Tooltip */}
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                          <div>{data.minutes} dk odak</div>
                          <div>{data.tasks} görev</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-zinc-900 dark:bg-white rotate-45" />
                      </div>
                      
                      <div 
                        className={cn(
                          "w-full max-w-[24px] rounded-t-lg transition-all duration-500 ease-out",
                          data.minutes > 0 
                            ? "bg-indigo-500 hover:bg-indigo-400" 
                            : "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        style={{ 
                          height: data.minutes > 0 ? `${(data.minutes / maxMinutes) * 100}%` : '4px',
                          minHeight: '4px'
                        }}
                      />
                    </div>
                    
                    {/* Tasks Bar */}
                    <div className="relative flex-1 flex items-end justify-center">
                      <div 
                        className={cn(
                          "w-full max-w-[24px] rounded-t-lg transition-all duration-500 ease-out",
                          data.tasks > 0 
                            ? "bg-emerald-500 hover:bg-emerald-400" 
                            : "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        style={{ 
                          height: data.tasks > 0 ? `${(data.tasks / Math.max(...stats.weeklyData.map(d => d.tasks), 5)) * 100}%` : '4px',
                          minHeight: '4px'
                        }}
                      />
                    </div>
                  </div>
                  
                  <span className={cn(
                    "text-xs font-medium uppercase",
                    data.isToday 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-zinc-400 dark:text-zinc-500"
                  )}>
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Ring */}
          <div className="bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Tamamlanma Oranı</h2>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <ProgressRing progress={stats.completionRate} size={140} strokeWidth={10} />
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                {stats.completedTasks} / {stats.completedTasks + stats.pendingTasks} görev tamamlandı
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">Bugün</span>
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {stats.todayCompletedTasks} görev
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Ort. Günlük Odak</span>
            </div>
            <p className="text-2xl font-bold">{formatDuration(stats.avgDailyFocus)}</p>
            <p className="text-xs opacity-70 mt-1">{stats.activeDays} aktif gün / 7 gün</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <ListTodo className="w-4 h-4" />
              <span className="text-sm font-medium">Bekleyen Görev</span>
            </div>
            <p className="text-2xl font-bold">{stats.pendingTasks}</p>
            <p className="text-xs opacity-70 mt-1">Tamamlanmayı bekliyor</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">En Verimli Gün</span>
            </div>
            <p className="text-2xl font-bold">
              {stats.weeklyData.reduce((max, d) => d.minutes > max.minutes ? d : max, stats.weeklyData[0]).day}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {Math.max(...stats.weeklyData.map(d => d.minutes))} dakika
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3 opacity-80">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Haftalık Oturum</span>
            </div>
            <p className="text-2xl font-bold">{stats.weekSessions}</p>
            <p className="text-xs opacity-70 mt-1">Pomodoro oturumu</p>
          </div>
        </div>
      </div>
    </div>
  );
};
