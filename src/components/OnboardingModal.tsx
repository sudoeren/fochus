import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Sparkles, Palette, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  defaultTheme?: 'light' | 'dark' | 'system';
  defaultBackground?: 'light' | 'dark';
  onBackgroundChange: (bg: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  defaultTheme = 'dark',
  defaultBackground = 'dark',
  onBackgroundChange
}) => {
  const { setTheme } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(defaultTheme);
  const [selectedBg, setSelectedBg] = useState<'light' | 'dark'>(defaultBackground);

  const steps = useMemo(() => [1, 2, 3] as const, []);

  if (!isOpen) return null;

  const goNext = () => {
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as any)));
  };

  const goPrev = () => {
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as any)));
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme);
    setTheme(theme);
  };

  const applyBg = (bg: 'light' | 'dark') => {
    setSelectedBg(bg);
    onBackgroundChange(bg);
  };

  const finish = () => {
    // Ensure final selections are applied
    setTheme(selectedTheme);
    onBackgroundChange(selectedBg);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white dark:text-zinc-900" />
            </div>
            <div>
              <div className="text-lg font-bold text-zinc-900 dark:text-white">Hoş geldin</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Kurulum · {step}/{steps.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 w-8 rounded-full transition-colors',
                  s === step ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'
                )}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">FOCHUS nedir?</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Notlar, görevler ve odak zamanlayıcısı tek yerde. Amaç: daha az dağınıklık, daha net akış.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">Görevler</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Listelerle düzenle, hızlıca tamamla.</div>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">Notlar</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Zengin içerikle yakala, sonra geri dön.</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  <Search className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Spotlight</h2>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Ctrl + K ile hızlı aramayı aç. Not, görev ve sayfalara anında git.
              </p>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">İpucu</div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-white">Arama kutusuna yazmaya başla</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Enter ile aç, Esc ile kapat.</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Palette className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Görünüm</h2>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Tema</div>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: 'dark', label: 'Koyu' },
                    { id: 'light', label: 'Açık' },
                    { id: 'system', label: 'Sistem' }
                  ] as const).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTheme(t.id)}
                      className={cn(
                        'p-3 rounded-2xl border text-sm font-semibold transition-colors',
                        selectedTheme === t.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  <ImageIcon className="w-4 h-4" /> Arka Plan
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: 'dark', label: 'Koyu Duvar Kağıdı' },
                    { id: 'light', label: 'Açık Duvar Kağıdı' }
                  ] as const).map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => applyBg(bg.id)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-colors',
                        selectedBg === bg.id
                          ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      <div className="text-sm font-semibold">{bg.label}</div>
                      <div className={cn('text-xs mt-1', selectedBg === bg.id ? 'text-white/70 dark:text-zinc-700' : 'text-zinc-500 dark:text-zinc-400')}>
                        İstersen daha sonra Ayarlar’dan değiştirebilirsin.
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" /> Geri
          </button>

          {step < 3 ? (
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            >
              Devam <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            >
              Başla <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
