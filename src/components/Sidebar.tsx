import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X,
  Search,
  PlusCircle,
  Plus
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenSpotlight: () => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home
  },
  { 
    id: 'notes', 
    label: 'Notlar', 
    icon: FileText
  },
  { 
    id: 'tasks', 
    label: 'Görevler', 
    icon: CheckSquare
  },
  { 
    id: 'weekly', 
    label: 'Haftalık Plan', 
    icon: Calendar
  },
];

const bottomItems = [
  { 
    id: 'trash', 
    label: 'Çöp Kutusu', 
    icon: Trash2
  },
  { 
    id: 'settings', 
    label: 'Ayarlar', 
    icon: Settings
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto expand on hover if collapsed
  const shouldExpand = !isCollapsed || isHovered;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          h-full flex flex-col transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${shouldExpand ? 'w-[280px]' : 'w-[80px] lg:w-[80px]'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Collapse Toggle Button (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 rounded-full 
            items-center justify-center text-gray-400 dark:text-gray-500
            hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800
            transition-all duration-200 z-10 shadow-sm
          `}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* 1. Header Area */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            
            <div className={`transition-all duration-200 overflow-hidden ${shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">Fokus</h1>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Pro</span>
            </div>
          </div>

          {/* Search Button / Spotlight Trigger */}
          <button
            onClick={() => {
              onOpenSpotlight();
              setIsMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 
              bg-gray-100 dark:bg-gray-800/50 
              border border-transparent hover:border-gray-200 dark:hover:border-gray-700
              hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm
              text-gray-500 dark:text-gray-400 rounded-xl transition-all duration-200 group
              ${!shouldExpand ? 'justify-center px-0' : ''}
            `}
            title="Hızlı Ara (Ctrl+K)"
          >
            <Search className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className={`text-sm font-medium truncate transition-all duration-200 ${shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Hızlı Ara...
            </span>
            {shouldExpand && (
              <kbd className="ml-auto hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-gray-400">
                ⌘K
              </kbd>
            )}
          </button>
        </div>

        {/* 2. Quick Actions */}
        <div className={`px-4 py-2 transition-all duration-200 ${shouldExpand ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Oluştur
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenNoteModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="text-xs font-medium">Not</span>
            </button>
            <button
              onClick={() => {
                onOpenTaskModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-xs font-medium">Görev</span>
            </button>
          </div>
        </div>

        {/* Divider if collapsed */}
        {!shouldExpand && (
          <div className="px-4 py-2 flex flex-col gap-2 items-center">
             <button
              onClick={() => {
                onOpenNoteModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
              title="Yeni Not"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 3. Main Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
          {shouldExpand && (
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3 mt-2">
              Menü
            </div>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md shadow-gray-200 dark:shadow-none' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${!shouldExpand ? 'justify-center px-0' : ''}
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-colors
                  ${isActive ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'}
                `} />
                
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ${shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>

                {/* Tooltip */}
                {!shouldExpand && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5 
                    bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                    text-xs font-medium rounded-lg whitespace-nowrap 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 pointer-events-none z-50 shadow-xl
                    translate-x-2 group-hover:translate-x-0 transform
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 4. Bottom Actions (Settings, Trash) */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
           {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                  }
                  ${!shouldExpand ? 'justify-center px-0' : ''}
                `}
              >
                <Icon className={`w-5 h-5 ${item.id === 'trash' ? 'group-hover:text-red-500' : ''}`} />
                
                <span className={`font-medium whitespace-nowrap transition-all duration-200 ${shouldExpand ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                  {item.label}
                </span>

                 {/* Tooltip */}
                 {!shouldExpand && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5 
                    bg-gray-900 dark:bg-white text-white dark:text-gray-900 
                    text-xs font-medium rounded-lg whitespace-nowrap 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 pointer-events-none z-50 shadow-xl
                    translate-x-2 group-hover:translate-x-0 transform
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};