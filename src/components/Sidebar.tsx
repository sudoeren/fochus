import React from 'react';
import { Home, FileText, CheckSquare, Calendar, Settings, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
  { id: 'notes', label: 'Notlar', icon: FileText },
  { id: 'tasks', label: 'Günlük Görevler', icon: CheckSquare },
  { id: 'weekly', label: 'Haftalık Plan', icon: Calendar },
  { id: 'trash', label: 'Çöp Kutusu', icon: Trash2 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fokus</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kişisel Üretkenlik</p>
      </div>
      
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors',
                activeView === item.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
