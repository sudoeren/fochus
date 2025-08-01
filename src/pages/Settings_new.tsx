import React, { useState } from 'react';
import { 
  Monitor, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Info, 
  Palette, 
  Database, 
  Search, 
  Zap,
  GripVertical,
  Save,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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

export const SettingsNew: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [spotlightSettings, setSpotlightSettings] = useState(() => 
    JSON.parse(localStorage.getItem('spotlightSettings') || '{}')
  );
  const [spotlightOrder, setSpotlightOrder] = useState(() => {
    const savedOrder = localStorage.getItem('spotlightOrder');
    return savedOrder ? JSON.parse(savedOrder) : defaultSpotlightOrder;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const updateSpotlightSetting = (key: string, value: any) => {
    const newSettings = { ...spotlightSettings, [key]: value };
    setSpotlightSettings(newSettings);
    localStorage.setItem('spotlightSettings', JSON.stringify(newSettings));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(spotlightOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSpotlightOrder(items);
    setHasChanges(true);
  };

  const toggleItemEnabled = (id: string) => {
    const updatedOrder = spotlightOrder.map((item: SpotlightItem) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setSpotlightOrder(updatedOrder);
    setHasChanges(true);
  };

  const saveOrder = () => {
    localStorage.setItem('spotlightOrder', JSON.stringify(spotlightOrder));
    setHasChanges(false);
  };

  const resetOrder = () => {
    setSpotlightOrder(defaultSpotlightOrder);
    setHasChanges(true);
  };

  const handleBackup = () => {
    const data = {
      settings: spotlightSettings,
      order: spotlightOrder,
      theme: theme
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fokus-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.settings) {
              setSpotlightSettings(data.settings);
              localStorage.setItem('spotlightSettings', JSON.stringify(data.settings));
            }
            if (data.order) {
              setSpotlightOrder(data.order);
              localStorage.setItem('spotlightOrder', JSON.stringify(data.order));
            }
            if (data.theme) {
              setTheme(data.theme);
            }
            alert('Ayarlar başarıyla geri yüklendi!');
          } catch (error) {
            alert('Geçersiz yedek dosyası!');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ayarlar</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Uygulamanızı istediğiniz gibi özelleştirin</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        
        {/* Görünüm Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Görünüm</h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">Tema Seçimi</div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  theme === 'light' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Sun className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Açık Tema</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Aydınlık arayüz</div>
                </div>
              </button>
              
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  theme === 'dark' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Moon className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Koyu Tema</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Karanlık arayüz</div>
                </div>
              </button>
              
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  theme === 'system' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Monitor className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Sistem</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Sistem ayarını takip et</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Spotlight Temel Ayarları */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <Search className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spotlight</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Navigasyon</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sayfa gezinme komutları</p>
              </div>
              <input
                type="checkbox"
                checked={spotlightSettings.showNavigation !== false}
                onChange={(e) => updateSpotlightSetting('showNavigation', e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>
            
            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Hızlı Eylemler</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Yeni görev/not ekleme</p>
              </div>
              <input
                type="checkbox"
                checked={spotlightSettings.showQuickActions !== false}
                onChange={(e) => updateSpotlightSetting('showQuickActions', e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
              />
            </label>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-3">Sıralama Algoritması</label>
              <select
                value={spotlightSettings.commandOrder || 'default'}
                onChange={(e) => updateSpotlightSetting('commandOrder', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="default">Varsayılan</option>
                <option value="alphabetical">Alfabetik</option>
                <option value="usage">Kullanım Sıklığı</option>
                <option value="category">Kategoriye Göre</option>
                <option value="custom">Özel Sıralama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Klavye Kısayolları */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kısayollar</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Spotlight</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hızlı arama açma</p>
              </div>
              <div className="flex gap-1">
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Ctrl</kbd>
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">K</kbd>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Yeni Not</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hızlı not ekleme</p>
              </div>
              <div className="flex gap-1">
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Ctrl</kbd>
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">N</kbd>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Yeni Görev</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hızlı görev ekleme</p>
              </div>
              <div className="flex gap-1">
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">Ctrl</kbd>
                <kbd className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">T</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Veri Yönetimi */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Veri Yönetimi</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleBackup}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Ayarları Yedekle</span>
            </button>
            
            <button
              onClick={handleRestore}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Ayarları Geri Yükle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spotlight Component Sıralama */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <GripVertical className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Spotlight Component Sıralaması</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Spotlight'ta görünen öğelerin sırasını değiştirin</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={resetOrder}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Sıfırla
            </button>
            {hasChanges && (
              <button
                onClick={saveOrder}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="spotlight-items">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {spotlightOrder.map((item: SpotlightItem, index: number) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border transition-all ${
                          snapshot.isDragging 
                            ? 'shadow-lg scale-105 border-blue-300 dark:border-blue-600' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <span className={`font-medium ${
                            item.enabled ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => toggleItemEnabled(item.id)}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                        </label>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Uygulama Bilgileri */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Info className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Uygulama Bilgileri</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-gray-500 dark:text-gray-400 mb-1">Versiyon</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">1.0.0</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-gray-500 dark:text-gray-400 mb-1">Platform</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">Electron</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-gray-500 dark:text-gray-400 mb-1">Framework</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">React</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-gray-500 dark:text-gray-400 mb-1">Database</div>
            <div className="font-bold text-lg text-gray-900 dark:text-white">SQLite</div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">Fokus</strong>, kişisel üretkenliğinizi artırmak için tasarlanmış modern bir masaüstü uygulamasıdır. 
            Notlar, görevler ve planlama araçlarını tek bir yerde birleştirir. Bu ayarlar sayfasından uygulamanızı 
            tamamen kişiselleştirebilir ve iş akışınızı optimize edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};
