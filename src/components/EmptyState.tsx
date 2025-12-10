import React from 'react';
import { Plus, Search, Lightbulb, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'notes' | 'tasks' | 'trash' | 'search' | 'dashboard';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const getIllustration = (type: string) => {
  const illustrations = {
    notes: (
      <div className="relative w-32 h-32 mx-auto">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/10 blur-2xl rounded-full" />
        
        {/* Back Page */}
        <div className="absolute top-0 right-2 w-20 h-28 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl border border-blue-200/50 dark:border-blue-700/30 transform rotate-6 shadow-sm" />
        
        {/* Front Page */}
        <div className="absolute top-2 left-2 w-20 h-28 bg-gradient-to-br from-white to-blue-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-blue-100 dark:border-zinc-700 shadow-lg transform -rotate-3 flex flex-col p-3 gap-2">
          {/* Content Lines */}
          <div className="w-1/2 h-1.5 rounded-full bg-blue-200 dark:bg-blue-500/50" />
          <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-zinc-700" />
          <div className="w-full h-1 rounded-full bg-gray-100 dark:bg-zinc-700" />
          <div className="w-3/4 h-1 rounded-full bg-gray-100 dark:bg-zinc-700" />
          
          {/* Floating Element */}
          <div className="absolute -right-3 top-8 w-8 h-8 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-gray-100 dark:border-zinc-700 flex items-center justify-center animate-bounce duration-[3000ms]">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>
    ),
    
    tasks: (
      <div className="relative w-32 h-32 mx-auto">
        {/* Glow */}
        <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-500/10 blur-2xl rounded-full" />
        
        {/* Clipboard Body */}
        <div className="absolute inset-x-4 top-2 bottom-0 bg-gradient-to-b from-white to-purple-50 dark:from-zinc-800 dark:to-zinc-900 rounded-xl border border-purple-100 dark:border-zinc-700 shadow-lg p-3 flex flex-col gap-3">
          {/* Clipboard Clip */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-purple-200 dark:bg-purple-900/50 rounded-b-lg border-x border-b border-purple-300 dark:border-purple-700/50" />
          
          {/* Check Items */}
          <div className="mt-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-purple-400 bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <div className="w-2 h-1.5 border-l-2 border-b-2 border-purple-600 dark:border-purple-300 transform -rotate-45 -mt-0.5" />
            </div>
            <div className="h-1.5 w-16 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-zinc-600" />
            <div className="h-1.5 w-12 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          </div>
          <div className="flex items-center gap-2 opacity-40">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-zinc-600" />
            <div className="h-1.5 w-10 bg-gray-200 dark:bg-zinc-700 rounded-full" />
          </div>
        </div>
        
        {/* Floating Pencil */}
        <div className="absolute bottom-4 -right-2 w-2 h-16 bg-yellow-400 dark:bg-yellow-500 rounded-full border border-yellow-500 dark:border-yellow-600 transform -rotate-45 shadow-sm" />
      </div>
    ),

    trash: (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 blur-2xl rounded-full" />
        
        {/* Bin Body */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 rounded-b-xl border-x border-b border-gray-300 dark:border-zinc-700 shadow-sm flex justify-around px-3 py-2">
          <div className="w-1 h-full bg-gray-300/50 dark:bg-zinc-700/50 rounded-full" />
          <div className="w-1 h-full bg-gray-300/50 dark:bg-zinc-700/50 rounded-full" />
        </div>
        
        {/* Lid */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-200 dark:bg-zinc-700 rounded-full border border-gray-300 dark:border-zinc-600 transform -rotate-6 origin-left shadow-sm" />
        
        {/* Handle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-3 border-2 border-gray-300 dark:border-zinc-600 rounded-t-lg transform -rotate-6 origin-left" />
        
        {/* Crumpled Paper */}
        <div className="absolute top-10 right-6 w-6 h-6 bg-white dark:bg-zinc-600 rounded-full shadow border border-gray-200 dark:border-zinc-500 animate-bounce" style={{ animationDuration: '2s' }} />
      </div>
    ),

    search: (
      <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 blur-2xl rounded-full" />
        
        {/* Magnifying Glass */}
        <div className="relative z-10 w-16 h-16 border-4 border-orange-400 dark:border-orange-500 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-lg flex items-center justify-center">
          <div className="w-12 h-1 bg-orange-200 dark:bg-zinc-700 rounded transform rotate-45 opacity-50" />
        </div>
        <div className="absolute bottom-6 right-6 w-4 h-12 bg-orange-400 dark:bg-orange-600 rounded-full transform -rotate-45 border-2 border-white dark:border-zinc-900" />
        
        {/* Floating Question Marks */}
        <div className="absolute top-4 right-4 text-2xl font-bold text-orange-300 dark:text-orange-700 animate-pulse">?</div>
        <div className="absolute bottom-4 left-4 text-xl font-bold text-orange-200 dark:text-orange-800 animate-pulse delay-75">?</div>
      </div>
    ),

    dashboard: (
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 blur-2xl rounded-full" />
        
        <div className="grid grid-cols-2 gap-2 h-full w-full p-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700/50 shadow-sm animate-pulse" />
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700/50 shadow-sm" />
          <div className="col-span-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700/50 shadow-sm h-12 mt-auto" />
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
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in-95 duration-500 ${className}`}>
      {/* Illustration Container */}
      <div className="mb-8 transform transition-transform hover:scale-105 duration-500">
        {getIllustration(type)}
      </div>

      {/* Content */}
      <div className="max-w-xs sm:max-w-sm w-full space-y-3">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-base text-gray-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>

        {/* Action button */}
        {actionText && onAction && (
          <div className="pt-6">
            <button
              onClick={onAction}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 
                       bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-zinc-200 
                       text-white dark:text-black font-semibold rounded-2xl 
                       transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              {actionText}
            </button>
          </div>
        )}
      </div>

      {/* Contextual Tips */}
      <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
        {type === 'notes' && (
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>İpucu: Notlarınızı #etiketler ile düzenleyebilirsiniz</span>
          </div>
        )}
        {type === 'tasks' && (
          <div className="flex items-center gap-2 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-800">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>İpucu: Görevleri sürükleyip bırakarak sıralayabilirsiniz</span>
          </div>
        )}
      </div>
    </div>
  );
};