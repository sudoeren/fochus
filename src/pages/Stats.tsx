import React, { useState, useEffect } from 'react';
import { BarChart, CheckCircle, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { storageService } from '../services/storage';
import { PomodoroSession } from '../types';

export const Stats: React.FC = () => {
  const { tasks } = useTasks();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  // --- Calculations ---

  // 1. Total Focus Time (in minutes)
  const totalFocusMinutes = Math.round(
    sessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60
  );

  // 2. Tasks Completed (All time)
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;

  // 3. Weekly Focus Data (Last 7 days)
  const getWeeklyFocusData = () => {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - 6 + i);
      return d;
    });

    return last7Days.map(date => {
      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.startTime);
        return sDate.getDate() === date.getDate() && 
               sDate.getMonth() === date.getMonth() && 
               sDate.getFullYear() === date.getFullYear();
      });

      const minutes = Math.round(daySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);
      return {
        day: days[date.getDay()],
        minutes: minutes,
        date: date
      };
    });
  };

  const weeklyData = getWeeklyFocusData();
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60); // Min scale 60m

  if (loading) return <div className="flex justify-center items-center h-full text-zinc-500">Yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
          <BarChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">İstatistikler</h1>
          <p className="text-gray-500 dark:text-zinc-400">Verimlilik analizin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Focus */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">Toplam Odak</span>
          </div>
          <div className="text-3xl font-bold">
            {Math.floor(totalFocusMinutes / 60)}s {totalFocusMinutes % 60}dk
          </div>
        </div>

        {/* Card 2: Completed Tasks */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">Tamamlanan Görev</span>
          </div>
          <div className="text-3xl font-bold">
            {completedTasksCount}
          </div>
        </div>

        {/* Card 3: Efficiency Score (Mock) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">Haftalık Aktivite</span>
          </div>
          <div className="text-3xl font-bold">
            {weeklyData.reduce((acc, d) => acc + (d.minutes > 0 ? 1 : 0), 0)} / 7 Gün
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Son 7 Günlük Odak Süresi
          </h2>
        </div>

        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4">
          {weeklyData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex items-end justify-center h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded mb-2 whitespace-nowrap z-10 pointer-events-none">
                  {data.minutes} dk
                </div>
                
                {/* Bar */}
                <div 
                  className={`
                    w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out
                    ${data.minutes > 0 
                      ? 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-400 dark:hover:bg-blue-500' 
                      : 'bg-gray-100 dark:bg-zinc-800 h-2'
                    }
                  `}
                  style={{ 
                    height: data.minutes > 0 ? `${(data.minutes / maxMinutes) * 100}%` : '8px' 
                  }}
                />
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase">
                {data.day}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
