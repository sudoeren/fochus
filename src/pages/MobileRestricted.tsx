import React from 'react';
import { Laptop, Smartphone, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/ThemeProvider';

export const MobileRestricted: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-sm px-5">
        <div className="backdrop-blur-2xl bg-white/85 dark:bg-zinc-950/85 border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xl shadow-zinc-300/30 dark:shadow-black/60 rounded-[24px] p-8 transform transition-all duration-500">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
              alt="Fokus Logo"
              className="h-12 w-12 object-contain"
            />
          </div>

          {/* Icon Composition */}
          <div className="relative flex justify-center items-center mb-8 h-28">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-0.5 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-full" />

            <div className="absolute left-6 top-1/2 -translate-y-1/2 transform -rotate-12 opacity-50 blur-[1px] scale-90">
              <div className="relative p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                <Smartphone className="w-7 h-7 text-rose-400 dark:text-rose-500/50" />
                <div className="absolute -top-1.5 -right-1.5 bg-rose-500 rounded-full p-0.5 shadow-lg">
                  <X className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <ArrowRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 animate-pulse" />
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 transform rotate-6 z-10">
              <div className="relative p-5 bg-gradient-to-br from-white to-indigo-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)] animate-[float_6s_ease-in-out_infinite]">
                <Laptop
                  className="w-11 h-11 text-indigo-600 dark:text-indigo-400"
                  strokeWidth={1.5}
                />
                <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/10 blur-xl rounded-full" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                {t('mobile_restricted.title')}
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
              {t('mobile_restricted.description')}
            </p>

            <div className="pt-6">
              <div className="flex items-center justify-center gap-3 px-5 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg shadow-zinc-900/10 transition-all active:scale-[0.98]">
                <Laptop className="w-4 h-4" />
                <span className="text-xs font-bold tracking-wide">
                  {t('mobile_restricted.instruction')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
};
