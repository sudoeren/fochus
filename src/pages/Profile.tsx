import React from 'react';
import { User, Mail, LogOut, Shield, Calendar, Edit2, Camera, Zap, Award, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout }) => {
  // Mock user data
  const user = {
    name: "Metehan Kaya",
    email: "metehan@fokus.app",
    joinDate: "12 Aralık 2023",
    plan: "Pro Plan",
    stats: {
      completedTasks: 142,
      notesCreated: 56,
      focusHours: 38
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-black p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative group">
          <div className="h-48 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1000&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          <div className="absolute -bottom-16 left-8 lg:left-12 flex items-end">
            <div className="relative">
              <div className="h-32 w-32 rounded-3xl ring-4 ring-white dark:ring-black bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-400 shadow-xl overflow-hidden">
                {/* Placeholder Avatar or Initials */}
                <span className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {user.name.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div className="mb-4 ml-6 pb-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>

          <div className="absolute top-4 right-4 lg:top-auto lg:bottom-4 lg:right-6">
            <button
              onClick={onLogout}
              className="px-5 py-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200 dark:hover:border-red-900/50 transition-all shadow-sm font-medium flex items-center gap-2"
            >
              <LogOut size={18} />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </div>

        <div className="h-12"></div> {/* Spacer for overlapping avatar */}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="text-sm font-medium">Tamamlanan</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.completedTasks}</p>
                <p className="text-xs text-gray-400 mt-1">Görev</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Award size={18} />
                  </div>
                  <span className="text-sm font-medium">Notlar</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.notesCreated}</p>
                <p className="text-xs text-gray-400 mt-1">Oluşturuldu</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                    <Zap size={18} />
                  </div>
                  <span className="text-sm font-medium">Odaklanma</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.focusHours}s</p>
                <p className="text-xs text-gray-400 mt-1">Bu hafta</p>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Hesap Bilgileri</h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">Düzenle</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-500 dark:text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">E-posta Adresi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">Doğrulanmış</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl text-gray-500 dark:text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Katılım Tarihi</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Plan & Settings */}
          <div className="space-y-6">
            {/* Plan Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Shield className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="px-3 py-1 bg-yellow-400/20 text-yellow-300 text-xs font-bold rounded-full border border-yellow-400/20">PRO</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Pro Üyelik</h3>
                <p className="text-zinc-400 text-sm mb-6">Tüm özelliklere sınırsız erişiminiz var.</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span>Sınırsız Proje</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span>Gelişmiş İstatistikler</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 size={16} className="text-green-400" />
                    <span>Öncelikli Destek</span>
                  </div>
                </div>

                <button className="w-full py-2.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">
                  Planı Yönet
                </button>
              </div>
            </div>

            {/* Quick Settings */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-2">Tercihler</h4>
              <div className="space-y-1">
                <button className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group">
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Bildirim Ayarları</span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group">
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Gizlilik ve Güvenlik</span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-left group">
                  <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">Veri Dışa Aktar</span>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
