import React from 'react';
import { Laptop, Smartphone, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MobileRestricted: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-8 transform transition-all hover:scale-[1.02] duration-500">
          {/* Icon Composition */}
          <div className="relative flex justify-center items-center mb-10 h-32">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-1 bg-gradient-to-r from-rose-500/20 to-indigo-500/20 rounded-full" />

            {/* Mobile Icon (Dimmed & Left) */}
            <div className="absolute left-10 top-1/2 -translate-y-1/2 transform -rotate-12 opacity-50 blur-[1px] scale-90">
              <div className="relative p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                <Smartphone className="w-8 h-8 text-rose-400 dark:text-rose-500/50" />
                <div className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 shadow-lg">
                  <X className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 animate-pulse" />
            </div>

            {/* Desktop Icon (Highlighted & Right) */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 transform rotate-6 z-10">
              <div className="relative p-5 bg-gradient-to-br from-white to-indigo-50 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl border border-indigo-100 dark:border-indigo-500/30 shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)] animate-[float_6s_ease-in-out_infinite]">
                <Laptop
                  className="w-12 h-12 text-indigo-600 dark:text-indigo-400"
                  strokeWidth={1.5}
                />
                {/* Screen Glow */}
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

            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
              {t('mobile_restricted.description')}
            </p>

            <div className="pt-6">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
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
