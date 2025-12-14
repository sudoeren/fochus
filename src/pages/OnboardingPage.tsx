import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Palette, 
  ChevronLeft, 
  Check, 
  Moon, 
  Sun, 
  Monitor, 
  ArrowRight,
  CheckSquare,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../components/ThemeProvider';

interface OnboardingPageProps {
  onComplete: () => void;
  onBackgroundChange: (bg: string) => void;
  onGlobalBgChange: (enabled: boolean) => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  onBackgroundChange,
  onGlobalBgChange
}) => {
  const { setTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [isGlobalBg, setIsGlobalBg] = useState(false);

  const steps = [
    { id: 1, title: 'Hoş Geldin', icon: Sparkles },
    { id: 2, title: 'Spotlight', icon: Search },
    { id: 3, title: 'Görünüm', icon: Palette },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme);
    setTheme(theme);
  };

  const finish = () => {
    setTheme(selectedTheme);
    onBackgroundChange('default');
    onGlobalBgChange(isGlobalBg);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex items-center justify-center p-6">
      
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-80 bg-zinc-50 dark:bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">FOCHUS</span>
            </div>

            <div className="space-y-2">
              {steps.map((s) => (
                <div 
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    step === s.id 
                      ? "bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800" 
                      : "text-zinc-500 dark:text-zinc-500"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    step === s.id 
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                      : "bg-zinc-200 dark:bg-zinc-800"
                  )}>
                    {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "font-medium",
                    step === s.id ? "text-zinc-900 dark:text-white" : ""
                  )}>{s.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block text-xs text-zinc-400">
            v1.0.0
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8 md:p-16 flex flex-col">
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Üretkenliğinizi <br/>
                    Yeniden Keşfedin
                  </h1>
                  <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Notlar, görevler ve odaklanma araçları tek bir yerde. Minimalist tasarım, maksimum verim.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <CheckSquare className="w-8 h-8 text-zinc-900 dark:text-white mb-4" />
                    <div className="font-bold mb-1">Görevler</div>
                    <div className="text-sm text-zinc-500">Projelerinizi yönetin</div>
                  </div>
                  <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                    <Sparkles className="w-8 h-8 text-zinc-900 dark:text-white mb-4" />
                    <div className="font-bold mb-1">Notlar</div>
                    <div className="text-sm text-zinc-500">Fikirlerinizi yakalayın</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Spotlight */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Her Şey Elinizin Altında
                  </h1>
                  <p className="text-lg text-zinc-500 dark:text-zinc-400">
                    Spotlight ile uygulamanın herhangi bir yerinden arama yapın veya yeni içerik oluşturun.
                  </p>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-6 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <kbd className="h-16 w-16 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border-b-4 border-zinc-200 dark:border-zinc-950 text-3xl font-bold text-zinc-900 dark:text-white shadow-sm">
                      /
                    </kbd>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 font-medium">
                    Sadece <span className="font-bold text-zinc-900 dark:text-white">/</span> tuşuna basarak Spotlight'ı açın.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Appearance */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Görünüm
                  </h1>
                  <p className="text-lg text-zinc-500 dark:text-zinc-400">
                    Çalışma ortamınızı kişiselleştirin.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light', label: 'Açık', icon: Sun },
                      { id: 'dark', label: 'Koyu', icon: Moon },
                      { id: 'system', label: 'Sistem', icon: Monitor }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTheme(t.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                          selectedTheme === t.id
                            ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-500'
                        )}
                      >
                        <t.icon className="w-6 h-6" />
                        <span className="font-medium text-sm">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <div 
                    onClick={() => setIsGlobalBg(!isGlobalBg)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                      isGlobalBg 
                        ? "border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800" 
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-900 dark:text-white">Genel Arka Plan</div>
                        <div className="text-xs text-zinc-500">Ana sayfa görselini tüm sayfalarda kullan</div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                      isGlobalBg ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white" : "border-zinc-300 dark:border-zinc-600"
                    )}>
                      {isGlobalBg && <Check className="w-3 h-3 text-white dark:text-zinc-900" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 mt-auto">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                step === 1 
                  ? "text-zinc-300 dark:text-zinc-700 cursor-not-allowed" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Geri
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              {step === 3 ? 'Başla' : 'Devam Et'}
              {step !== 3 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
