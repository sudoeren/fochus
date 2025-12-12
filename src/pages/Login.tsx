import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex bg-white dark:bg-black transition-colors duration-300">
      {/* Left Side - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Fokus</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-tight">
              Üretkenliğinizi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                bir üst seviyeye
              </span>
              <br /> taşıyın.
            </h1>
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              Notlar, görevler ve planlama tek bir yerde. Minimalist tasarım, maksimum odaklanma.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                'Sınırsız not alma ve organize etme',
                'Akıllı görev yönetimi ve hatırlatıcılar',
                'Pomodoro sayacı ile odaklanma',
                'Detaylı verimlilik istatistikleri'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-zinc-500">
            © 2025 Fokus App. Tüm hakları saklıdır.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white text-2xl font-bold">F</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Tekrar Hoşgeldiniz
            </h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Hesabınıza giriş yaparak kaldığınız yerden devam edin.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <button
              onClick={onLogin}
              className="group relative w-full flex items-center justify-center gap-3 py-4 px-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-medium">Google ile Devam Et</span>
              <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-zinc-400" />
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-black text-zinc-500">
                  Güvenli Giriş
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
              Devam ederek <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-300">Kullanım Koşulları</a> ve <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-300">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
