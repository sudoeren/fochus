import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Check,
  Plus, 
  Clock, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Save,
  PenLine,
  Target
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onEditTask?: (task: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenTaskModal, 
  onEditTask 
}) => {
  const { tasks, addTask, toggleTask, deleteTask, loading: tasksLoading } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [scratchpad, setScratchpad] = useState(() => localStorage.getItem('dashboard_scratchpad') || '');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Scratchpad auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('dashboard_scratchpad', scratchpad);
      setIsSavingNote(false);
    }, 1000);
    
    if (scratchpad !== localStorage.getItem('dashboard_scratchpad')) {
      setIsSavingNote(true);
    }

    return () => clearTimeout(timer);
  }, [scratchpad]);

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    return { days, firstDay: adjustedFirstDay };
  };

  const { days: daysInMonth, firstDay: startDay } = getDaysInMonth(selectedDate);
  
  const handlePrevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  const handleDateClick = (day: number) => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));

  // Filter Tasks
  const selectedDateTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const tDate = new Date(task.dueDate);
    return tDate.getDate() === selectedDate.getDate() &&
           tDate.getMonth() === selectedDate.getMonth() &&
           tDate.getFullYear() === selectedDate.getFullYear() &&
           !task.isDeleted;
  }).sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));

  // Inline Task Add
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const dueDate = new Date(selectedDate);
      dueDate.setHours(23, 59, 59, 999);
      await addTask({ title: newTaskTitle, dueDate: dueDate });
      setNewTaskTitle('');
    } catch (error) {
      console.error("Task creation failed", error);
    }
  };

  const focusTask = selectedDateTasks.find(t => !t.isCompleted);
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const isSelected = (day: number) => day === selectedDate.getDate();

  // Greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'Tünaydın';
    return 'İyi Akşamlar';
  };

  if (tasksLoading) {
    return <div className="flex items-center justify-center min-h-screen text-zinc-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-6 lg:p-10 min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      
      {/* Top Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {getGreeting()}.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            Bugün <span className="text-zinc-900 dark:text-white">{selectedDateTasks.filter(t => !t.isCompleted).length} görev</span> seni bekliyor.
          </p>
        </div>
        <button 
          onClick={() => setSelectedDate(new Date())}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full text-xs font-medium transition-colors"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Bugüne Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* 1. Calendar Widget */}
          <div className="group">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="font-bold text-lg">{selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-4">
              <div>Pt</div><div>Sa</div><div>Ça</div><div>Pe</div><div>Cu</div><div>Ct</div><div>Pa</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                const isDayToday = isToday(date);
                const isDaySelected = isSelected(day);
                const hasTasks = tasks.some(t => !t.isDeleted && t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString());

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative h-10 w-10 rounded-full flex flex-col items-center justify-center transition-all text-sm font-medium
                      ${isDaySelected 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg scale-110' 
                        : isDayToday 
                          ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }
                    `}
                  >
                    {day}
                    {hasTasks && !isDaySelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Focus Card */}
          {focusTask ? (
            <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900 text-white p-6 shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Öncelikli Odak
                </div>
                <h3 className="text-xl font-bold leading-snug mb-2 line-clamp-3">
                  {focusTask.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                  {focusTask.description || 'Bu görevi tamamlayarak günün en önemli adımını at.'}
                </p>
                <button 
                  onClick={() => toggleTask(focusTask.id)}
                  className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Tamamla
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center">
              <Target className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">Bugün için odaklanacak<br/>görev kalmadı.</p>
            </div>
          )}

          {/* 3. Scratchpad (Quick Memo) */}
          <div className="group rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-1 transition-colors focus-within:border-zinc-400 dark:focus-within:border-zinc-700">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <PenLine className="w-3 h-3" />
                Hızlı Not
              </div>
              {isSavingNote && <Save className="w-3 h-3 text-zinc-400 animate-pulse" />}
            </div>
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Aklındakileri buraya dök..."
              className="w-full h-40 bg-transparent resize-none p-4 text-sm font-mono text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none"
              spellCheck={false}
            />
          </div>

        </div>

        {/* CENTER/RIGHT COLUMN: Task List (8 Cols) */}
        <div className="lg:col-span-8">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-bold flex items-center gap-3">
              Ajanda
              <span className="text-sm font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
              </span>
            </h2>
          </div>

          {/* Quick Add Input */}
          <form onSubmit={handleQuickAdd} className="mb-8 relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400">
              <Plus className="w-5 h-5 transition-transform group-focus-within:rotate-90" />
            </div>
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Yeni bir görev ekle..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white pl-14 pr-4 py-5 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all text-base"
            />
          </form>

          {/* Tasks List */}
          <div className="space-y-3">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`
                    group relative flex items-center gap-4 p-5 rounded-2xl transition-all duration-200
                    ${task.isCompleted 
                      ? 'bg-zinc-50 dark:bg-zinc-900/30 opacity-60' 
                      : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
                    }
                  `}
                >
                  {/* Custom Checkbox */}
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`
                      flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                      ${task.isCompleted 
                        ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white' 
                        : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                      }
                    `}
                  >
                    {task.isCompleted && <Check className="w-3.5 h-3.5 text-white dark:text-black stroke-[3]" />}
                  </button>
                  
                  {/* Task Content */}
                  <div className="flex-1 min-w-0 cursor-pointer py-1" onClick={() => onEditTask?.(task)}>
                    <h3 className={`text-base font-medium transition-all ${
                      task.isCompleted 
                        ? 'text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-700' 
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-zinc-500 mt-1 truncate max-w-[90%]">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Task Meta & Actions */}
                  <div className="flex items-center gap-4">
                    {task.dueDate && (
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(task.dueDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Plan Yok</h3>
                <p className="text-zinc-500 mt-1 max-w-xs mx-auto">
                  Bugün için henüz bir görev eklemedin. Yukarıdan hızlıca başlayabilirsin.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};