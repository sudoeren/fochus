import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Sparkles, Palette, Image as ImageIcon, Check, Monitor, Moon, Sun, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  defaultTheme?: 'light' | 'dark' | 'system';
  defaultBackground?: 'light' | 'dark' | 'default';
  onBackgroundChange: (bg: string) => void;
  onGlobalBgChange?: (enabled: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  defaultTheme = 'dark',
  defaultBackground = 'default',
  onBackgroundChange,
  onGlobalBgChange
}) => {
  const { setTheme } = useTheme();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(defaultTheme);
  const [isGlobalBg, setIsGlobalBg] = useState(false);

  const steps = useMemo(() => [1, 2, 3] as const, []);

  if (!isOpen) return null;

  const goNext = () => {
    if (step === 3) {
      finish();
    } else {
      setStep((prev) => (prev + 1) as any);
    }
  };

  const goPrev = () => {
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as any)));
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme);
    setTheme(theme);
  };

  const finish = () => {
    setTheme(selectedTheme);
    onBackgroundChange('default');
    if (onGlobalBgChange) {
      onGlobalBgChange(isGlobalBg);
    }
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg shadow-zinc-200 dark:shadow-none">
              <Sparkles className="w-6 h-6 text-white dark:text-zinc-900" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Fokus'a Hoş Geldin</div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Adım {step} / {steps.length}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {steps.map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-500',
                  s === step ? 'w-8 bg-zinc-900 dark:bg-white' : 'w-2.5 bg-zinc-200 dark:bg-zinc-800'
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Üretkenliğin Yeni Merkezi</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                  Notlarınızı, görevlerinizi ve zamanınızı tek bir yerden yönetin. Dağınıklığı ortadan kaldırın.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Görev Yönetimi</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Projelerinizi listelere bölün, alt görevler oluşturun ve ilerlemenizi takip edin.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Akıllı Notlar</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Zengin metin editörü ile fikirlerinizi yakalayın, etiketleyin ve organize edin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <Search className="w-8 h-8 text-zinc-900 dark:text-white" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Spotlight ile Hızlanın</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                  Uygulamanın herhangi bir yerinden arama yapmak için kısayolu kullanın.
                </p>
              </div>

              <div className="bg-zinc-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl -ml-24 -mb-24" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="flex items-center gap-3 text-2xl font-mono bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-md">
                    <span className="text-zinc-400">Ctrl</span>
                    <span className="text-zinc-600">+</span>
                    <span className="text-white font-bold">K</span>
                  </div>
                  <p className="text-zinc-300 max-w-sm">
                    Notlarınızı, görevlerinizi arayın veya yeni içerik oluşturun. Farenizi kullanmanıza gerek yok.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Deneyiminizi Kişiselleştirin</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md mx-auto">
                  Size en uygun görünümü seçin.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Tema Seçimi</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'light', label: 'Açık', icon: Sun },
                      { id: 'dark', label: 'Koyu', icon: Moon },
                      { id: 'system', label: 'Sistem', icon: Monitor }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTheme(t.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200',
                          selectedTheme === t.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        )}
                      >
                        <t.icon className="w-6 h-6" />
                        <span className="font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Arka Plan Tercihi</label>
                  <div 
                    onClick={() => setIsGlobalBg(!isGlobalBg)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                      isGlobalBg 
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20" 
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        isGlobalBg ? "bg-indigo-200 dark:bg-indigo-500/40 text-indigo-700 dark:text-indigo-200" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                      )}>
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">Genel Arka Plan</div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">Ana sayfa görselini tüm sayfalarda kullan</div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      isGlobalBg ? "bg-indigo-600 border-indigo-600" : "border-zinc-300 dark:border-zinc-600"
                    )}>
                      {isGlobalBg && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={goPrev}
            disabled={step === 1}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-colors",
              step === 1 
                ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed" 
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Geri
          </button>

          <button
            onClick={goNext}
            className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-zinc-200 dark:shadow-none"
          >
            {step === 3 ? 'Başla' : 'Devam Et'}
            {step !== 3 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
