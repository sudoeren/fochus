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
  Calendar, 
  LogOut, 
  Download, 
  Upload, 
  Shield, 
  ChevronRight,
  Lock,
  Key,
  Eye,
  EyeOff,
  Image as ImageIcon,
  CheckSquare,
  FileText,
  Search,
  Zap,
  Globe
} from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';
import { authAPI } from '../services/api';

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

// 1. Profile Section (Updated - Compact)
const ProfileSection = ({ bgImage }: { bgImage: string }) => {
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(true); // Default to true
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<string | null>(null);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const userData = {
    name: "Kullanıcı",
    username: "kullaniciadi",
    joinDate: new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
  };

  const handleLogout = () => {
    if (confirm('Oturumu kapatmak istediğinize emin misiniz?')) {
      localStorage.removeItem('isAuthenticated');
      window.location.reload();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);
    setPasswordChangeError(null);
    setIsPasswordLoading(true);

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Yeni şifreler eşleşmiyor!');
      setIsPasswordLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordChangeError('Yeni şifre en az 6 karakter olmalıdır.');
      setIsPasswordLoading(false);
      return;
    }

    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      setPasswordChangeMessage('Şifre başarıyla güncellendi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Keep form open
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const isCustomBg = bgImage.startsWith('data:') || bgImage.startsWith('http') || bgImage.startsWith('blob:');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
      
      {/* User Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-black/20 group relative">
        
        {/* Logout Button - Positioned Top Right */}
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 hover:bg-red-500 hover:text-white backdrop-blur-md rounded-full text-white transition-all duration-300 group/logout"
          title="Oturumu Kapat"
        >
          <LogOut className="w-5 h-5" />
        </button>

        {/* Dynamic Background Header */}
        <div className="absolute top-0 left-0 w-full h-28 overflow-hidden"> {/* Reduced height */}
           {isCustomBg ? (
              <img src={bgImage} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" alt="Profile BG" />
           ) : (
              <>
                <img src="/light.png" className={cn("absolute inset-0 w-full h-full object-cover transition-opacity", bgImage === 'light' ? 'opacity-50' : 'opacity-0')} alt="Light BG" />
                <img src="/dark.png" className={cn("absolute inset-0 w-full h-full object-cover transition-opacity", bgImage === 'dark' ? 'opacity-50' : 'opacity-0')} alt="Dark BG" />
              </>
           )}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-900" />
        </div>
        
        <div className="relative pt-16 px-8 pb-6 flex flex-col items-center text-center">
           <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-0.5">{userData.name}</h2>
           <p className="text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2 text-sm">
             <User className="w-3.5 h-3.5" /> {userData.username}
           </p>

           <div className="flex gap-3 mb-6">
             <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-xs font-semibold border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
               <Calendar className="w-3.5 h-3.5" /> Katılım: {userData.joinDate}
             </div>
           </div>

           {/* Stats section */}
           <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">12</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Görev</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">5</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Not</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">2.5s</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Odak</div>
              </div>
           </div>
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Güvenlik & Şifre</h3>
            </div>
         </div>

         <form onSubmit={handlePasswordChange} className="space-y-3">
             {passwordChangeMessage && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-medium border border-emerald-100 dark:border-emerald-800">
                  {passwordChangeMessage}
                </div>
              )}
              {passwordChangeError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium border border-red-100 dark:border-red-800">
                  {passwordChangeError}
                </div>
              )}
             <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">Mevcut Şifre</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 pl-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <Key className="absolute left-3.5 top-3 w-3.5 h-3.5 text-zinc-400" />
                  <button 
                    type="button" 
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">Yeni Şifre</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      placeholder="Yeni şifreniz" 
                      className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                     <button 
                       type="button" 
                       onClick={() => setShowNewPassword(!showNewPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
                     >
                       {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-1">Tekrar</label>
                  <div className="relative">
                    <input 
                      type={showConfirmNewPassword ? "text" : "password"} 
                      placeholder="Şifreyi onaylayın" 
                      className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-500 transition-colors"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
             </div>
             <div className="pt-1 flex justify-end">
                <button 
                  type="submit"
                  disabled={isPasswordLoading}
                  className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-lg hover:opacity-90 transition-opacity text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPasswordLoading ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : 'Güncelle'}
                </button>
             </div>
           </form>
      </div>
    </div>
  );
};

