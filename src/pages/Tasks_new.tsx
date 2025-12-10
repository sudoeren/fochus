import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Pin, GripVertical, Edit3, List, MoreVertical, CheckSquare } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { TaskListModal } from '../components/TaskListModal';
import { EmptyState } from '../components/EmptyState';

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
    return tasks.filter(task => task.listId === listId && !task.isDeleted);
  };

  const uncategorizedTasks = getTasksByList(null);

  if (loading || listsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full overflow-x-auto min-h-screen bg-gray-50 dark:bg-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Görevlerim</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-1 flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{taskLists.length}</span> liste
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-700"></span>
            <span className="font-medium text-gray-900 dark:text-white">{tasks.filter(t => !t.isDeleted).length}</span> görev
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowListModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm font-medium"
          >
            <List className="w-4 h-4" />
            <span>Liste Ekle</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Görev Ekle</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Uncategorized Tasks */}
          <div className="flex-shrink-0 w-80 sm:w-96">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 h-fit flex flex-col max-h-[calc(100vh-12rem)]">
              <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Kategorisiz</h3>
                  </div>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-1 rounded-md">
                    {uncategorizedTasks.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId="uncategorized">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 overflow-y-auto flex-1 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-zinc-800/50' : ''
                    }`}
                  >
                    {uncategorizedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group mb-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all ${
                              snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/20 rotate-2 z-50' : ''
                            } ${
                              task.isCompleted ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className="mt-0.5 flex-shrink-0 transition-all hover:scale-110"
                              >
                                {task.isCompleted ? (
                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-green-500 transition-colors"></div>
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium ${
                                  task.isCompleted 
                                    ? 'line-through text-gray-500 dark:text-zinc-500' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.isPinned && (
                                    <Pin className="w-3.5 h-3.5 text-amber-500 inline mr-1.5 fill-current" />
                                  )}
                                  {task.title}
                                </h4>
                                
                                {task.description && (
                                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between mt-3">
                                  {task.dueDate ? (
                                    <div className={`flex items-center gap-1.5 text-xs ${
                                      task.isCompleted 
                                        ? 'text-gray-400 dark:text-zinc-600'
                                        : new Date(task.dueDate) < new Date()
                                          ? 'text-red-500 dark:text-red-400'
                                          : 'text-gray-500 dark:text-zinc-500'
                                    }`}>
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(new Date(task.dueDate))}</span>
                                    </div>
                                  ) : <div></div>}
                                  
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
                                        task.isPinned ? 'text-amber-500' : 'text-gray-400 dark:text-zinc-500 hover:text-amber-500'
                                      }`}
                                      title={task.isPinned ? "Sabitlemeyi kaldır" : "Sabitle"}
                                    >
                                      <Pin className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onEditTask(task)}
                                      className="p-1 text-gray-400 dark:text-zinc-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                      title="Düzenle"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                      title="Sil"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {uncategorizedTasks.length === 0 && (
                      <div className="py-8">
                        <EmptyState
                          type="tasks"
                          title=""
                          description="Bu listede henüz görev yok"
                          className="py-4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Task Lists */}
          {taskLists.map((list) => {
            const listTasks = getTasksByList(list.id);
            
            return (
              <div key={list.id} className="flex-shrink-0 w-80 sm:w-96">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 h-fit flex flex-col max-h-[calc(100vh-12rem)]">
                  <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-8 rounded-full" 
                          style={{ backgroundColor: list.color }}
                        ></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]" title={list.title}>
                          {list.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-1 rounded-md">
                          {listTasks.length}
                        </span>
                        <div className="relative group/menu">
                          <button
                            onClick={() => setActiveListMenu(activeListMenu === list.id ? null : list.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeListMenu === list.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveListMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg z-20 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => handleEditList(list)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Düzenle
                                </button>
                                <button
                                  onClick={() => handleDeleteList(list.id)}
                                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Sil
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {list.description && (
                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2 line-clamp-2">{list.description}</p>
                    )}
                  </div>

                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 overflow-y-auto flex-1 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-zinc-800/50' : ''
                        }`}
                      >
                        {listTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group mb-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all ${
                                  snapshot.isDragging ? 'shadow-xl ring-2 ring-blue-500/20 rotate-2 z-50' : ''
                                } ${
                                  task.isCompleted ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  
                                  <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className="mt-0.5 flex-shrink-0 transition-all hover:scale-110"
                                  >
                                    {task.isCompleted ? (
                                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded-full hover:border-green-500 transition-colors"></div>
                                    )}
                                  </button>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium ${
                                      task.isCompleted 
                                        ? 'line-through text-gray-500 dark:text-zinc-500' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {task.isPinned && (
                                        <Pin className="w-3.5 h-3.5 text-amber-500 inline mr-1.5 fill-current" />
                                      )}
                                      {task.title}
                                    </h4>
                                    
                                    {task.description && (
                                      <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-3">
                                      {task.dueDate ? (
                                        <div className={`flex items-center gap-1.5 text-xs ${
                                          task.isCompleted 
                                            ? 'text-gray-400 dark:text-zinc-600'
                                            : new Date(task.dueDate) < new Date()
                                              ? 'text-red-500 dark:text-red-400'
                                              : 'text-gray-500 dark:text-zinc-500'
                                        }`}>
                                          <Calendar className="w-3 h-3" />
                                          <span>{formatDate(new Date(task.dueDate))}</span>
                                        </div>
                                      ) : <div></div>}
                                      
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors ${
                                            task.isPinned ? 'text-amber-500' : 'text-gray-400 dark:text-zinc-500 hover:text-amber-500'
                                          }`}
                                          title={task.isPinned ? "Sabitlemeyi kaldır" : "Sabitle"}
                                        >
                                          <Pin className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => onEditTask(task)}
                                          className="p-1 text-gray-400 dark:text-zinc-500 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                          title="Düzenle"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="p-1 text-gray-400 dark:text-zinc-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                          title="Sil"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {listTasks.length === 0 && (
                          <div className="py-8">
                            <EmptyState
                              type="tasks"
                              title=""
                              description="Bu listede henüz görev yok"
                              className="py-4"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}

          {/* Add New List Placeholder */}
          <div className="flex-shrink-0 w-80 sm:w-96">
            <button
              onClick={() => setShowListModal(true)}
              className="w-full h-[calc(100vh-12rem)] border-2 border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl hover:border-blue-500 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-all group flex flex-col items-center justify-center text-gray-500 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-zinc-300"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-medium">Yeni Liste Ekle</span>
            </button>
          </div>
        </div>
      </DragDropContext>

      {/* Task List Modal */}
      <TaskListModal
        isOpen={showListModal}
        onClose={closeListModal}
        editingList={editingList}
      />
    </div>
  );
};