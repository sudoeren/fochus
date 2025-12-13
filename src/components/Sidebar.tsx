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
  PanelLeft
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
          "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-md shadow-lg whitespace-nowrap",
          side === 'right' && "left-full ml-2 top-1/2 -translate-y-1/2",
          side === 'left' && "right-full mr-2 top-1/2 -translate-y-1/2",
          side === 'top' && "bottom-full mb-2 left-1/2 -translate-x-1/2",
          side === 'bottom' && "top-full mt-2 left-1/2 -translate-x-1/2"
        )}>
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
  { id: 'profile', label: 'Profilim', icon: User },
];

// Sidebar Button Component
interface SidebarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  shortcut?: string;
  variant?: 'ghost' | 'blue' | 'amber';
  className?: string;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  onClick,
  icon,
  label,
  collapsed,
  shortcut,
  variant = 'ghost',
  className
}) => {
  const variantStyles = {
    ghost: cn(
      "bg-zinc-50 dark:bg-zinc-900",
      "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      "text-zinc-500 dark:text-zinc-400",
      "border border-zinc-200/50 dark:border-zinc-800"
    ),
    blue: cn(
      "bg-blue-50 dark:bg-blue-900/20",
      "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      "text-blue-600 dark:text-blue-400"
    ),
    amber: cn(
      "bg-amber-50 dark:bg-amber-900/20",
      "hover:bg-amber-100 dark:hover:bg-amber-900/30",
      "text-amber-600 dark:text-amber-400"
    )
  };

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl",
        "transition-all duration-200",
        variantStyles[variant],
        collapsed ? "justify-center w-full" : "w-full",
        className
      )}
    >
      {icon}
      {!collapsed && (
        <>
          <span className="text-sm font-medium flex-1 text-left">{label}</span>
          {shortcut && (
            <kbd className="text-[10px] font-mono bg-white/80 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-700">
              {shortcut}
            </kbd>
          )}
        </>
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
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl",
        "transition-all duration-200",
        active 
          ? cn(
              "bg-zinc-900 dark:bg-white",
              "text-white dark:text-zinc-900",
              "shadow-lg shadow-zinc-900/10 dark:shadow-white/10"
            )
          : cn(
              "text-zinc-600 dark:text-zinc-400",
              "hover:bg-zinc-100 dark:hover:bg-zinc-800",
              "hover:text-zinc-900 dark:hover:text-white"
            ),
        collapsed && "justify-center px-2",
        className
      )}
    >
      <span className={cn(
        "flex-shrink-0",
        active && "stroke-[2.5px]"
      )}>
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium">{label}</span>
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
  const { isActive, formatTime, timeLeft } = usePomodoro();

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
          "lg:hidden fixed top-4 left-4 z-40 p-2.5",
          "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl",
          "border border-zinc-200/50 dark:border-zinc-800/50",
          "rounded-xl shadow-lg shadow-zinc-900/5 dark:shadow-zinc-900/20",
          "text-zinc-600 dark:text-zinc-400",
          "hover:bg-zinc-50 dark:hover:bg-zinc-800",
          "transition-all duration-200"
        )}
      >
        <PanelLeft className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {openMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Floating Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
          "flex flex-col h-full",
          "transition-all duration-300 ease-in-out",
          // Mobile styles
          isMobile ? (openMobile ? "translate-x-0" : "-translate-x-full") : "",
          // Desktop floating style
          !isMobile && "p-3"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full",
            // Floating container style
            "bg-white/80 dark:bg-zinc-950/80",
            "backdrop-blur-xl",
            "border border-zinc-200/50 dark:border-zinc-800/50",
            "shadow-xl shadow-zinc-900/5 dark:shadow-zinc-900/30",
            !isMobile && "rounded-2xl",
            // Width transitions
            "transition-all duration-300 ease-in-out",
            open ? "w-64" : "w-16",
            isMobile && "w-72"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-center h-14 px-3 border-b border-zinc-100 dark:border-zinc-800/50",
            !open && !isMobile && "justify-center"
          )}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/logo.svg" 
                  alt="Fokus" 
                  className="w-8 h-8 rounded-lg shadow-sm" 
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-black/5" />
              </div>
              {(open || isMobile) && (
                <span className="font-semibold text-zinc-900 dark:text-white">
                  Fokus
                </span>
              )}
            </div>
            
            {/* Desktop Toggle */}
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className={cn(
                  "p-1.5 rounded-lg ml-auto",
                  "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "transition-colors",
                  !open && "hidden"
                )}
              >
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  open && "rotate-180"
                )} />
              </button>
            )}
          </div>

          {/* Search & Quick Actions */}
          <div className="p-2 space-y-2">
            {/* Search Button */}
            <SidebarButton
              onClick={() => {
                onOpenSpotlight();
                if (isMobile) setOpenMobile(false);
              }}
              icon={<Search className="w-4 h-4" />}
              label="Ara..."
              collapsed={!open && !isMobile}
              shortcut="⌘K"
              variant="ghost"
            />

            {/* Quick Action Buttons */}
            <div className={cn(
              "flex gap-1.5",
              !open && !isMobile && "flex-col"
            )}>
              <SidebarButton
                onClick={onOpenTaskModal}
                icon={<CheckSquare className="w-4 h-4" />}
                label="Görev"
                collapsed={!open && !isMobile}
                variant="blue"
                className="flex-1"
              />
              <SidebarButton
                onClick={onOpenNoteModal}
                icon={<FileText className="w-4 h-4" />}
                label="Not"
                collapsed={!open && !isMobile}
                variant="amber"
                className="flex-1"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="space-y-0.5">
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
            </div>
          </nav>

          {/* Footer */}
          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800/50 space-y-1">
            {/* Pomodoro */}
            <SidebarNavItem
              icon={
                <div className="relative">
                  <Timer className={cn("w-5 h-5", isActive && "text-red-500")} />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              }
              label={formatTime(timeLeft)}
              collapsed={!open && !isMobile}
              onClick={onOpenPomodoro || (() => {})}
              className={cn(
                isActive && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              )}
            />

            <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1.5" />

            {/* Bottom Menu Items */}
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

            <div className="h-px bg-zinc-100 dark:bg-zinc-800/50 my-1.5" />

            {/* Theme & Collapse Controls */}
            <div className={cn(
              "flex items-center gap-1",
              !open && !isMobile && "flex-col"
            )}>
              <SidebarButton
                onClick={cycleTheme}
                icon={getThemeIcon()}
                label={theme === 'light' ? 'Açık' : theme === 'dark' ? 'Koyu' : 'Sistem'}
                collapsed={!open && !isMobile}
                variant="ghost"
                className="flex-1"
              />
              
              {!isMobile && !open && (
                <button
                  onClick={toggleSidebar}
                  className={cn(
                    "w-full p-2 rounded-lg",
                    "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "transition-colors flex items-center justify-center"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

