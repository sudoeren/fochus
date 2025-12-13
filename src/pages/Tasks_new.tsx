import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Circle, Trash2, Pin, GripVertical, Edit3, MoreHorizontal, Layout, CheckSquare } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { TaskListModal } from '../components/TaskListModal';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/utils';

interface TasksNewProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const TasksNew: React.FC<TasksNewProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, loading, deleteTask, toggleTask, pinTask } = useTasks();
  const { taskLists, loading: listsLoading, deleteTaskList, moveTaskToList } = useTaskLists();
  const [showListModal, setShowListModal] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [activeListMenu, setActiveListMenu] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const today = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays === -1) return 'Dün';
    return taskDate.toLocaleDateString('tr-TR');
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      const targetListId = destination.droppableId === 'uncategorized' ? null : destination.droppableId;
      await moveTaskToList(draggableId, targetListId);
    }
  };

  const getTasksByList = (listId: string | null) => {
    return tasks.filter(task => task.listId === listId && !task.isDeleted);
  };

  const uncategorizedTasks = getTasksByList(null);

  if (loading || listsLoading) {
    return (
      <div className="h-full flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-none p-6 lg:p-8 border-b border-zinc-200/50 dark:border-zinc-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1800px] mx-auto w-full">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-1">Görevlerim</h1>
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm">
              <span className="font-semibold text-zinc-900 dark:text-white">{taskLists.length}</span> liste
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="font-semibold text-zinc-900 dark:text-white">{tasks.filter(t => !t.isDeleted).length}</span> görev
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button
              onClick={() => setShowListModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm font-medium"
            >
              <Layout className="w-4 h-4" />
              <span>Liste Ekle</span>
            </button>
            <button
              onClick={onOpenTaskModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 font-medium active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Görev Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full flex px-6 lg:px-8 py-8 gap-6 min-w-max">
            
            {/* Uncategorized List */}
            <div className="flex-shrink-0 w-80 lg:w-96 flex flex-col">
               <div className="flex items-center justify-between mb-4 px-1">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white">Genel</h3>
                 </div>
                 <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold">
                   {uncategorizedTasks.length}
                 </span>
               </div>
               
               <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-3xl p-3 border border-zinc-200/50 dark:border-zinc-800/50">
                <Droppable droppableId="uncategorized">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "h-full overflow-y-auto pr-2 custom-scrollbar transition-colors rounded-2xl",
                        snapshot.isDraggingOver && "bg-zinc-200/50 dark:bg-zinc-800/50"
                      )}
                    >
                      {uncategorizedTasks.map((task, index) => (
                        <TaskCard 
                          key={task.id} 
                          task={task} 
                          index={index} 
                          onEdit={onEditTask}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onPin={pinTask}
                        />
                      ))}
                      {provided.placeholder}
                      {uncategorizedTasks.length === 0 && (
                        <div className="h-32 flex flex-col items-center justify-center text-zinc-400">
                           <p className="text-sm">Görev yok</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
               </div>
            </div>

            {/* Custom Lists */}
            {taskLists.map((list) => {
              const listTasks = getTasksByList(list.id);
              return (
                <div key={list.id} className="flex-shrink-0 w-80 lg:w-96 flex flex-col">
                  {/* List Header */}
                   <div className="flex items-center justify-between mb-4 px-1">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: list.color }} />
                        <h3 className="font-bold text-zinc-900 dark:text-white truncate max-w-[160px]">
                          {list.title}
                        </h3>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-bold">
                          {listTasks.length}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveListMenu(activeListMenu === list.id ? null : list.id)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {activeListMenu === list.id && (
                             <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveListMenu(null)} />
                              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95">
                                <button
                                  onClick={() => {
                                    setEditingList(list);
                                    setShowListModal(true);
                                    setActiveListMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                                >
                                  <Edit3 className="w-4 h-4" /> Düzenle
                                </button>
                                <button
                                  onClick={() => {
                                    if(confirm('Listeyi silmek istediğinize emin misiniz?')) deleteTaskList(list.id);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" /> Sil
                                </button>
                              </div>
                             </>
                          )}
                        </div>
                     </div>
                   </div>

                   {/* List Body */}
                   <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-3xl p-3 border border-zinc-200/50 dark:border-zinc-800/50">
                    <Droppable droppableId={list.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            "h-full overflow-y-auto pr-2 custom-scrollbar transition-colors rounded-2xl",
                            snapshot.isDraggingOver && "bg-zinc-200/50 dark:bg-zinc-800/50"
                          )}
                        >
                          {listTasks.map((task, index) => (
                            <TaskCard 
                              key={task.id} 
                              task={task} 
                              index={index} 
                              onEdit={onEditTask}
                              onToggle={toggleTask}
                              onDelete={deleteTask}
                              onPin={pinTask}
                            />
                          ))}
                          {provided.placeholder}
                          {listTasks.length === 0 && (
                            <div className="h-32 flex flex-col items-center justify-center text-zinc-400">
                               <p className="text-sm opacity-50">Görev sürükleyin</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                   </div>
                </div>
              );
            })}

            {/* Add List Button */}
            <div className="flex-shrink-0 w-80 lg:w-96 flex flex-col pt-12">
               <button
                  onClick={() => setShowListModal(true)}
                  className="h-full max-h-[500px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all group"
               >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="font-semibold">Yeni Liste Ekle</span>
               </button>
            </div>
            
          </div>
        </DragDropContext>
      </div>

      <TaskListModal
        isOpen={showListModal}
        onClose={() => {
          setShowListModal(false);
          setEditingList(null);
        }}
        editingList={editingList}
      />
    </div>
  );
};

// Extracted Task Card Component for cleaner code
const TaskCard = ({ task, index, onEdit, onToggle, onDelete, onPin }: any) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group relative mb-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-200",
            snapshot.isDragging ? "shadow-2xl ring-2 ring-indigo-500 rotate-2 z-50 cursor-grabbing" : "hover:border-indigo-300 dark:hover:border-zinc-600 hover:shadow-lg hover:shadow-indigo-500/5 cursor-grab",
            task.isCompleted && "opacity-60 bg-zinc-50 dark:bg-zinc-900/50"
          )}
        >
          <div className="flex items-start gap-3">
             <button
              onClick={() => onToggle(task.id)}
              className="mt-1 flex-shrink-0"
             >
               {task.isCompleted ? (
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               ) : (
                 <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 transition-colors" />
               )}
             </button>

             <div className="flex-1 min-w-0">
               <div className="flex items-start justify-between gap-2">
                 <h4 className={cn(
                   "text-sm font-semibold leading-relaxed",
                   task.isCompleted ? "line-through text-zinc-500" : "text-zinc-900 dark:text-zinc-100"
                 )}>
                   {task.title}
                 </h4>
                 {task.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 fill-current" />}
               </div>
               
               {task.description && (
                 <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{task.description}</p>
               )}

               <div className="flex items-center justify-between mt-3">
                  {task.dueDate ? (
                    <div className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md bg-zinc-50 dark:bg-zinc-800",
                      new Date(task.dueDate) < new Date() && !task.isCompleted ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-zinc-500"
                    )}>
                      <Calendar className="w-3 h-3" />
                      {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                    </div>
                  ) : <div />}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(task)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-indigo-500 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onPin(task.id, !task.isPinned)} className={cn("p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors", task.isPinned ? "text-amber-500" : "text-zinc-400 hover:text-amber-500")}>
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
