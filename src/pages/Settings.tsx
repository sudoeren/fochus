import React from 'react';
import { Monitor, Moon, Sun, Download, Upload, Info } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';

export const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Ayarlar
      </h1>

      {/* Görünüm Ayarları */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Görünüm
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tema
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-sm font-medium">Açık</span>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium">Koyu</span>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'system'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-sm font-medium">Sistem</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Veri Yönetimi */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Veri Yönetimi
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Verileri Dışa Aktar
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tüm notlarınızı ve görevlerinizi JSON formatında dışa aktarın
              </p>
            </div>
            <button className="btn btn-secondary px-4 py-2 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Dışa Aktar</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Verileri İçe Aktar
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Daha önce dışa aktarılan verileri geri yükleyin
              </p>
            </div>
            <button className="btn btn-secondary px-4 py-2 flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>İçe Aktar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uygulama Bilgileri */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Uygulama Hakkında
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Info className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Fokus
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kişisel Üretkenlik Uygulaması
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Sürüm 1.0.0
              </p>
            </div>
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

      {/* Klavye Kısayolları */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Klavye Kısayolları
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yeni not</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl+N</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yeni görev</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl+T</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Arama</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl+F</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ayarlar</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">Ctrl+,</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tam ekran</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">F11</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Geliştirici araçları</span>
              <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">F12</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
