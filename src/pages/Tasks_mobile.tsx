import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Pin, GripVertical, Edit3 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useTasks } from '../hooks/useTasks';
import { EmptyState } from '../components/EmptyState';

interface TasksProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const Tasks: React.FC<TasksProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, loading, deleteTask, toggleTask, pinTask, reorderTasks, getTasksByFilter } = useTasks();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');

  const filteredTasks = getTasksByFilter(activeFilter);

  const filterOptions = [
    { key: 'all', label: 'Hepsi', count: tasks.length },
    { key: 'pending', label: 'Bekleyen', count: tasks.filter(t => !t.isCompleted).length },
    { key: 'completed', label: 'Tamamlanan', count: tasks.filter(t => t.isCompleted).length },
    { key: 'today', label: 'Bugün', count: getTasksByFilter('today').length },
    { key: 'overdue', label: 'Gecikmiş', count: getTasksByFilter('overdue').length }
  ];

  const handleDeleteTask = async (id: string) => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask(id);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handlePinTask = async (taskId: string, isPinned: boolean) => {
    await pinTask(taskId, !isPinned);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    const sourceTask = filteredTasks[startIndex];
    const destinationTask = filteredTasks[endIndex];
    
    const sourceIndexInAllTasks = tasks.findIndex(task => task.id === sourceTask.id);
    const destinationIndexInAllTasks = tasks.findIndex(task => task.id === destinationTask.id);
    
    if (sourceIndexInAllTasks !== -1 && destinationIndexInAllTasks !== -1) {
      reorderTasks(sourceIndexInAllTasks, destinationIndexInAllTasks);
    }
  };

  const getStatusColor = (task: any) => {
    if (task.isCompleted) return 'text-green-500';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'text-red-500';
    return 'text-gray-400';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Ultra Mobile Container */}
      <div className="p-2 xxs:p-3 xs:p-4 space-y-2 xxs:space-y-3 max-w-7xl mx-auto">
        
        {/* Ultra Compact Header */}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-lg xxs:text-xl xs:text-2xl font-bold text-gray-900 dark:text-white">
              Görevlerim
            </h1>
            <div className="flex items-center gap-2 xxs:gap-3 text-xs xxs:text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="font-medium">{tasks.length}</span>
                <span className="hidden xxs:inline">toplam</span>
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-green-600 dark:text-green-400">
                  {tasks.filter(t => t.isCompleted).length}
                </span>
                <span className="hidden xxs:inline">✓</span>
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="flex items-center gap-1">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {tasks.filter(t => !t.isCompleted).length}
                </span>
                <span className="hidden xxs:inline">bekl.</span>
              </span>
            </div>
          </div>
          <button 
            onClick={onOpenTaskModal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                     text-white px-3 xxs:px-4 py-3 rounded-lg flex items-center justify-center gap-1 xxs:gap-2 
                     transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 
                     text-xs xxs:text-sm font-semibold touch-manipulation min-h-[44px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="whitespace-nowrap">Yeni Görev</span>
          </button>
        </div>

        {/* Ultra Compact Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 xxs:p-2 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
            {filterOptions.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as any)}
                className={`px-2 xxs:px-3 py-2 rounded-lg text-xs xxs:text-sm font-semibold 
                          transition-all duration-200 flex items-center gap-1 whitespace-nowrap 
                          flex-shrink-0 touch-manipulation min-h-[40px] ${
                  activeFilter === filter.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-gray-50 dark:bg-gray-700/30'
                }`}
              >
                <span>
                  {filter.key === 'all' ? 'Hepsi' : 
                   filter.key === 'pending' ? 'Bekl.' : 
                   filter.key === 'completed' ? 'Tmm' : 
                   filter.key === 'today' ? 'Bugün' : 'Geç.'}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold min-w-[1.25rem] text-center ${
                  activeFilter === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ultra Mobile Tasks List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks" type="TASK">
            {(provided, snapshot) => (
              <div 
                className={`space-y-1 xxs:space-y-2 transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2' : ''
                }`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
                                    border-gray-200 dark:border-gray-700 p-2 xxs:p-3 
                                    transition-all duration-200 touch-manipulation ${
                            snapshot.isDragging ? 'shadow-lg rotate-1 scale-105 z-50' : 'hover:shadow-md active:scale-[0.98]'
                          }`}
                        >
                          <div className="flex items-start gap-1 xxs:gap-2">
                            {/* Ultra Small Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="mt-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                                       cursor-grab active:cursor-grabbing flex-shrink-0 touch-none
                                       p-1 -m-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                                       transition-colors touch-manipulation"
                            >
                              <GripVertical className="w-3 h-3" />
                            </div>
                            
                            {/* Ultra Small Complete Toggle */}
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className={`mt-0.5 transition-colors flex-shrink-0 p-1 -m-1 rounded 
                                        hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation
                                        ${getStatusColor(task)}`}
                            >
                              {task.isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            
                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col space-y-1">
                                {/* Title and Actions */}
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex-1 min-w-0">
                                    <h3 className={`text-sm font-medium flex items-start gap-1 leading-tight ${
                                      task.isCompleted 
                                        ? 'line-through text-gray-500 dark:text-gray-400' 
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {task.isPinned && (
                                        <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                                      )}
                                      <span className="break-words">{task.title}</span>
                                    </h3>
                                    {task.description && (
                                      <p className={`text-xs mt-0.5 break-words leading-relaxed ${
                                        task.isCompleted 
                                          ? 'line-through text-gray-400 dark:text-gray-500' 
                                          : 'text-gray-600 dark:text-gray-300'
                                      }`}>
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Ultra Small Action Buttons */}
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    <button
                                      onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                      className={`p-1 transition-colors rounded hover:bg-gray-100 
                                                dark:hover:bg-gray-700 touch-manipulation ${
                                        task.isPinned 
                                          ? 'text-yellow-500 hover:text-yellow-600' 
                                          : 'text-gray-400 hover:text-yellow-500'
                                      }`}
                                    >
                                      <Pin className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => onEditTask(task)}
                                      className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 
                                               transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700
                                               touch-manipulation"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                                               transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700
                                               touch-manipulation"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Ultra Compact Meta Info */}
                                <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  {task.dueDate && (
                                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                                      new Date(task.dueDate) < new Date() && !task.isCompleted
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                    }`}>
                                      <Calendar className="w-2.5 h-2.5" />
                                      <span>
                                        {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                                      </span>
                                    </div>
                                  )}
                                  {task.category && task.category !== 'personal' && (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                                                   px-1.5 py-0.5 rounded text-xs">
                                      {task.category}
                                    </span>
                                  )}
                                  {task.priority && task.priority !== 'medium' && (
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                                      task.priority === 'high' 
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                    }`}>
                                      {task.priority === 'high' ? 'Y' : 'D'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <EmptyState
                    type="tasks"
                    title={
                      activeFilter === 'all' ? 'Henüz göreviniz yok' : 
                      activeFilter === 'pending' ? 'Bekleyen görev yok' :
                      activeFilter === 'completed' ? 'Tamamlanan görev yok' :
                      activeFilter === 'today' ? 'Bugün için görev yok' :
                      'Gecikmiş görev yok'
                    }
                    description={
                      activeFilter === 'all' 
                        ? 'İlk görevinizi oluşturarak üretkenliğinizi artırmaya başlayın.'
                        : `Bu filtre için henüz görev bulunmuyor.`
                    }
                    actionText={activeFilter === 'all' ? 'İlk Görevimi Oluştur' : 'Yeni Görev Ekle'}
                    onAction={onOpenTaskModal}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
