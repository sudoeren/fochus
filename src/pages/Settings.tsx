import React, { useState } from 'react';
import { 
  Monitor, 
  Moon, 
  Sun, 
  Search, 
  Save,
  RotateCcw,
  Info,
  Palette,
  Download,
  Upload,
  Database,
  Zap,
  GripVertical,
  Check,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface SpotlightItem {
  id: string;
  label: string;
  enabled: boolean;
}

type SettingsTab = 'general' | 'appearance' | 'spotlight' | 'data' | 'about';

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
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  
  const [spotlightOrder, setSpotlightOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('spotlightOrder');
      return saved ? JSON.parse(saved) : defaultSpotlightOrder;
    } catch {
      return defaultSpotlightOrder;
    }
  });
  
  const [spotlightSettings, setSpotlightSettings] = useState(() => 
    JSON.parse(localStorage.getItem('spotlightSettings') || '{}')
  );
  
  const [hasChanges, setHasChanges] = useState(false);

  const toggleItemEnabled = (id: string) => {
    const updatedOrder = spotlightOrder.map((item: SpotlightItem) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    setSpotlightOrder(updatedOrder);
    setHasChanges(true);
  };

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

  const saveSettings = () => {
    try {
      localStorage.setItem('spotlightOrder', JSON.stringify(spotlightOrder));
      const settings: any = {};
      spotlightOrder.forEach((item: SpotlightItem) => {
        settings[item.id] = item.enabled;
      });
      localStorage.setItem('spotlightSettings', JSON.stringify(settings));
      setHasChanges(false);
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

  const tabs = [
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'spotlight', label: 'Spotlight', icon: Search },
    { id: 'data', label: 'Veri & Yedekleme', icon: Database },
    { id: 'about', label: 'Hakkında', icon: Info },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
      
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">Uygulama tercihleri</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-white' 
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500 dark:text-white' : 'text-gray-400 dark:text-zinc-500'}`} />
                {tab.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-500 dark:text-zinc-500" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
        <div className="max-w-3xl mx-auto p-8 space-y-8">
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Görünüm</h2>
                <p className="text-gray-500 dark:text-zinc-400">Uygulamanın nasıl görüneceğini seçin.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tema</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Açık', icon: Sun },
                    { id: 'dark', label: 'Koyu', icon: Moon },
                    { id: 'system', label: 'Sistem', icon: Monitor }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={`
                          relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' 
                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                          }
                        `}
                      >
                        <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-100 dark:bg-blue-500 text-blue-600 dark:text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-zinc-300'}`}>
                          {t.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-blue-500 dark:text-blue-400">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Spotlight Tab */}
          {activeTab === 'spotlight' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Spotlight</h2>
                <p className="text-gray-500 dark:text-zinc-400">Hızlı arama ve komut menüsünü özelleştirin.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Genel Ayarlar</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                        <Layers className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Navigasyon</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Sayfa gezinme komutlarını göster</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={spotlightSettings.showNavigation !== false}
                        onChange={(e) => updateSpotlightSetting('showNavigation', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-zinc-700 rounded-lg shadow-sm">
                        <Zap className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Hızlı Eylemler</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Yeni not/görev oluşturma komutlarını göster</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={spotlightSettings.showQuickActions !== false}
                        onChange={(e) => updateSpotlightSetting('showQuickActions', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Komut Sıralaması</h3>
                  <div className="flex gap-2">
                    <button onClick={resetSettings} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg" title="Sıfırla">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    {hasChanges && (
                      <button onClick={saveSettings} className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Save className="w-4 h-4" /> Kaydet
                      </button>
                    )}
                  </div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="spotlight-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        {spotlightOrder.map((item: SpotlightItem, index: number) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  flex items-center gap-4 p-3 bg-white dark:bg-zinc-800/50 rounded-xl border transition-all
                                  ${snapshot.isDragging 
                                    ? 'shadow-lg border-blue-500 z-50 bg-blue-50 dark:bg-zinc-800' 
                                    : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                                  }
                                `}
                              >
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 font-medium text-gray-900 dark:text-zinc-200">{item.label}</div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={item.enabled}
                                    onChange={() => toggleItemEnabled(item.id)}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
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
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Veri & Yedekleme</h2>
                <p className="text-gray-500 dark:text-zinc-400">Verilerinizi yönetin, yedekleyin veya geri yükleyin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={handleBackup}
                  className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
                >
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Yedekle</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 text-center px-4">Ayarlarınızı ve verilerinizi JSON dosyası olarak indirin.</p>
                </button>

                <button
                  onClick={handleRestore}
                  className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-green-500 dark:hover:border-green-500 transition-all group"
                >
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Geri Yükle</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 text-center px-4">Daha önce alınan bir yedeği sisteme yükleyin.</p>
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Gizlilik Notu</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Tüm verileriniz sadece tarayıcınızın <strong>LocalStorage</strong> alanında saklanır. Hiçbir sunucuya gönderilmez.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hakkında</h2>
                <p className="text-gray-500 dark:text-zinc-400">Uygulama bilgileri ve sürüm.</p>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-center">
                <div className="w-20 h-20 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-white dark:text-black font-bold text-4xl">F</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Fokus</h3>
                <p className="text-gray-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                  Modern, hızlı ve odak odaklı kişisel üretkenlik asistanı.
                </p>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Sürüm</div>
                    <div className="text-lg font-mono text-gray-900 dark:text-white">v1.0.0</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                    <div className="text-xs text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-1">Platform</div>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">Web</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};