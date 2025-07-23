// src/components/Settings.tsx
import React from 'react';
import { Monitor, Moon, Sun, Download, Upload, Info, Palette, Database } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleBackup = () => {
    console.log('Yedekleme işlemi başlatıldı');
    // Yedekleme mantığı buraya eklenecek
  };

  const handleRestore = () => {
    console.log('Geri yükleme işlemi başlatıldı');
    // Geri yükleme mantığı buraya eklenecek
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto max-h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Ayarlar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Uygulamanızı ihtiyaçlarınıza göre özelleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Görünüm Ayarları */}
        <div className="card p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Görünüm
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tema ve görsel ayarları
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tema Seçimi
              </label>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 w-full text-left ${
                    theme === 'light'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-purple-600' : 'text-gray-500'}`} />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium block text-gray-900 dark:text-white">Açık Tema</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Aydınlık ve temiz görünüm</span>
                  </div>
                  {theme === 'light' && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 w-full text-left ${
                    theme === 'dark'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium block text-gray-900 dark:text-white">Koyu Tema</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Göz dostu karanlık mod</span>
                  </div>
                  {theme === 'dark' && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 w-full text-left ${
                    theme === 'system'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Monitor className={`w-5 h-5 ${theme === 'system' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`} />
                  <div className="text-left flex-1">
                    <span className="text-sm font-medium block text-gray-900 dark:text-white">Sistem Teması</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Sistem ayarınızı takip eder</span>
                  </div>
                  {theme === 'system' && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Veri Yönetimi */}
        <div className="card p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Veri Yönetimi
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Verilerinizi yedekleyin ve geri yükleyin
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBackup}
                className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-400 text-white font-medium hover:opacity-90 transition-opacity duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Yedekle</span>
              </button>
              <button
                onClick={handleRestore}
                className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-green-500 to-green-400 text-white font-medium hover:opacity-90 transition-opacity duration-200"
              >
                <Upload className="w-4 h-4" />
                <span>Geri Yükle</span>
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Teknolojiler
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Electron', 'React', 'TypeScript', 'Tailwind CSS', 'Prisma', 'SQLite'].map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Özellikler
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Not alma ve etiketleme</li>
                <li>• Günlük görev yönetimi</li>
                <li>• Haftalık planlama</li>
                <li>• Çevrimdışı çalışma</li>
                <li>• Açık/koyu tema desteği</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Klavye Kısayolları */}
      <div className="card p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Klavye Kısayolları
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yeni not</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yeni görev</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">Ctrl+T</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Arama</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">Ctrl+F</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ayarlar</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">Ctrl+,</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tam ekran</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">F11</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Geliştirici araçları</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200">F12</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};