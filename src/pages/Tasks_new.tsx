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
  Layers,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../lib/utils';

interface TasksNewProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const TasksNew: React.FC<TasksNewProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, toggleTask, deleteTask, loading } = useTasks();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Görevleri Gruplama
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sadece aktif (tamamlanmamış) ve silinmemiş görevler
    const activeTasks = tasks.filter(t => !t.isDeleted && !t.isCompleted);
    
    // Sadece tamamlanmış ve silinmemiş görevler
    const completedTasksList = tasks.filter(t => !t.isDeleted && t.isCompleted);

    // Aktif görevleri grupla
    const groups = {
      overdue: [] as typeof tasks,
      today: [] as typeof tasks,
      upcoming: [] as typeof tasks,
      noDate: [] as typeof tasks,
    };

    activeTasks.forEach(task => {
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

    return { groups, completedTasksList };
  }, [tasks]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TaskItem = ({ task, isOverdue = false }: { task: any, isOverdue?: boolean }) => (
    <div className={cn(
      "group flex items-center gap-4 p-4 mb-3 rounded-2xl border transition-all duration-200",
      "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-100 dark:border-zinc-800",
      "hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700",
      task.isCompleted && "opacity-50 grayscale"
    )}>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
        className="flex-shrink-0 text-zinc-400 hover:text-emerald-500 transition-colors"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
        ) : (
          <Circle className="w-6 h-6 stroke-[1.5]" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "text-base font-medium truncate",
          task.isCompleted ? "text-zinc-500 line-through" : "text-zinc-900 dark:text-zinc-100",
          isOverdue && !task.isCompleted && "text-red-600 dark:text-red-400"
        )}>
          {task.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-1">
          {task.description && (
            <span className="text-xs text-zinc-500 truncate max-w-[200px] block">
              {task.description}
            </span>
          )}
          
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto",
              isOverdue && !task.isCompleted
                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            )}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEditTask(task)}
          className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { if(window.confirm('Görevi silmek istiyor musunuz?')) deleteTask(task.id); }}
          className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex-none p-8 lg:p-10 pb-4">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Görevler</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">İşlerini planla ve takip et.</p>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl w-fit backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                activeTab === 'active' 
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              Yapılacaklar
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300",
                activeTab === 'completed' 
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              Tamamlananlar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 pt-2 pb-24">
        <div className="max-w-3xl">
          
          {/* Active Tasks View */}
          {activeTab === 'active' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Overdue */}
              {groupedTasks.groups.overdue.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 px-1 text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    Gecikenler
                  </div>
                  {groupedTasks.groups.overdue.map(task => <TaskItem key={task.id} task={task} isOverdue={true} />)}
                </section>
              )}

              {/* Today */}
              {groupedTasks.groups.today.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 px-1 text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    Bugün
                  </div>
                  {groupedTasks.groups.today.map(task => <TaskItem key={task.id} task={task} />)}
                </section>
              )}

              {/* Upcoming */}
              {groupedTasks.groups.upcoming.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 px-1 text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    Yaklaşan
                  </div>
                  {groupedTasks.groups.upcoming.map(task => <TaskItem key={task.id} task={task} />)}
                </section>
              )}

              {/* No Date */}
              {groupedTasks.groups.noDate.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 px-1 text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    Zamanlanmamış
                  </div>
                  {groupedTasks.groups.noDate.map(task => <TaskItem key={task.id} task={task} />)}
                </section>
              )}

              {/* Empty State for Active */}
              {Object.values(groupedTasks.groups).every(g => g.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <div className="w-16 h-16 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-center mb-4 shadow-sm">
                    <CheckSquare className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-medium">Yapılacak görev kalmadı!</p>
                </div>
              )}
            </div>
          )}

          {/* Completed Tasks View */}
          {activeTab === 'completed' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 px-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Tamamlanan Görevler
              </div>
              
              {groupedTasks.completedTasksList.length > 0 ? (
                groupedTasks.completedTasksList.map(task => <TaskItem key={task.id} task={task} />)
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <p className="font-medium">Henüz tamamlanan görev yok.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={onOpenTaskModal}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 pl-4 pr-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <div className="bg-white/20 dark:bg-black/10 p-1 rounded-full">
          <Plus className="w-5 h-5" />
        </div>
        Yeni Görev
      </button>
    </div>
  );
};