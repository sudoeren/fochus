import React from 'react';
import { Plus, Search, Lightbulb } from 'lucide-react';

interface EmptyStateProps {
  type: 'notes' | 'tasks' | 'search' | 'dashboard';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const getIllustration = (type: string) => {
  const illustrations = {
    notes: (
      <div className="relative">
        <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm transform rotate-3">
          <div className="p-3 space-y-2">
            <div className="h-2 bg-blue-300 dark:bg-blue-700 rounded w-3/4"></div>
            <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-1/2"></div>
            <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded w-5/6"></div>
          </div>
        </div>
        <div className="absolute -top-2 -left-2 w-24 h-32 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800 shadow-sm transform -rotate-6">
          <div className="p-3 space-y-2">
            <div className="h-2 bg-green-300 dark:bg-green-700 rounded w-2/3"></div>
            <div className="h-2 bg-green-200 dark:bg-green-800 rounded w-3/4"></div>
            <div className="h-2 bg-green-200 dark:bg-green-800 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ),
    tasks: (
      <div className="relative">
        <div className="w-28 h-36 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800 shadow-sm">
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-purple-400 rounded"></div>
              <div className="h-1.5 bg-purple-300 dark:bg-purple-700 rounded flex-1"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-purple-400 rounded"></div>
              <div className="h-1.5 bg-purple-300 dark:bg-purple-700 rounded w-2/3"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 border-2 border-purple-400 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="h-1.5 bg-purple-200 dark:bg-purple-800 rounded w-3/4 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    search: (
      <div className="relative">
        <div className="w-32 h-20 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800 shadow-sm p-4">
          <div className="flex items-center justify-center h-full">
            <Search className="w-8 h-8 text-orange-400 dark:text-orange-600" />
            <div className="ml-2 space-y-1">
              <div className="h-1 bg-orange-300 dark:bg-orange-700 rounded w-12"></div>
              <div className="h-1 bg-orange-200 dark:bg-orange-800 rounded w-8"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    dashboard: (
      <div className="relative">
        <div className="grid grid-cols-2 gap-2">
          <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded border border-blue-200 dark:border-blue-800 p-2">
            <div className="space-y-2">
              <div className="h-1 bg-blue-300 dark:bg-blue-700 rounded w-3/4"></div>
              <div className="h-1 bg-blue-200 dark:bg-blue-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-16 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded border border-green-200 dark:border-green-800 p-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 border border-green-400 rounded-sm"></div>
                <div className="h-1 bg-green-300 dark:bg-green-700 rounded flex-1"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                <div className="h-1 bg-green-200 dark:bg-green-800 rounded flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return illustrations[type as keyof typeof illustrations] || illustrations.dashboard;
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      {/* Illustration */}
      <div className="mb-6">
        {getIllustration(type)}
      </div>

      {/* Content */}
      <div className="max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Action button */}
        {actionText && onAction && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            {actionText}
          </button>
        )}
      </div>

      {/* Tips based on type */}
      {type === 'notes' && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-md">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                İpucu
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Notlarınızı etiketleyerek daha kolay organize edebilir ve hızlıca bulabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {type === 'tasks' && (
        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-w-md">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                İpucu
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Görevlerinize tarih ve hatırlatıcı ekleyerek hiçbirini kaçırmayın.
              </p>
            </div>
          </div>
        </div>
      )}

      {type === 'search' && (
        <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 max-w-md">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                İpucu
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Ctrl+K tuşuna basarak hızlı arama yapabilir, not ve görevlerinizde gezinebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