// 2. Appearance Section
const AppearanceSection = ({ bgImage, onBgChange, isGlobalBg, onToggleGlobalBg }: { bgImage: string, onBgChange: (bg: string) => void, isGlobalBg: boolean, onToggleGlobalBg: (enabled: boolean) => void }) => {
  const { theme, setTheme } = useTheme();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onBgChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const ThemeCard = ({ id, label, icon: Icon, previewColors, isActive, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "relative group flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 w-full",
        isActive 
          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02] shadow-xl shadow-indigo-500/10" 
          : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg"
      )}
    >
      <div className="w-full h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3 overflow-hidden relative border border-zinc-200 dark:border-zinc-700">
        <div className={cn("absolute top-2 left-2 right-2 h-3 rounded-full opacity-50", previewColors.nav)} />
        <div className="absolute top-7 left-2 w-1/4 bottom-2 rounded-lg opacity-30 bg-zinc-400" />
        <div className="absolute top-7 right-2 left-[30%] h-10 rounded-lg opacity-80" style={{background: previewColors.primary}} />
        
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 backdrop-blur-[1px]">
            <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg transform scale-110">
              <Check className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "p-1.5 rounded-lg transition-colors",
          isActive ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold text-xs text-zinc-900 dark:text-white">{label}</span>
      </div>
    </button>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6">
      
      {/* App Theme */}
      <div>
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">Uygulama Teması</h3>
          <p className="text-xs text-zinc-500">Arayüz renklerinizi seçin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ThemeCard 
            isActive={theme === 'light'}
            onClick={() => setTheme('light')}
            label="Açık Mod" 
            icon={Sun} 
            previewColors={{ nav: 'bg-zinc-200', primary: '#4f46e5' }} 
          />
          <ThemeCard 
            isActive={theme === 'dark'}
            onClick={() => setTheme('dark')}
            label="Koyu Mod" 
            icon={Moon} 
            previewColors={{ nav: 'bg-zinc-700', primary: '#6366f1' }} 
          />
          <ThemeCard 
            isActive={theme === 'system'}
            onClick={() => setTheme('system')}
            label="Sistem" 
            icon={Laptop} 
            previewColors={{ nav: 'bg-zinc-400', primary: '#818cf8' }} 
          />
        </div>
      </div>

      {/* Global Background Toggle */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            isGlobalBg ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          )}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Genel Arka Plan</h4>
            <p className="text-xs text-zinc-500">Ana sayfa görselini tüm sayfalarda kullan</p>
          </div>
        </div>
        <button
          onClick={() => onToggleGlobalBg(!isGlobalBg)}
          className={cn(
            "w-12 h-7 rounded-full p-1 transition-colors duration-300",
            isGlobalBg ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
          )}
        >
          <div className={cn(
            "w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300",
            isGlobalBg ? "translate-x-5" : "translate-x-0"
          )} />
        </button>
      </div>

      {/* Background Image */}
      <div>
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">Ana Sayfa Arka Planı</h3>
          <p className="text-xs text-zinc-500">Dashboard'da görünecek görseli seçin veya yükleyin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ThemeCard 
            isActive={bgImage === 'light'}
            onClick={() => onBgChange('light')}
            label="Aydınlık" 
            icon={Sun} 
            previewColors={{ nav: 'bg-sky-200', primary: '#0ea5e9' }} 
          />
          <ThemeCard 
            isActive={bgImage === 'dark'}
            onClick={() => onBgChange('dark')}
            label="Karanlık" 
            icon={Moon} 
            previewColors={{ nav: 'bg-indigo-900', primary: '#4338ca' }} 
          />
          
          {/* Upload Custom Image */}
          <div className="relative group w-full">
             <input 
               type="file" 
               accept="image/*" 
               onChange={handleImageUpload}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
             />
             <ThemeCard 
                isActive={bgImage !== 'light' && bgImage !== 'dark'}
                onClick={() => {}} // Controlled by input
                label="Görsel Yükle" 
                icon={Upload} 
                previewColors={{ nav: 'bg-emerald-200', primary: '#10b981' }} 
              />
          </div>
        </div>
      </div>

    </div>
  );
};

