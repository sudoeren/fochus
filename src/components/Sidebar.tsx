import React, { useState } from 'react';
import { Home, FileText, CheckSquare, Calendar, Settings, Trash2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 
          h-full flex flex-col transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${shouldExpand ? 'w-64' : 'w-16 lg:w-16'}
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

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            hidden lg:block absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 rounded-full 
            flex items-center justify-center text-gray-400 dark:text-gray-500
            hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
            transition-all duration-200 z-10 shadow-sm hover:shadow-md
          `}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>

        {/* Header */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            
            {/* Title */}
            <div className={`
              ml-3 transition-all duration-200 ease-in-out overflow-hidden
              ${shouldExpand ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0 ml-0'}
            `}>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fokus</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kişisel Üretkenlik</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
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
                  w-full flex items-center px-3 py-2.5 rounded-xl text-left group relative
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                {/* Icon */}
                <Icon className={`
                  w-5 h-5 flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                `} />
                
                {/* Label */}
                <span className={`
                  ml-3 font-medium transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap
                  ${shouldExpand ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0 ml-0'}
                `}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                )}
                
                {/* Tooltip for collapsed state */}
                {!shouldExpand && (
                  <div className="
                    absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 
                    text-sm rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 pointer-events-none
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 py-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-1">
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
                  w-full flex items-center px-3 py-2.5 rounded-xl text-left group relative
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                {/* Icon */}
                <Icon className={`
                  w-5 h-5 flex-shrink-0 transition-colors duration-200
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}
                `} />
                
                {/* Label */}
                <span className={`
                  ml-3 font-medium transition-all duration-200 ease-in-out overflow-hidden whitespace-nowrap
                  ${shouldExpand ? 'opacity-100 max-w-none' : 'opacity-0 max-w-0 ml-0'}
                `}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                )}
                
                {/* Tooltip for collapsed state */}
                {!shouldExpand && (
                  <div className="
                    absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 
                    text-sm rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 pointer-events-none
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`
          p-3 border-t border-gray-200/50 dark:border-gray-700/50 transition-all duration-200
          ${shouldExpand ? 'opacity-100' : 'opacity-0'}
        `}>
          {shouldExpand && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Fokus v1.0.0</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
