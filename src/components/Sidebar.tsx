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
  PanelLeft,
  Plus,
  PanelLeftClose,
  PanelLeftOpen
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
      className="relative inline-flex w-full items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "fixed z-[100] px-2.5 py-1.5 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 pointer-events-none",
        )}
        style={{
          left: side === 'right' ? '5rem' : 'auto',
          marginLeft: side === 'right' ? '0.5rem' : '0'
        }}
        >
          {content}
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

const SidebarNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, active, collapsed, onClick }) => {
  if (collapsed) {
    return (
      <Tooltip content={label} side="right">
        <button
          onClick={onClick}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mx-auto",
            active 
              ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400"
          )}
        >
          {icon}
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg" 
          : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
      )}
    >
      <span className={cn("transition-transform", active ? "scale-100" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
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

  const toggleSidebar = () => setOpen(!open);

  const contextValue: SidebarContextType = {
    state: open ? 'expanded' : 'collapsed',
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  };

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
    <SidebarContext.Provider value={contextValue}>
      {/* Mobile Toggle */}
      <button
        onClick={() => setOpenMobile(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800"
      >
        <PanelLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Mobile Overlay */}
      {openMobile && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed lg:relative z-50 h-screen lg:h-auto",
          "transition-all duration-300 ease-in-out",
          // Desktop: Padded Floating Look
          !isMobile && "py-4 pl-4",
          // Width Control
          open ? "w-72" : "w-[6rem]", 
          isMobile ? (openMobile ? "translate-x-0 w-72" : "-translate-x-full w-72") : "translate-x-0"
        )}
      >
        <div className={cn(
          "h-full flex flex-col",
          "bg-white dark:bg-zinc-900",
          "lg:rounded-[2rem] lg:border border-zinc-200/50 dark:border-zinc-800",
          "shadow-2xl shadow-zinc-200/50 dark:shadow-black/20",
          "overflow-hidden"
        )}>
          
          {/* Header & Toggle */}
          <div className={cn(
            "h-20 flex items-center justify-between px-6 shrink-0 transition-all duration-300",
            !open && !isMobile && "justify-center px-0 flex-col-reverse gap-4 h-32"
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
                F
              </div>
              {(open || isMobile) && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-2 overflow-hidden whitespace-nowrap">
                  <span className="font-bold text-lg text-zinc-900 dark:text-white leading-none">FOCHUS</span>
                </div>
              )}
            </div>

            {/* Collapse Toggle - Now in Header */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                  !open && "rotate-180 mb-2"
                )}
                title={open ? "Kenar çubuğunu gizle" : "Kenar çubuğunu göster"}
              >
                 {open ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className={cn("px-4 mb-2 space-y-2 transition-all duration-300", !open && "px-2")}>
             <button
               onClick={onOpenSpotlight}
               className={cn(
                 "w-full flex items-center gap-3 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500 dark:text-zinc-400",
                 !open && !isMobile && "justify-center px-0 aspect-square"
               )}
               title="Ara ( / )"
             >
                <Search className="w-4 h-4 shrink-0" />
                {(open || isMobile) && (
                  <>
                    <span className="text-sm font-medium">Ara...</span>
                    <kbd className="ml-auto text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5">/</kbd>
                  </>
                )}
             </button>

             {(open || isMobile) ? (
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={onOpenTaskModal} className="flex items-center justify-center gap-2 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                   <Plus className="w-3.5 h-3.5" /> Görev
                 </button>
                 <button onClick={onOpenNoteModal} className="flex items-center justify-center gap-2 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                   <Plus className="w-3.5 h-3.5" /> Not
                 </button>
               </div>
             ) : (
               <div className="flex flex-col gap-2">
                 <Tooltip content="Yeni Görev">
                   <button onClick={onOpenTaskModal} className="w-10 h-10 mx-auto flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors">
                     <CheckSquare className="w-4 h-4" />
                   </button>
                 </Tooltip>
                 <Tooltip content="Yeni Not">
                   <button onClick={onOpenNoteModal} className="w-10 h-10 mx-auto flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-100 transition-colors">
                     <FileText className="w-4 h-4" />
                   </button>
                 </Tooltip>
               </div>
             )}
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuItems.map(item => (
              <SidebarNavItem 
                key={item.id}
                icon={<item.icon className="w-5 h-5" />}
                label={item.label}
                active={activeView === item.id}
                collapsed={!open && !isMobile}
                onClick={() => {
                  onViewChange(item.id);
                  if (isMobile) setOpenMobile(false);
                }}
              />
            ))}
            
            <div className="my-4 border-t border-zinc-100 dark:border-zinc-800/50 mx-2" />

            {bottomItems.map(item => (
              <SidebarNavItem 
                key={item.id}
                icon={<item.icon className="w-5 h-5" />}
                label={item.label}
                active={activeView === item.id}
                collapsed={!open && !isMobile}
                onClick={() => {
                  onViewChange(item.id);
                  if (isMobile) setOpenMobile(false);
                }}
              />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 bg-zinc-50/50 dark:bg-black/20 border-t border-zinc-100 dark:border-zinc-800/50">
             {/* Pomodoro */}
             <button
               onClick={onOpenPomodoro}
               className={cn(
                 "w-full relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-800 text-white transition-all hover:shadow-lg hover:shadow-indigo-500/20 group",
                 !open && !isMobile ? "aspect-square flex items-center justify-center p-0" : "p-4"
               )}
             >
               {(open || isMobile) && isActive && (
                 <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
               )}
               
               <div className={cn("flex items-center", !open && !isMobile ? "justify-center" : "gap-3")}>
                  <div className={cn("p-2 rounded-xl bg-white/10", isActive && "text-indigo-300 animate-pulse")}>
                    <Timer className="w-5 h-5" />
                  </div>
                  {(open || isMobile) && (
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pomodoro</span>
                      <span className="text-xl font-mono font-bold leading-none mt-0.5">{formatTime(timeLeft)}</span>
                    </div>
                  )}
               </div>
             </button>

             {/* Theme Control */}
             <div className="mt-3">
               <button 
                 onClick={cycleTheme}
                 className={cn(
                   "w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors",
                   !open && !isMobile && "aspect-square p-0"
                 )}
               >
                 {getThemeIcon()}
                 {(open || isMobile) && <span className="text-xs font-bold">Tema</span>}
               </button>
             </div>
          </div>

        </div>
      </aside>
    </SidebarContext.Provider>
  );
};
