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
  Layers,
  Command,
  Keyboard,
  Laptop
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
  { id: 'profile', label: 'Profilim', enabled: true },
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
    { id: 'appearance', label: 'Görünüm', icon: Palette, description: 'Tema ve renkler' },
    { id: 'spotlight', label: 'Spotlight', icon: Command, description: 'Arama ve kısayollar' },
    { id: 'data', label: 'Veri & Yedekleme', icon: Database, description: 'İçe/Dışa aktarma' },
    { id: 'about', label: 'Hakkında', icon: Info, description: 'Sürüm bilgileri' },
  ];

  return (
    <div className="flex h-full bg-gray-50 dark:bg-black overflow-hidden">
      
      {/* Settings Sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex flex-col backdrop-blur-xl">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ayarlar</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Uygulama tercihlerinizi yönetin</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-blue-100 dark:bg-blue-900/40' 
                    : 'bg-gray-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-700'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-zinc-500'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-zinc-200'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-700/70 dark:text-blue-300/70' : 'text-gray-500 dark:text-zinc-500'}`}>
                    {tab.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-500 dark:text-blue-400" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
        <div className="max-w-4xl mx-auto p-8 lg:p-12 space-y-10">
          
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Görünüm</h2>
                <p className="text-lg text-gray-500 dark:text-zinc-400">Uygulamanın görünümünü ve hissini kişiselleştirin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'light', label: 'Açık Mod', icon: Sun, desc: 'Gündüz kullanımı için ideal' },
                  { id: 'dark', label: 'Koyu Mod', icon: Moon, desc: 'Göz yormayan karanlık tema' },
                  { id: 'system', label: 'Sistem', icon: Laptop, desc: 'Cihaz ayarlarına uyum sağlar' }
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`
                        relative flex flex-col items-start p-6 rounded-3xl border-2 transition-all duration-200 text-left group
                        ${isSelected 
                          ? 'border-blue-500 bg-white dark:bg-zinc-900 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/10' 
                          : 'border-transparent bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 shadow-sm'
                        }
                      `}
                    >
                      <div className={`p-3 rounded-2xl mb-4 ${
                        isSelected 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 group-hover:scale-110 transition-transform'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-lg font-bold mb-1 ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>
                        {t.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-zinc-500 leading-relaxed">
                        {t.desc}
                      </span>
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spotlight Tab */}
          {activeTab === 'spotlight' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Spotlight</h2>
                  <p className="text-lg text-gray-500 dark:text-zinc-400">Hızlı arama (Ctrl+K) menüsünü özelleştirin.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={resetSettings}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    Varsayılan
                  </button>
                  {hasChanges && (
                    <button 
                      onClick={saveSettings}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Değişiklikleri Kaydet
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-purple-500" />
                  Görünürlük Ayarları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                        <Layers className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Navigasyon</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Sayfa geçiş komutları</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={spotlightSettings.showNavigation !== false}
                        onChange={(e) => updateSpotlightSetting('showNavigation', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                        <Zap className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Hızlı Eylemler</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Yeni oluşturma komutları</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={spotlightSettings.showQuickActions !== false}
                        onChange={(e) => updateSpotlightSetting('showQuickActions', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  Menü Sıralaması
                </h3>
                
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="spotlight-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {spotlightOrder.map((item: SpotlightItem, index: number) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`
                                  flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-2xl border transition-all duration-200
                                  ${snapshot.isDragging 
                                    ? 'shadow-xl border-blue-500 z-50 bg-white dark:bg-zinc-800 scale-105' 
                                    : 'border-transparent hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800'
                                  }
                                `}
                              >
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-blue-500 cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 font-semibold text-gray-700 dark:text-zinc-200">{item.label}</div>
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
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Veri & Yedekleme</h2>
                <p className="text-lg text-gray-500 dark:text-zinc-400">Verilerinizin kontrolü tamamen sizde.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={handleBackup}
                  className="relative overflow-hidden flex flex-col items-center justify-center p-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/20 group transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
                    <Download className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Yedekle</h3>
                  <p className="text-sm text-blue-100 text-center px-4 leading-relaxed">
                    Tüm ayarlarınızı ve verilerinizi güvenli bir JSON dosyası olarak indirin.
                  </p>
                </button>

                <button
                  onClick={handleRestore}
                  className="relative overflow-hidden flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all group"
                >
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Geri Yükle</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 text-center px-4 leading-relaxed">
                    Daha önce aldığınız yedeği yükleyerek verilerinizi geri getirin.
                  </p>
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 flex gap-4 items-start">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
                  <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-1">Gizlilik Garantisi</h4>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
                    Fokus, verilerinizi asla sunucularına göndermez. Tüm notlarınız, görevleriniz ve ayarlarınız sadece bu cihazda, tarayıcınızın <strong>LocalStorage</strong> alanında şifrelenmeden saklanır.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300 fade-in">
              <div className="bg-gradient-to-br from-zinc-900 to-black text-white rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <span className="text-5xl font-bold text-white">F</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4 tracking-tight">Fokus</h2>
                  <p className="text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Modern, hızlı ve odak odaklı kişisel üretkenlik asistanınız.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2">Sürüm Bilgisi</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">v1.0.0</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">Güncel</span>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2">Geliştirici</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">Fokus Team</div>
                  <a href="#" className="text-blue-500 hover:underline text-sm mt-1 inline-block">Web sitesini ziyaret et</a>
                </div>
              </div>

              <div className="text-center text-sm text-gray-400 dark:text-zinc-600 pt-8">
                &copy; 2025 Fokus App. Tüm hakları saklıdır.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};