// 3. Spotlight Section
const SpotlightSection = ({ isEnabled, onToggle }: { isEnabled: boolean, onToggle: (enabled: boolean) => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
       {/* Hero Section */}
       <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-24 -mb-24" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold mb-2">Spotlight Arama</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Her yerden hızlıca arama yapın, sayfalara gidin veya eylemler gerçekleştirin.
              </p>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-mono text-sm border border-white/10">Ctrl</kbd>
                <span className="text-zinc-500">+</span>
                <kbd className="bg-white/10 px-3 py-1.5 rounded-lg text-white font-mono text-sm border border-white/10">K</kbd>
              </div>
            </div>
            
            {/* Mini Preview */}
            <div className="w-full md:w-72 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl opacity-80">
              <div className="flex items-center gap-3 text-zinc-300 border-b border-white/10 pb-3 mb-3">
                <Command className="w-4 h-4" />
                <span className="text-sm">Ara veya komut yaz...</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-3/4 bg-white/10 rounded" />
                <div className="h-2 w-1/2 bg-white/10 rounded" />
              </div>
            </div>
          </div>
       </div>

       {/* Settings Toggle */}
       <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-100 dark:border-zinc-800">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={cn(
                 "p-3 rounded-xl transition-colors",
                 isEnabled ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
               )}>
                 <Command className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="font-bold text-lg text-zinc-900 dark:text-white">Spotlight'ı Etkinleştir</h4>
                 <p className="text-sm text-zinc-500 dark:text-zinc-400">Ctrl + K kısayolu ile hızlı aramayı kullanın.</p>
               </div>
            </div>
            
            <button
              onClick={() => onToggle(!isEnabled)}
              className={cn(
                "w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
                isEnabled ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300",
                isEnabled ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
         </div>
       </div>

       {/* Tips - Redesigned */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
             <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
               <Search className="w-4 h-4" />
             </div>
             <h5 className="font-bold text-indigo-900 dark:text-indigo-100 mb-1">Hızlı Arama</h5>
             <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
               Notlarınız, görevleriniz ve sayfalarınız arasında anında arama yapın.
             </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-500/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-500/20">
             <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
               <Zap className="w-4 h-4" />
             </div>
             <h5 className="font-bold text-purple-900 dark:text-purple-100 mb-1">Hızlı Eylemler</h5>
             <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
               Yeni not oluşturma veya tema değiştirme gibi işlemleri klavyeden yapın.
             </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
             <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
               <CheckSquare className="w-4 h-4" />
             </div>
             <h5 className="font-bold text-emerald-900 dark:text-emerald-100 mb-1">Görev Yönetimi</h5>
             <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
               Görevlerinizi arayın ve durumlarını değiştirmek için üzerine tıklayın.
             </p>
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

// 5. About Section (Restored - Colorful & Vibrant)
const AboutSection = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
      {/* Hero Card */}
      <div className="bg-zinc-900 dark:bg-black text-white rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-2xl group">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-colors duration-700" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden p-2">
            <img src="/logo.svg" alt="Fochus Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-3">FOCHUS</h2>
          <p className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Minimalist, odaklanma dostu ve tamamen kişiselleştirilebilir üretkenlik asistanınız.
          </p>
          <div className="mt-8">
             <span className="px-5 py-2 bg-white/10 rounded-full text-sm font-mono border border-white/10 backdrop-blur-md">v1.2.0</span>
          </div>
        </div>
      </div>

      {/* Developer & Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Developer Card - Eren Çakar Special */}
        <a 
          href="https://erencakar.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative overflow-hidden bg-zinc-900 dark:bg-black text-white p-8 rounded-[2.5rem] group hover:scale-[1.02] transition-all duration-500 shadow-2xl border border-zinc-800 flex flex-col justify-between min-h-[180px]"
        >
           {/* Background Effects */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
           
           <div className="relative z-10 flex justify-between items-start">
             <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 text-indigo-300">
               <Globe className="w-6 h-6" />
             </div>
             <div className="p-2 bg-white/5 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/20 transition-all">
               <ChevronRight className="w-5 h-5" />
             </div>
           </div>
           
           <div className="relative z-10 mt-auto">
             <h4 className="text-3xl font-bold tracking-tight mb-1 group-hover:text-indigo-200 transition-colors">Eren Çakar</h4>
             <p className="text-sm text-zinc-400 font-medium tracking-wide opacity-80">erencakar.com</p>
           </div>
        </a>

        {/* Links Column */}
        <div className="flex flex-col gap-4">
          
          {/* GitHub Link */}
          <a 
            href="https://github.com/metehan-kaya/fochus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-6 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-zinc-900/10"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 dark:bg-black/10 rounded-full">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.26.96-.27 1.98-.405 3-.405 1.02 0 2.04.135 3 .405 2.28-1.575 3.285-1.26 3.285-1.26.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-lg">Kaynak Kod</h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">GitHub'da İncele</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Website Link */}
          <a 
            href="https://fochus.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-indigo-600 p-6 rounded-[2rem] flex items-center justify-between group hover:scale-[1.02] transition-transform duration-300 shadow-xl shadow-indigo-500/20 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Web Sitesi</h4>
                <p className="text-xs text-indigo-200">fochus.app</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
          </a>

        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---

interface SettingsProps {
  bgImage?: string;
  onBgChange?: (bg: string) => void;
  isGlobalBg: boolean;
  onToggleGlobalBg: (enabled: boolean) => void;
  isSpotlightEnabled: boolean;
  onToggleSpotlight: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  bgImage = 'light', 
  onBgChange = () => {},
  isGlobalBg,
  onToggleGlobalBg,
  isSpotlightEnabled,
  onToggleSpotlight
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch(activeTab) {
      case 'profile': return <ProfileSection bgImage={bgImage} />;
      case 'appearance': return <AppearanceSection bgImage={bgImage} onBgChange={onBgChange} isGlobalBg={isGlobalBg} onToggleGlobalBg={onToggleGlobalBg} />;
      case 'spotlight': return <SpotlightSection isEnabled={isSpotlightEnabled} onToggle={onToggleSpotlight} />;
      case 'data': return <DataSection />;
      case 'about': return <AboutSection />;
      default: return <ProfileSection bgImage={bgImage} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* Header Area - Fixed at top */}
      <div className="flex-none pt-8 pb-6 px-6 lg:px-10 flex flex-col items-center z-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">Ayarlar</h1>
        
        {/* Segmented Control Navigation */}
        <div className="p-1 bg-white dark:bg-zinc-900 rounded-full shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-1">
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

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 lg:px-10">
        <div className="max-w-4xl mx-auto py-4">
          {renderContent()}
        </div>
      </div>

    </div>
  );
};