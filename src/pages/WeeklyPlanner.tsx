import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export const WeeklyPlanner: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { tasks } = useTasks();

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  // Günlük görevleri gruplama
  const getTasksForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Haftalık istatistikler
  const weeklyTasks = weekDays.flatMap(day => getTasksForDay(day));

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Haftalık Planlayıcı
        </h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-base sm:text-lg font-medium text-gray-900 dark:text-white min-w-[180px] sm:min-w-[200px] text-center">
              {weekStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm"
          >
            Bu Hafta
          </button>
        </div>
      </div>

      {/* Haftalık Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div key={day.toISOString()} className="space-y-2">
              {/* Gün Başlığı */}
              <div className={`text-center p-3 rounded-lg ${
                isCurrentDay 
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
                  : 'bg-gray-50 dark:bg-gray-800'
              }`}>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {dayNames[index]}
                </div>
                <div className={`text-lg font-bold ${
                  isCurrentDay 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Görevler */}
              <div className="space-y-2 min-h-[200px]">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`card p-3 cursor-pointer hover:shadow-md transition-shadow ${
                      task.isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {task.dueDate ? new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                        <h3 className={`text-sm font-medium ${
                          task.isCompleted 
                            ? 'line-through text-gray-500 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Görev Ekleme Butonu */}
                <button className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors group">
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Görev Ekle</span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Haftalık Özet */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Haftalık Özet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {weeklyTasks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Toplam Görev
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {weeklyTasks.filter(task => task.isCompleted).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tamamlanan
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {weeklyTasks.filter(task => !task.isCompleted).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Bekleyen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
