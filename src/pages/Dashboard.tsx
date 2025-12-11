import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  Maximize2,
  Columns,
  StickyNote,
  Inbox,
  Layout,
  ChevronRight
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { usePomodoro } from '../hooks/usePomodoro';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onEditTask?: (task: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenTaskModal, 
  onOpenNoteModal,
  onEditTask 
}) => {
  const { tasks, toggleTask } = useTasks();
  const { notes } = useNotes();
  const pomodoro = usePomodoro();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [scratchpad, setScratchpad] = useState(() => localStorage.getItem('dashboard_scratchpad') || '');

  // Auto-save scratchpad
  useEffect(() => {
    localStorage.setItem('dashboard_scratchpad', scratchpad);
  }, [scratchpad]);

  // Data
  const today = new Date();
  const todayTasks = tasks.filter(t => 
    !t.isDeleted && t.dueDate && 
    new Date(t.dueDate).toDateString() === today.toDateString()
  ).sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || todayTasks[0];
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 overflow-hidden">
      
      {/* 1. TOP HUD (Head-Up Display) - Ultra Slim */}
      <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layout className="w-4 h-4 text-zinc-400" />
            <span>Kokpit</span>
          </div>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            {today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Compact Pomodoro */}
          <div className={`flex items-center gap-2 px-2 py-1 rounded border text-xs font-mono transition-colors ${
            pomodoro.isActive 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400' 
              : 'bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
          }`}>
            <span className="w-12 text-center">{pomodoro.formatTime(pomodoro.timeLeft)}</span>
            <button onClick={pomodoro.toggleTimer} className="hover:text-black dark:hover:text-white">
              {pomodoro.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button onClick={pomodoro.resetTimer} className="hover:text-black dark:hover:text-white">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
          
          <button 
            onClick={onOpenTaskModal}
            className="w-6 h-6 flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN SPLIT VIEW */}
      <div className="flex-1 flex min-h-0">
        
        {/* LEFT PANEL: Task List (Master) */}
        <div className="w-[400px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">Görevler</span>
            <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
              {todayTasks.filter(t => !t.isCompleted).length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <div 
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`
                    group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border
                    ${selectedTaskId === task.id || (!selectedTaskId && task === todayTasks[0])
                      ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm' 
                      : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }
                  `}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                      task.isCompleted ? 'bg-zinc-400 border-zinc-400' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {task.isCompleted && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-tight ${task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {task.dueDate && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          {new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-xs text-zinc-400">Görev bulunamadı.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Active Context (Detail) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0c0c0e]">
          {selectedTask ? (
            <div className="flex-1 p-8 flex flex-col max-w-3xl mx-auto w-full">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded uppercase tracking-wide">
                      Aktif Görev
                    </span>
                    {selectedTask.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {new Date(selectedTask.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <h2 className={`text-3xl font-bold leading-tight ${selectedTask.isCompleted ? 'text-zinc-400 line-through decoration-2' : 'text-zinc-900 dark:text-white'}`}>
                    {selectedTask.title}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleTask(selectedTask.id)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" title="Tamamla">
                    {selectedTask.isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-zinc-300" />}
                  </button>
                  <button onClick={() => onEditTask?.(selectedTask)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600">
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
                    {selectedTask.description || 'Bu görev için açıklama girilmemiş.'}
                  </p>
                </div>

                <div className="pt-8 mt-8 border-t border-zinc-100 dark:border-zinc-800">
                   <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                    <StickyNote className="w-3.5 h-3.5" />
                    Hızlı Not (Bu görevle ilgili)
                  </div>
                  <textarea
                    value={scratchpad}
                    onChange={(e) => setScratchpad(e.target.value)}
                    placeholder="Fikirlerini buraya al..."
                    className="w-full h-48 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-indigo-500/20 outline-none resize-none text-sm transition-all"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400">
              <div className="text-center">
                <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Bir görev seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM SHELF (Widgets) */}
      <div className="h-48 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#121214] p-4 flex gap-4 overflow-x-auto">
        
        {/* Next Up */}
        <div className="min-w-[200px] w-[20%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-xs font-bold text-zinc-400 uppercase mb-2">Sıradaki</h3>
          <div className="flex-1">
             {todayTasks.filter(t => !t.isCompleted).slice(1, 3).map(t => (
               <div key={t.id} className="py-1 text-sm truncate text-zinc-600 dark:text-zinc-400">• {t.title}</div>
             ))}
             {todayTasks.filter(t => !t.isCompleted).length <= 1 && <span className="text-xs text-zinc-300 italic">Başka görev yok</span>}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="min-w-[200px] w-[30%] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase">Son Notlar</h3>
            <button onClick={onOpenNoteModal} className="hover:bg-zinc-100 rounded p-1"><Plus className="w-3 h-3 text-zinc-400"/></button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentNotes.map(note => (
              <div key={note.id} onClick={onOpenNoteModal} className="flex-shrink-0 w-32 p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-100 dark:border-zinc-700 cursor-pointer hover:border-zinc-300 transition-colors">
                <div className="font-medium text-xs truncate mb-1">{note.title}</div>
                <div className="text-[10px] text-zinc-400 line-clamp-2">{note.content.replace(/<[^>]*>/g, '')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Graph Placeholder */}
        <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-50 to-transparent dark:via-zinc-800 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <div className="text-center z-10">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">%{Math.round((todayTasks.filter(t => t.isCompleted).length / (todayTasks.length || 1)) * 100)}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Günlük Başarım</div>
          </div>
        </div>

      </div>
    </div>
  );
};