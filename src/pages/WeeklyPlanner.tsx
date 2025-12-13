import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckSquare, Clock } from 'lucide-react';
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
            Haftalık Planlayıcı
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Görevlerinizi haftalık olarak planlayın ve takip edin
          </p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-1 text-sm font-semibold text-gray-900 dark:text-white min-w-[160px] text-center border-x border-gray-100 dark:border-zinc-800 mx-1">
            {weekStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-600 dark:text-zinc-400 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="ml-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Bu Hafta
          </button>
        </div>
      </div>

      {/* Haftalık Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div key={day.toISOString()} className="flex flex-col h-full min-h-[300px]">
              {/* Gün Başlığı */}
              <div className={`
                p-3 rounded-t-xl border-x border-t border-gray-200 dark:border-zinc-800
                ${isCurrentDay 
                  ? 'bg-blue-600 text-white dark:border-blue-600' 
                  : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100'
                }
              `}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-100' : 'text-gray-500 dark:text-zinc-500'}`}>
                    {dayNames[index].slice(0, 3)}
                  </span>
                  <span className={`text-lg font-bold ${isCurrentDay ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {day.getDate()}
                  </span>
                </div>
              </div>

              {/* Görev Alanı */}
              <div className={`
                flex-1 p-3 border-x border-b border-gray-200 dark:border-zinc-800 rounded-b-xl
                space-y-2 bg-gray-50/50 dark:bg-black/50
                ${isCurrentDay ? 'border-blue-200 dark:border-blue-900/30' : ''}
              `}>
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${task.isCompleted
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 opacity-75'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 shadow-sm'
                      }
                    `}
                  >
                    <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${
                      task.isCompleted 
                        ? 'text-green-800 dark:text-green-400 line-through' 
                        : 'text-gray-900 dark:text-zinc-200'
                    }`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span>
                          {task.dueDate ? new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Boş Durum / Ekle Butonu */}
                <button className="w-full py-3 px-2 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg text-gray-400 dark:text-zinc-600 hover:border-blue-400 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 group">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium">Ekle</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Haftalık Özet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Toplam Görev</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Tamamlanan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyTasks.filter(task => task.isCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Bekleyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyTasks.filter(task => !task.isCompleted).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};