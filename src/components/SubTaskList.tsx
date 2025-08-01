import React, { useState } from 'react';
import { Plus, Check, Trash2, GripVertical } from 'lucide-react';
import { Task } from '../types';

interface SubTaskListProps {
  subtasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (subtasks: Task[]) => void;
  className?: string;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  subtasks,
  onAdd,
  onToggle,
  onDelete,
  onReorder,
  className = ""
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAdd = () => {
    if (newSubtaskTitle.trim()) {
      onAdd(newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setNewSubtaskTitle('');
      setIsAdding(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSubtasks = [...subtasks];
    const draggedItem = newSubtasks[draggedIndex];
    
    // Remove dragged item
    newSubtasks.splice(draggedIndex, 1);
    
    // Insert at new position
    const insertIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newSubtasks.splice(insertIndex, 0, draggedItem);
    
    // Update order
    const reorderedSubtasks = newSubtasks.map((subtask, index) => ({
      ...subtask,
      order: index
    }));
    
    onReorder(reorderedSubtasks);
    setDraggedIndex(null);
  };

  const completedCount = subtasks.filter(st => st.isCompleted).length;
  const totalCount = subtasks.length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Subtask list */}
      <div className="space-y-2">
        {subtasks.map((subtask, index) => (
          <div
            key={subtask.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            {/* Drag handle */}
            <div className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Checkbox */}
            <button
              onClick={() => onToggle(subtask.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {subtask.isCompleted && <Check className="w-3 h-3" />}
            </button>

            {/* Title */}
            <span className={`flex-1 text-sm ${
              subtask.isCompleted 
                ? 'text-gray-500 dark:text-gray-400 line-through' 
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {subtask.title}
            </span>

            {/* Delete button */}
            <button
              onClick={() => onDelete(subtask.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Alt görev adı..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newSubtaskTitle.trim()}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ekle
          </button>
          <button
            onClick={() => {
              setNewSubtaskTitle('');
              setIsAdding(false);
            }}
            className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            İptal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 w-full p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Alt görev ekle</span>
        </button>
      )}
    </div>
  );
};
