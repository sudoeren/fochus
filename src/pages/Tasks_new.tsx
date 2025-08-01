import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Pin, GripVertical, Edit3, List, MoreVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { TaskListModal } from '../components/TaskListModal';

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

  const getStatusColor = (task: any) => {
    if (task.isCompleted) return 'text-green-500';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'text-red-500';
    return 'text-gray-400 hover:text-blue-500';
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
    <div className="p-8 max-w-full overflow-x-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Görevlerim</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {taskLists.length} liste • {tasks.filter(t => !t.isDeleted).length} görev
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowListModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
          >
            <List className="w-5 h-5" />
            <span className="font-medium">Yeni Liste</span>
          </button>
          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Yeni Görev</span>
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8 overflow-x-auto pb-6">
          {/* Uncategorized Tasks */}
          <div className="flex-shrink-0 w-96">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 h-fit">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kategorisiz</h3>
                  </div>
                  <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                    {uncategorizedTasks.length}
                  </span>
                </div>
              </div>

              <Droppable droppableId="uncategorized">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-6 min-h-40 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {uncategorizedTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-transparent transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 ${
                              snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 border-blue-300 dark:border-blue-600' : ''
                            } ${
                              task.isCompleted ? 'opacity-75' : ''
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing p-1"
                              >
                                <GripVertical className="w-5 h-5" />
                              </div>
                              
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className={`mt-1 transition-all hover:scale-110 ${getStatusColor(task)}`}
                              >
                                {task.isCompleted ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <Circle className="w-6 h-6" />
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-semibold ${
                                  task.isCompleted 
                                    ? 'line-through text-gray-500 dark:text-gray-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.isPinned && (
                                    <Pin className="w-4 h-4 text-yellow-500 inline mr-2" />
                                  )}
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className={`text-sm mt-2 ${
                                    task.isCompleted 
                                      ? 'line-through text-gray-400 dark:text-gray-500' 
                                      : 'text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {task.description.length > 80 
                                      ? task.description.substring(0, 80) + '...' 
                                      : task.description}
                                  </p>
                                )}
                                
                                {task.dueDate && (
                                  <div className={`flex items-center gap-2 text-sm mt-3 ${
                                    task.isCompleted 
                                      ? 'text-gray-400 dark:text-gray-500'
                                      : new Date(task.dueDate) < new Date()
                                        ? 'text-red-500 dark:text-red-400'
                                        : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(new Date(task.dueDate))}</span>
                                  </div>
                                )}
                                
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                    className={`p-2 rounded-lg transition-all hover:scale-105 ${
                                      task.isPinned 
                                        ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:text-yellow-600' 
                                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                    }`}
                                  >
                                    <Pin className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => onEditTask(task)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-105"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Bu listede görev yok</p>
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
              <div key={list.id} className="flex-shrink-0 w-80">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: list.color }}
                        ></div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{list.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {listTasks.length}
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setActiveListMenu(activeListMenu === list.id ? null : list.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {activeListMenu === list.id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 py-1 min-w-32">
                              <button
                                onClick={() => handleEditList(list)}
                                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDeleteList(list.id)}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                Sil
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {list.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{list.description}</p>
                    )}
                  </div>

                  <Droppable droppableId={list.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 min-h-32 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {listTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                } ${
                                  task.isCompleted ? 'opacity-75' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  
                                  <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`mt-1 transition-colors ${getStatusColor(task)}`}
                                  >
                                    {task.isCompleted ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Circle className="w-4 h-4" />
                                    )}
                                  </button>
                                  
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium ${
                                      task.isCompleted 
                                        ? 'line-through text-gray-500 dark:text-gray-400' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {task.isPinned && (
                                        <Pin className="w-3 h-3 text-yellow-500 inline mr-1" />
                                      )}
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className={`text-xs mt-1 ${
                                        task.isCompleted 
                                          ? 'line-through text-gray-400 dark:text-gray-500' 
                                          : 'text-gray-600 dark:text-gray-300'
                                      }`}>
                                        {task.description.length > 60 
                                          ? task.description.substring(0, 60) + '...' 
                                          : task.description}
                                      </p>
                                    )}
                                    
                                    {task.dueDate && (
                                      <div className={`flex items-center gap-1 text-xs mt-2 ${
                                        task.isCompleted 
                                          ? 'text-gray-400 dark:text-gray-500'
                                          : new Date(task.dueDate) < new Date()
                                            ? 'text-red-500 dark:text-red-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                      }`}>
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(new Date(task.dueDate))}</span>
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-1 mt-2">
                                      <button
                                        onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                        className={`p-1 text-xs transition-colors ${
                                          task.isPinned 
                                            ? 'text-yellow-500 hover:text-yellow-600' 
                                            : 'text-gray-400 hover:text-yellow-500'
                                        }`}
                                      >
                                        <Pin className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => onEditTask(task)}
                                        className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
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
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Bu listede görev yok</p>
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
          <div className="flex-shrink-0 w-80">
            <button
              onClick={() => setShowListModal(true)}
              className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Yeni Liste Ekle</span>
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
