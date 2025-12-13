import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Trash2, 
  Search,
  Sun,
  Moon,
  Monitor,
  Timer,
  BarChart,
  User,
  ChevronRight,
  PanelLeft,
  Plus
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePomodoro } from '../hooks/usePomodoro';
import { cn } from '../lib/utils';

// Sidebar Context
interface SidebarContextType {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Tooltip Component
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: string;
  side?: 'right' | 'top' | 'bottom' | 'left';
}> = ({ children, content, side = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200",
          side === 'right' && "left-full ml-3 top-1/2 -translate-y-1/2",
          side === 'left' && "right-full mr-3 top-1/2 -translate-y-1/2",
        )}>
          {content}
          {/* Arrow */}
          <div className={cn(
            "absolute w-1.5 h-1.5 rotate-45",
            side === 'right' && "left-[-3px] top-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-white",
            side === 'left' && "right-[-3px] top-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-white"
          )} />
        </div>
      )}
    </div>
  );
};

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

// Sidebar Navigation Item
interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick: () => void;
  className?: string;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon,
  label,
  active,
  collapsed,
  onClick,
  className
}) => {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl group overflow-hidden",
        "transition-all duration-300",
        active 
          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-white/5" 
          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200",
        collapsed && "justify-center px-0",
        className
      )}
    >
      <span className={cn(
        "relative z-10 flex-shrink-0 transition-transform duration-300",
        active ? "scale-100" : "group-hover:scale-110"
      )}>
        {icon}
      </span>
      {!collapsed && (
        <span className="relative z-10 text-sm font-medium tracking-tight">{label}</span>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} side="right">
        {button}
      </Tooltip>
    );
  }

  return button;
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [openMobile, setOpenMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isActive, formatTime, timeLeft, progress } = usePomodoro();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(open));
  }, [open]);

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  const state = open ? 'expanded' : 'collapsed';

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

  const contextValue: SidebarContextType = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };

  const handleNavClick = (id: string) => {
    onViewChange(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Mobile Trigger */}
      <button
        onClick={() => setOpenMobile(true)}
        className={cn(
          "lg:hidden fixed top-4 left-4 z-40 p-3",
          "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl",
          "border border-zinc-200/50 dark:border-zinc-800/50",
          "rounded-2xl shadow-lg shadow-zinc-900/5",
          "text-zinc-600 dark:text-zinc-400",
          "transition-all duration-200 hover:scale-105 active:scale-95"
        )}
      >
        <PanelLeft className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {openMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-md z-40 animate-in fade-in duration-200"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Floating Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:relative z-50 lg:z-auto h-screen lg:h-auto",
          "transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          isMobile ? (openMobile ? "translate-x-0" : "-translate-x-full") : "",
          !isMobile && "p-4" // Padding for floating effect on desktop
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full",
            // Floating Styles
            "bg-white dark:bg-zinc-900",
            "lg:rounded-[2rem] lg:shadow-2xl lg:shadow-zinc-900/5",
            "border-r lg:border border-zinc-200/50 dark:border-zinc-800",
            // Width transitions
            "transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
            open ? "w-72" : "w-[4.5rem]",
            isMobile && "w-[85vw] max-w-xs h-full rounded-none border-r"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center h-20 px-4",
            !open && !isMobile && "justify-center px-0"
          )}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => handleNavClick('dashboard')}>
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-xl" />
                <div className="relative w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
                   <span className="font-bold text-lg">F</span>
                </div>
              </div>
              {(open || isMobile) && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                  <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight leading-none">
                    FOCHUS
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 tracking-widest uppercase mt-0.5">
                    Workspace
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="px-3 pb-2 space-y-2">
            <button
              onClick={() => {
                onOpenSpotlight();
                if (isMobile) setOpenMobile(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
                "bg-zinc-50 dark:bg-zinc-800/50",
                "border border-zinc-200/50 dark:border-zinc-800",
                "text-zinc-500 dark:text-zinc-400",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
                "transition-all duration-200 group",
                !open && !isMobile && "justify-center px-0"
              )}
            >
               <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
               {(open || isMobile) && (
                 <>
                  <span className="text-sm">Ara...</span>
                  <kbd className="ml-auto text-[10px] font-mono bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400">⌘K</kbd>
                 </>
               )}
            </button>

            {/* Quick Add Buttons */}
            {(open || isMobile) ? (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={onOpenTaskModal}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Görev
                </button>
                <button
                  onClick={onOpenNoteModal}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Not
                </button>
              </div>
            ) : (
               <div className="flex flex-col gap-2">
                 <Tooltip content="Yeni Görev" side="right">
                   <button onClick={onOpenTaskModal} className="p-2.5 flex justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors">
                     <CheckSquare className="w-4 h-4" />
                   </button>
                 </Tooltip>
                 <Tooltip content="Yeni Not" side="right">
                   <button onClick={onOpenNoteModal} className="p-2.5 flex justify-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 transition-colors">
                     <FileText className="w-4 h-4" />
                   </button>
                 </Tooltip>
               </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-1 my-2 custom-scrollbar">
            {menuItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                icon={<item.icon className="w-5 h-5" />}
                label={item.label}
                active={activeView === item.id}
                collapsed={!open && !isMobile}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
            
            <div className="my-4 border-t border-zinc-100 dark:border-zinc-800/50 mx-2" />

             {bottomItems.map((item) => (
              <SidebarNavItem
                key={item.id}
                icon={<item.icon className="w-5 h-5" />}
                label={item.label}
                active={activeView === item.id}
                collapsed={!open && !isMobile}
                onClick={() => handleNavClick(item.id)}
              />
            ))}
          </nav>

          {/* Footer - Pomodoro & Settings */}
          <div className="p-3 mt-auto">
            {/* Pomodoro Card */}
            <div 
              onClick={onOpenPomodoro || (() => {})}
              className={cn(
                "cursor-pointer group relative overflow-hidden",
                "bg-zinc-900 dark:bg-zinc-800",
                "text-white rounded-2xl",
                "transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20",
                !open && !isMobile ? "p-3 flex justify-center aspect-square items-center" : "p-4"
              )}
            >
              {/* Progress Background */}
              {(open || isMobile) && isActive && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" 
                  style={{ width: `${progress}%` }}
                />
              )}

              <div className={cn(
                "flex items-center",
                !open && !isMobile ? "flex-col gap-1" : "justify-between"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl bg-white/10 transition-colors",
                    isActive && "text-indigo-300 bg-indigo-500/20"
                  )}>
                    <Timer className={cn("w-5 h-5", isActive && "animate-pulse")} />
                  </div>
                  {(open || isMobile) && (
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Pomodoro</span>
                      <span className="text-xl font-bold font-mono tracking-wider tabular-nums">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Theme & Collapse */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={cycleTheme}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl",
                  "bg-zinc-50 dark:bg-zinc-800/50",
                  "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "transition-all duration-200",
                  !open && !isMobile && "aspect-square"
                )}
              >
                {getThemeIcon()}
                {(open || isMobile) && <span className="text-xs font-semibold">Tema</span>}
              </button>

              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className={cn(
                    "p-2.5 rounded-xl",
                    "bg-zinc-50 dark:bg-zinc-800/50",
                    "text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "transition-all duration-200"
                  )}
                >
                  <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", open && "rotate-180")} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </SidebarContext.Provider>
  );
};
