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
    
    reorderTasks(startIndex, endIndex);
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
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Görevlerim
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Görevlerinizi organize edin ve takip edin
          </p>
        </div>
        <button 
          onClick={onOpenTaskModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                   text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-all duration-200 
                   shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base flex-shrink-0"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Yeni Görev Ekle</span>
          <span className="sm:hidden">Yeni Görev</span>
        </button>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
        <div className="flex flex-wrap gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                activeFilter === filter.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
            <span className="whitespace-nowrap">{filter.label}</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.key
                ? 'bg-blue-400 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* Tasks List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div 
              className="space-y-3"
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
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 transition-all duration-200 ${
                          snapshot.isDragging ? 'shadow-lg rotate-1 scale-105' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0"
                          >
                            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`mt-1 transition-colors flex-shrink-0 ${getStatusColor(task)}`}
                          >
                            {task.isCompleted ? (
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <Circle className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-base sm:text-lg font-medium flex items-center gap-2 ${
                                  task.isCompleted 
                                    ? 'line-through text-gray-500 dark:text-gray-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {task.isPinned && (
                                    <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                  <span className="truncate">{task.title}</span>
                                </h3>
                                {task.description && (
                                  <p className={`text-xs sm:text-sm mt-1 ${
                                    task.isCompleted 
                                      ? 'line-through text-gray-400 dark:text-gray-500' 
                                      : 'text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                                  {task.dueDate && (
                                    <div className={`flex items-center gap-1 text-xs ${
                                      task.isCompleted 
                                        ? 'text-gray-400 dark:text-gray-500'
                                        : new Date(task.dueDate) < new Date()
                                          ? 'text-red-500 dark:text-red-400'
                                          : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                      <Calendar className="w-3 h-3 flex-shrink-0" />
                                      <span className="whitespace-nowrap">{formatDate(new Date(task.dueDate))}</span>
                                    </div>
                                  )}
                                  
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                    task.status === 'COMPLETED' 
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : task.status === 'PENDING'
                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {task.status === 'COMPLETED' ? 'Tamamlandı' : 
                                     task.status === 'PENDING' ? 'Bekliyor' : 'Ertelendi'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2">
                                <button
                                  onClick={() => handlePinTask(task.id, task.isPinned || false)}
                                  className={`p-1 sm:p-1.5 transition-colors ${
                                    task.isPinned 
                                      ? 'text-yellow-500 hover:text-yellow-600' 
                                      : 'text-gray-400 hover:text-yellow-500'
                                  }`}
                                  title={task.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                                >
                                  <Pin className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => onEditTask(task)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                  title="Düzenle"
                                >
                                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1 sm:p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
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
                      ? 'İlk görevinizi oluşturarak üretkenliğinizi artırmaya başlayın. Görevlerinizi kategorize edebilir ve süreçlerinizi takip edebilirsiniz.'
                      : `Bu filtre için henüz görev bulunmuyor. "${filterOptions.find(f => f.key === activeFilter)?.label}" kategorisinde görev eklemek için yeni görev oluşturun.`
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
  );
};
