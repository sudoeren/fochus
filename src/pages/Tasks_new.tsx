import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit2, 
  Filter, 
  AlertCircle, 
  CheckSquare 
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../lib/utils';

interface TasksNewProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const TasksNew: React.FC<TasksNewProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, toggleTask, deleteTask, loading } = useTasks();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Görevleri Gruplama ve Filtreleme Mantığı
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered = tasks.filter(t => !t.isDeleted);

    if (filter === 'pending') filtered = filtered.filter(t => !t.isCompleted);
    if (filter === 'completed') filtered = filtered.filter(t => t.isCompleted);

    const groups = {
      overdue: [] as typeof tasks,
      today: [] as typeof tasks,
      upcoming: [] as typeof tasks,
      noDate: [] as typeof tasks,
      completed: [] as typeof tasks
    };

    filtered.forEach(task => {
      if (task.isCompleted) {
        groups.completed.push(task);
        return;
      }

      if (!task.dueDate) {
        groups.noDate.push(task);
        return;
      }

      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);

      if (taskDate < today) {
        groups.overdue.push(task);
      } else if (taskDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
  }, [tasks, filter]);

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Tekil Görev Bileşeni
  const TaskItem = ({ task, isOverdue = false }: { task: any, isOverdue?: boolean }) => (
    <div className={cn(
      "group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 backdrop-blur-sm",
      "bg-white/60 dark:bg-zinc-900/60 border-white/20 dark:border-white/5",
      "hover:bg-white/80 dark:hover:bg-zinc-900/80 hover:shadow-lg hover:scale-[1.005]",
      task.isCompleted && "opacity-60 grayscale-[0.5]"
    )}>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
        className="mt-1 flex-shrink-0 text-zinc-400 hover:text-emerald-500 transition-colors"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
        ) : (
          <Circle className="w-6 h-6 hover:fill-emerald-500/10" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn(
            "text-base font-semibold leading-relaxed transition-all",
            task.isCompleted ? "text-zinc-500 line-through decoration-zinc-400" : "text-zinc-900 dark:text-zinc-100",
            isOverdue && !task.isCompleted && "text-red-600 dark:text-red-400"
          )}>
            {task.title}
          </h3>
        </div>
        
        {task.description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 font-medium">
            {task.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg",
              isOverdue && !task.isCompleted
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-zinc-100/80 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300"
            )}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
              {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              {task.dueDate.includes('T') && (
                <span className="flex items-center gap-1 ml-1 opacity-75 border-l border-current pl-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aksiyon Butonları (Hover ile görünür) */}
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={() => onEditTask(task)}
          className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
          title="Düzenle"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { if(window.confirm('Bu görevi silmek istediğinize emin misiniz?')) deleteTask(task.id); }}
          className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          title="Sil"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header Alanı */}
      <div className="flex-none p-8 lg:p-10 pb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Görevlerim</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Bugün yapman gereken <span className="text-zinc-900 dark:text-white font-bold">{groupedTasks.today.length}</span>, 
              toplam <span className="text-zinc-900 dark:text-white font-bold">{tasks.filter(t => !t.isCompleted && !t.isDeleted).length}</span> aktif görevin var.
            </p>
          </div>
          
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Yeni Görev
          </button>
        </div>

        {/* Filtreler */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <div className="p-1 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1 backdrop-blur-sm">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                  filter === f 
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {f === 'all' && 'Tümü'}
                {f === 'pending' && 'Bekleyenler'}
                {f === 'completed' && 'Tamamlananlar'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Görev Listesi */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 pt-4">
        <div className="max-w-4xl space-y-10 pb-20">
          
          {/* Boş Durum */}
          {tasks.filter(t => !t.isDeleted).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
                <CheckSquare className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Henüz görev yok</h3>
              <p className="text-zinc-500 dark:text-zinc-500">Yeni bir görev ekleyerek güne başla.</p>
            </div>
          )}

          {/* Gecikmiş Görevler */}
          {groupedTasks.overdue.length > 0 && filter !== 'completed' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider pl-1">
                <AlertCircle className="w-4 h-4" />
                Gecikenler
              </div>
              <div className="space-y-3">
                {groupedTasks.overdue.map(task => <TaskItem key={task.id} task={task} isOverdue={true} />)}
              </div>
            </section>
          )}

          {/* Bugünün Görevleri */}
          {groupedTasks.today.length > 0 && filter !== 'completed' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                <Calendar className="w-4 h-4" />
                Bugün
              </div>
              <div className="space-y-3">
                {groupedTasks.today.map(task => <TaskItem key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {/* Yaklaşan Görevler */}
          {groupedTasks.upcoming.length > 0 && filter !== 'completed' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                <Clock className="w-4 h-4" />
                Yaklaşan
              </div>
              <div className="space-y-3">
                {groupedTasks.upcoming.map(task => <TaskItem key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {/* Tarihsiz Görevler */}
          {groupedTasks.noDate.length > 0 && filter !== 'completed' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                <Filter className="w-4 h-4" />
                Zamanlanmamış
              </div>
              <div className="space-y-3">
                {groupedTasks.noDate.map(task => <TaskItem key={task.id} task={task} />)}
              </div>
            </section>
          )}

          {/* Tamamlananlar */}
          {groupedTasks.completed.length > 0 && filter !== 'pending' && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <CheckCircle2 className="w-4 h-4" />
                Tamamlananlar
              </div>
              <div className="space-y-3">
                {groupedTasks.completed.map(task => <TaskItem key={task.id} task={task} />)}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
