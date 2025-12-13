import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Pin, GripVertical, Edit3, List, MoreVertical, Search, Grid3X3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { TaskListModal } from '../components/TaskListModal';

interface TasksNewProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const TasksWithLists: React.FC<TasksNewProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, loading, deleteTask, toggleTask, pinTask } = useTasks();
  const { taskLists, loading: listsLoading, deleteTaskList, moveTaskToList } = useTaskLists();
  const [showListModal, setShowListModal] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [activeListMenu, setActiveListMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');


  const formatDate = (date: Date) => {
    const today = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays === -1) return 'Dün';
    if (diffDays < -1) return `${Math.abs(diffDays)} gün önce`;
    if (diffDays > 1) return `${diffDays} gün sonra`;

    return taskDate.toLocaleDateString('tr-TR');
  };

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
  };

  const handlePinTask = async (id: string, currentPinned: boolean) => {
    await pinTask(id, !currentPinned);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask(id);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (confirm('Bu listeyi silmek istediğinizden emin misiniz? İçindeki görevler "Kategorisiz" bölümüne taşınacak.')) {
      await deleteTaskList(listId);
      setActiveListMenu(null);
    }
  };

  const handleEditList = (list: any) => {
    setEditingList(list);
    setShowListModal(true);
    setActiveListMenu(null);
  };

  const closeListModal = () => {
    setShowListModal(false);
    setEditingList(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If moving between lists
    if (source.droppableId !== destination.droppableId) {
      const targetListId = destination.droppableId === 'uncategorized' ? null : destination.droppableId;
      await moveTaskToList(draggableId, targetListId);
    }
  };



  const getTasksByList = (listId: string | null) => {
    return tasks.filter(task => {
      // Handle Uncategorized (null listId) vs Specific List
      const isListMatch = listId
        ? (task as any).listId === listId
        : !(task as any).listId; // Check for null or undefined

      const matchesList = isListMatch && !task.isDeleted;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeTab === 'completed' ? task.isCompleted : !task.isCompleted;

      return matchesList && matchesSearch && matchesStatus;
    });
  };

  const uncategorizedTasks = getTasksByList(null);

  if (loading || listsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Section (Tasks_new Style) */}
      <div className="flex-none p-8 lg:p-10 pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Görevlerim</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Projelerini ve işlerini listeler halinde yönet.</p>
            </div>

            {/* View Toggle & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'active'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <Circle className="w-4 h-4" />
                  <span>Mevcut</span>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'completed'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Tamamlanan</span>
                </button>
              </div>

              <button
                onClick={() => setShowListModal(true)}
                className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Liste Ekle</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Görevlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900/50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 lg:px-10 pb-8">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-8">

            {/* Uncategorized List */}
            <div className="flex-shrink-0 w-[340px] flex flex-col h-full rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="p-5 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-zinc-400"></div>
                  <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Kategorisiz</h3>
                  <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md text-xs font-bold">
                    {uncategorizedTasks.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId="uncategorized">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar transition-colors rounded-b-3xl ${snapshot.isDraggingOver ? 'bg-zinc-100/50 dark:bg-zinc-800/50' : ''
                      }`}
                  >
                    {uncategorizedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group relative mb-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 hover:shadow-lg transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 z-50' : 'hover:-translate-y-0.5'
                              } ${task.isCompleted ? 'opacity-60 grayscale' : ''}`}
                          >
                            {/* Drag Handle (Hidden but active area usually, or visible on hover) */}
                            <div {...provided.dragHandleProps} className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <div className="flex items-start gap-4">
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className={`mt-0.5 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-zinc-300 hover:text-emerald-500'}`}
                              >
                                {task.isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6 stroke-[1.5]" />}
                              </button>

                              <div className="flex-1 min-w-0 pr-6">
                                <h4 className={`text-base font-semibold leading-tight ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                  {task.title}
                                </h4>

                                {task.description && (
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${new Date(task.dueDate) < new Date() && !task.isCompleted
                                      ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                      }`}>
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(new Date(task.dueDate))}</span>
                                    </div>
                                  )}

                                  {task.isPinned && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                      <Pin className="w-3 h-3 fill-current" />
                                    </div>
                                  )}
                                </div>

                                {/* Quick Actions Row */}
                                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => onEditTask(task)} className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Düzenle">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handlePinTask(task.id, task.isPinned || false)} className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? 'text-amber-500 bg-amber-50' : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50'}`} title="Sabitle">
                                    <Pin className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto" title="Sil">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {uncategorizedTasks.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-400/50">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-2">
                          <Circle className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium">Boş liste</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Dynamic Lists */}
            {taskLists.map((list) => {
              const listTasks = getTasksByList(list.id);
              return (
                <div key={list.id} className="flex-shrink-0 w-[340px] flex flex-col h-full rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 group/list">
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: list.color }}></div>
                      <h3 className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">{list.title}</h3>
                      <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md text-xs font-bold">
                        {listTasks.length}
                      </span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setActiveListMenu(activeListMenu === list.id ? null : list.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeListMenu === list.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl shadow-xl z-50 py-1.5 w-36 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button onClick={() => handleEditList(list)} className="w-full text-left px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                            Listeyi Düzenle
                          </button>
                          <button onClick={() => handleDeleteList(list.id)} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            Listeyi Sil
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar transition-colors rounded-b-3xl ${snapshot.isDraggingOver ? 'bg-zinc-100/50 dark:bg-zinc-800/50' : ''
                          }`}
                      >
                        {listTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group relative mb-3 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-200/50 dark:border-zinc-800 hover:shadow-lg transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105 z-50' : 'hover:-translate-y-0.5'
                                  } ${task.isCompleted ? 'opacity-60 grayscale' : ''}`}
                              >
                                <div {...provided.dragHandleProps} className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100">
                                  <GripVertical className="w-4 h-4" />
                                </div>

                                <div className="flex items-start gap-4">
                                  <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`mt-0.5 flex-shrink-0 transition-colors ${task.isCompleted ? 'text-emerald-500' : 'text-zinc-300 hover:text-emerald-500'}`}
                                  >
                                    {task.isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6 stroke-[1.5]" />}
                                  </button>

                                  <div className="flex-1 min-w-0 pr-6">
                                    <h4 className={`text-base font-semibold leading-tight ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                      {task.title}
                                    </h4>

                                    {task.description && (
                                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}

                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                      {task.dueDate && (
                                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${new Date(task.dueDate) < new Date() && !task.isCompleted
                                          ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                          }`}>
                                          <Calendar className="w-3 h-3" />
                                          <span>{formatDate(new Date(task.dueDate))}</span>
                                        </div>
                                      )}

                                      {task.isPinned && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                          <Pin className="w-3 h-3 fill-current" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Quick Actions Row */}
                                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => onEditTask(task)} className="p-1.5 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors" title="Düzenle">
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handlePinTask(task.id, task.isPinned || false)} className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? 'text-amber-500 bg-amber-50' : 'text-zinc-400 hover:text-amber-500 hover:bg-amber-50'}`} title="Sabitle">
                                        <Pin className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto" title="Sil">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {listTasks.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-8 text-zinc-400/50">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-2">
                              <Circle className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-medium">Bu listede görev yok</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}

            {/* Add New List Button Column */}
            <div className="flex-shrink-0 w-80">
              <button
                onClick={() => setShowListModal(true)}
                className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-400 gap-2 group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Yeni Liste Ekle</span>
              </button>
            </div>

            {/* Spacer for right padding */}
            <div className="w-2" />
          </div>
        </DragDropContext>
      </div>

      {/* Floating Add Task Button */}
      <button
        onClick={onOpenTaskModal}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 pl-4 pr-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <div className="bg-white/20 dark:bg-black/10 p-1 rounded-full">
          <Plus className="w-5 h-5" />
        </div>
        Yeni Görev
      </button>

      <TaskListModal
        isOpen={showListModal}
        onClose={closeListModal}
        editingList={editingList}
      />
    </div>
  );
};
