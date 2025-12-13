import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  Command, 
  Database, 
  Info, 
  Moon, 
  Sun, 
  Laptop, 
  Check, 
  Mail, 
  Calendar, 
  Award, 
  LogOut, 
  Download, 
  Upload, 
  Shield, 
  Camera,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// --- Tab Component ---
const SettingsTab = ({ 
  active, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string; 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap",
      active 
        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md transform scale-105" 
        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

// --- Sections ---

// 1. Profile Section
const ProfileSection = () => {
  const userData = {
    name: "Metehan Kaya",
    email: "metehan@fochus.app",
    role: "Pro Üye",
    joinDate: "12 Aralık 2023",
    avatar: "M"
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
        
        <div className="relative flex flex-col items-center text-center pt-8">
           <div className="relative mb-6">
             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
               <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center text-5xl font-bold text-zinc-800 dark:text-white">
                 {userData.avatar}
               </div>
             </div>
             <button className="absolute bottom-1 right-1 p-2 bg-zinc-900 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors">
               <Camera className="w-4 h-4" />
             </button>
           </div>
           
           <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">{userData.name}</h2>
           <p className="text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
             <Mail className="w-4 h-4" /> {userData.email}
           </p>

           <div className="flex gap-4 mb-8">
             <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-2">
               <Award className="w-4 h-4" /> {userData.role}
             </div>
             <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm font-semibold border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
               <Calendar className="w-4 h-4" /> {userData.joinDate}
             </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-8">
           <div className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
             <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">142</div>
             <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Görev</div>
           </div>
           <div className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
             <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">56</div>
             <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Not</div>
           </div>
           <div className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
             <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">38s</div>
             <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Odak</div>
           </div>
        </div>
      </div>

      <button className="w-full py-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" />
        Oturumu Kapat
      </button>
    </div>
  );
};

// 2. Appearance Section
const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();

  const ThemeCard = ({ id, label, icon: Icon, previewColors }: any) => (
    <button
      onClick={() => setTheme(id)}
      className={cn(
        "relative group flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300",
        theme === id 
          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02] shadow-xl shadow-indigo-500/10" 
          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
      )}
    >
      <div className="w-full aspect-video rounded-2xl bg-zinc-100 dark:bg-zinc-800 mb-6 overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
        {/* Mock Interface Preview */}
        <div className={cn("absolute top-2 left-2 right-2 h-4 rounded-full opacity-50", previewColors.nav)} />
        <div className="absolute top-8 left-2 w-1/4 bottom-2 rounded-xl opacity-30 bg-zinc-400" />
        <div className="absolute top-8 right-2 left-[30%] h-12 rounded-xl opacity-80" style={{background: previewColors.primary}} />
        <div className="absolute top-24 right-2 left-[30%] bottom-2 rounded-xl opacity-40 bg-zinc-300" />
        
        {theme === id && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[1px]">
            <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg transform scale-110">
              <Check className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl transition-colors",
          theme === id ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg text-zinc-900 dark:text-white">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Arayüz Teması</h3>
        <p className="text-zinc-500">Çalışma ortamınızın nasıl görüneceğini seçin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemeCard 
          id="light" 
          label="Açık Mod" 
          icon={Sun} 
          previewColors={{ nav: 'bg-zinc-200', primary: '#4f46e5' }} 
        />
        <ThemeCard 
          id="dark" 
          label="Koyu Mod" 
          icon={Moon} 
          previewColors={{ nav: 'bg-zinc-700', primary: '#6366f1' }} 
        />
        <ThemeCard 
          id="system" 
          label="Sistem" 
          icon={Laptop} 
          previewColors={{ nav: 'bg-zinc-400', primary: '#818cf8' }} 
        />
      </div>
    </div>
  );
};

// 3. Spotlight Section
const SpotlightSection = () => {
  // Using simple state here for demo, ideally this comes from a context or parent
  const [items, setItems] = useState([
    { id: 'dashboard', label: 'Dashboard', enabled: true },
    { id: 'notes', label: 'Notlar', enabled: true },
    { id: 'tasks', label: 'Görevler', enabled: true },
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-[2.5rem] p-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left">
              <h3 className="text-3xl font-bold mb-2">Spotlight Arama</h3>
              <p className="text-zinc-400 text-lg">
                <kbd className="bg-white/10 px-2 py-1 rounded-lg text-white font-mono mx-1">⌘</kbd>
                +
                <kbd className="bg-white/10 px-2 py-1 rounded-lg text-white font-mono mx-1">K</kbd>
                ile her şeye ulaşın.
              </p>
            </div>
            <div className="w-full md:w-1/2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl">
              <div className="flex items-center gap-3 text-zinc-400 border-b border-white/10 pb-3 mb-3">
                <Command className="w-5 h-5" />
                <span>Nereye gitmek istersiniz?</span>
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-white/10 rounded-lg w-3/4" />
                <div className="h-8 bg-white/5 rounded-lg w-1/2" />
              </div>
            </div>
          </div>
       </div>

       <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-100 dark:border-zinc-800">
         <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
           <Command className="w-5 h-5 text-indigo-500" />
           Arama Menüsü Düzeni
         </h4>
         <div className="space-y-3">
           {items.map(item => (
             <div key={item.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <GripVertical className="w-5 h-5 text-zinc-400 cursor-move" />
               <span className="font-medium flex-1">{item.label}</span>
               <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.enabled ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};

// 4. Data Section
const DataSection = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-blue-600 rounded-[2.5rem] p-8 text-left transition-transform hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
          <Download className="w-10 h-10 text-white mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">Yedekle</h3>
          <p className="text-indigo-100">Tüm verilerinizi JSON formatında cihazınıza indirin.</p>
        </button>

        <button className="group relative overflow-hidden bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] p-8 text-left border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">
          <Upload className="w-10 h-10 text-zinc-400 group-hover:text-emerald-500 mb-6 transition-colors" />
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Geri Yükle</h3>
          <p className="text-zinc-500">Yedek dosyanızı sürükleyin veya seçin.</p>
        </button>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] p-6 flex items-start gap-4 border border-emerald-100 dark:border-emerald-500/20">
        <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-emerald-600 dark:text-emerald-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Uçtan Uca Yerel</h4>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
            Verileriniz asla buluta gönderilmez. Tarayıcınızın yerel depolama alanında güvenle saklanır.
          </p>
        </div>
      </div>
    </div>
  );
};

// 5. About Section (New)
const AboutSection = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-zinc-900 dark:bg-black text-white rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white text-zinc-900 rounded-3xl flex items-center justify-center text-6xl font-bold shadow-xl mb-6">
            F
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-4">FOCHUS</h2>
          <p className="text-xl text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Açık kaynaklı, gizlilik odaklı ve minimalist kişisel üretkenlik asistanı.
          </p>
          <div className="mt-8 flex gap-4">
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-mono border border-white/10">v1.2.0</span>
            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">Stable</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Geliştirici</h3>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
            Bu proje, modern web teknolojileri kullanılarak geliştirilmiş açık kaynaklı bir inisiyatiftir. Katkıda bulunmak isterseniz GitHub deposunu ziyaret edebilirsiniz.
          </p>
          <a href="#" className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            GitHub Profili <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Lisans</h3>
          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
            FOCHUS, MIT Lisansı altında yayınlanmıştır. Bu, yazılımı özgürce kullanabileceğiniz, değiştirebileceğiniz ve dağıtabileceğiniz anlamına gelir.
          </p>
          <a href="#" className="inline-flex items-center text-zinc-900 dark:text-white font-semibold hover:underline">
            Lisans Detayları <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return <ProfileSection />;
      case 'appearance': return <AppearanceSection />;
      case 'spotlight': return <SpotlightSection />;
      case 'data': return <DataSection />;
      case 'about': return <AboutSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white/50 dark:bg-black p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-8">Ayarlar</h1>
          
          {/* Segmented Control Navigation */}
          <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-full shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-1">
            <SettingsTab 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
              icon={User} 
              label="Profil" 
            />
            <SettingsTab 
              active={activeTab === 'appearance'} 
              onClick={() => setActiveTab('appearance')} 
              icon={Palette} 
              label="Görünüm" 
            />
            <SettingsTab 
              active={activeTab === 'spotlight'} 
              onClick={() => setActiveTab('spotlight')} 
              icon={Command} 
              label="Spotlight" 
            />
            <SettingsTab 
              active={activeTab === 'data'} 
              onClick={() => setActiveTab('data')} 
              icon={Database} 
              label="Veri" 
            />
            <SettingsTab 
              active={activeTab === 'about'} 
              onClick={() => setActiveTab('about')} 
              icon={Info} 
              label="Hakkında" 
            />
          </div>
        </div>

        {/* Content Area with Animation */}
        <div className="min-h-[500px] pb-20">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};
