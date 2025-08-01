import React, { useState } from 'react';
import { Monitor, Moon, Sun, Download, Upload, Info, Palette, Database, Search, Zap } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [spotlightSettings, setSpotlightSettings] = useState(() => 
    JSON.parse(localStorage.getItem('spotlightSettings') || '{}')
  );

  const updateSpotlightSetting = (key: string, value: any) => {
    const newSettings = { ...spotlightSettings, [key]: value };
    setSpotlightSettings(newSettings);
    localStorage.setItem('spotlightSettings', JSON.stringify(newSettings));
  };

  const handleBackup = () => {
    console.log('Yedekleme işlemi başlatıldı');
  };

  const handleRestore = () => {
    console.log('Geri yükleme işlemi başlatıldı');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Ayarlar</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Uygulamanızı özelleştirin</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Klavye Kısayolları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kısayollar</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Spotlight</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">K</kbd>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Yeni Not</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">N</kbd>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">Yeni Görev</span>
              <div className="flex gap-1">
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">T</kbd>
              </div>
            </div>
          </div>
        </div>
        
        {/* Görünüm Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Görünüm</h2>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Tema Seçimi</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                  theme === 'light' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Açık Tema</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                  theme === 'dark' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Koyu Tema</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                  theme === 'system' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Sistem</span>
              </button>
            </div>
          </div>
        </div>

        {/* Spotlight Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spotlight</h2>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Navigasyon</span>
              <input
                type="checkbox"
                checked={spotlightSettings.showNavigation !== false}
                onChange={(e) => updateSpotlightSetting('showNavigation', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Hızlı Eylemler</span>
              <input
                type="checkbox"
                checked={spotlightSettings.showQuickActions !== false}
                onChange={(e) => updateSpotlightSetting('showQuickActions', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Sıralama</label>
              <select
                value={spotlightSettings.commandOrder || 'default'}
                onChange={(e) => updateSpotlightSetting('commandOrder', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="default">Varsayılan</option>
                <option value="alphabetical">Alfabetik</option>
                <option value="usage">Kullanım Sıklığı</option>
                <option value="category">Kategoriye Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Veri Yönetimi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Veri</h2>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Veri Yedekle
            </button>
            
            <button
              onClick={handleRestore}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Veri Geri Yükle
            </button>
          </div>
        </div>
      </div>

      {/* Uygulama Bilgileri */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Uygulama Bilgileri</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Versiyon</div>
            <div className="font-medium text-gray-900 dark:text-white">1.0.0</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Platform</div>
            <div className="font-medium text-gray-900 dark:text-white">Electron</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Framework</div>
            <div className="font-medium text-gray-900 dark:text-white">React</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Database</div>
            <div className="font-medium text-gray-900 dark:text-white">SQLite</div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Fokus, kişisel üretkenliğinizi artırmak için tasarlanmış modern bir masaüstü uygulamasıdır. 
            Notlar, görevler ve planlama araçlarını tek bir yerde birleştirir.
          </p>
        </div>
      </div>
    </div>
  );
};
