import React, { useState, useEffect } from 'react';
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
  Plus,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Timer,
  BarChart
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePomodoro } from '../hooks/usePomodoro';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenSpotlight: () => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro?: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'notes', label: 'Notlar', icon: FileText },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare },
  { id: 'weekly', label: 'Haftalık Plan', icon: Calendar },
  { id: 'stats', label: 'İstatistikler', icon: BarChart },
];

const bottomItems = [
  { id: 'trash', label: 'Çöp Kutusu', icon: Trash2 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Pomodoro Mini Status
  const { isActive, formatTime, timeLeft, mode } = usePomodoro();

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-600 dark:text-zinc-400 shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800
          h-full flex flex-col transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          overflow-x-hidden
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header & Logo */}
        <div className={`h-16 flex items-center border-b border-gray-100 dark:border-zinc-900 flex-shrink-0 ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.svg" alt="Fokus Logo" className="w-8 h-8 rounded-lg shadow-sm flex-shrink-0" />
            <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight whitespace-nowrap">Fokus</span>
            </div>
          </div>
        </div>

        {/* 2. Spotlight & Quick Actions */}
        <div className="p-3 space-y-2 flex-shrink-0">
          <button
            onClick={() => {
              onOpenSpotlight();
              setIsMobileMenuOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 
              bg-gray-50 dark:bg-zinc-900 
              hover:bg-gray-100 dark:hover:bg-zinc-800
              text-gray-500 dark:text-zinc-400 
              border border-gray-200 dark:border-zinc-800
              rounded-xl transition-all duration-200 group
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title="Ara (Ctrl+K)"
          >
            <Search className="w-4 h-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
            <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
              Ara...
            </span>
            {!isCollapsed && (
              <kbd className="ml-auto text-[10px] font-mono bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                Ctrl K
              </kbd>
            )}
          </button>

          <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
            <button
              onClick={onOpenTaskModal}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5
                bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-900/30
                rounded-xl transition-colors
                ${isCollapsed ? 'w-full' : ''}
              `}
              title="Yeni Görev"
            >
              <CheckSquare className="w-4 h-4" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Görev</span>}
            </button>
            <button
              onClick={onOpenNoteModal}
              className={`
                flex-1 flex items-center justify-center gap-2 py-2.5
                bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400
                hover:bg-amber-100 dark:hover:bg-amber-900/30
                rounded-xl transition-colors
                ${isCollapsed ? 'w-full' : ''}
              `}
              title="Yeni Not"
            >
              <FileText className="w-4 h-4" />
              {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">Not</span>}
            </button>
          </div>
        </div>

        {/* 3. Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-1 scrollbar-hide">
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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-200'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                
                <span className={`text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* 4. Footer Actions & Pomodoro */}
        <div className="p-3 border-t border-gray-100 dark:border-zinc-900 space-y-1 flex-shrink-0">
          
          {/* Pomodoro Mini Widget */}
          <button
            onClick={onOpenPomodoro}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative mb-2
              ${isActive 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-200'
              }
              ${isCollapsed ? 'justify-center px-0' : ''}
            `}
            title="Pomodoro Zamanlayıcı"
          >
            <div className="relative">
              <Timer className={`w-5 h-5 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
              )}
            </div>
            
            <span className={`text-sm font-mono font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
              {formatTime(timeLeft)}
            </span>
          </button>

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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-200'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          <div className="h-px bg-gray-100 dark:bg-zinc-900 my-2" />

          {/* Theme & Collapse Controls */}
          <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
            {/* Theme Switcher */}
            <button
              onClick={cycleTheme}
              className={`
                flex items-center justify-center gap-3 p-2.5 rounded-xl
                text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 
                hover:text-gray-900 dark:hover:text-white transition-colors
                ${isCollapsed ? 'w-full' : 'flex-1'}
              `}
              title={`Tema: ${theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : 'Sistem'}`}
            >
              {getThemeIcon()}
              {!isCollapsed && <span className="text-sm whitespace-nowrap">Tema</span>}
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className={`
                hidden lg:flex items-center justify-center p-2.5 rounded-xl
                text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 
                hover:text-gray-900 dark:hover:text-white transition-colors
                ${isCollapsed ? 'w-full' : ''}
              `}
              title={isCollapsed ? "Genişlet" : "Daralt"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
