import React, { useState } from 'react';
import { 
  Monitor, 
  Moon, 
  Sun, 
  Search, 
  Save,
  RotateCcw,
  Info,
  Palette
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

interface SpotlightItem {
  id: string;
  label: string;
  enabled: boolean;
}

const defaultSpotlightOrder: SpotlightItem[] = [
  { id: 'dashboard', label: 'Dashboard', enabled: true },
  { id: 'notes', label: 'Notlar', enabled: true },
  { id: 'tasks', label: 'Görevler', enabled: true },
  { id: 'weekly', label: 'Haftalık Planlayıcı', enabled: true },
  { id: 'settings', label: 'Ayarlar', enabled: true },
  { id: 'new-note', label: 'Yeni Not Oluştur', enabled: true },
  { id: 'new-task', label: 'Yeni Görev Oluştur', enabled: true },
];

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const [spotlightOrder, setSpotlightOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('spotlightOrder');
      return saved ? JSON.parse(saved) : defaultSpotlightOrder;
    } catch {
      return defaultSpotlightOrder;
    }
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  const toggleItemEnabled = (id: string) => {
    const updatedOrder = spotlightOrder.map((item: SpotlightItem) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    
    setSpotlightOrder(updatedOrder);
    setHasChanges(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('spotlightOrder', JSON.stringify(spotlightOrder));
      
      // Create settings object
      const settings: any = {};
      spotlightOrder.forEach((item: SpotlightItem) => {
        settings[item.id] = item.enabled;
      });
      
      localStorage.setItem('spotlightSettings', JSON.stringify(settings));
      setHasChanges(false);
      
      // Dispatch storage event for immediate sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'spotlightSettings',
        newValue: JSON.stringify(settings),
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  };

  const resetSettings = () => {
    setSpotlightOrder(defaultSpotlightOrder);
    setHasChanges(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
              <p className="text-gray-500 dark:text-gray-400">Uygulama tercihlerinizi yönetin</p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tema</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-gray-900 dark:text-white">Açık</span>
              </div>
            </button>
            
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Koyu</span>
              </div>
            </button>
            
            <button
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Sistem</span>
              </div>
            </button>
          </div>
        </div>

        {/* Spotlight Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spotlight Ayarları</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Sıfırla
              </button>
              <button
                onClick={saveSettings}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>

          {/* Command List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Komut Görünürlüğü
            </label>
            <div className="space-y-2">
              {spotlightOrder.map((item: SpotlightItem) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={() => toggleItemEnabled(item.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.label}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
