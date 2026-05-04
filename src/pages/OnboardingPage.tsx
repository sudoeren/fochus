import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  Moon,
  Sun,
  Monitor,
  Image as ImageIcon,
  LayoutTemplate,
  Languages,
  Sparkles,
  Command,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../components/ThemeProvider';
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const { setTheme, theme } = useTheme();
  const [step, setStep] = useState(1);
  const [isGlobalBg, setIsGlobalBg] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    onGlobalBgChange(isGlobalBg);
    onBackgroundChange('default');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 lg:p-8 transition-colors duration-500 font-sans">
      <div className="w-full max-w-6xl aspect-[16/10] lg:aspect-[16/9] bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-zinc-200 dark:border-zinc-800 relative">
        {/* LEFT SIDE: VISUAL SHOWCASE */}
        <div className="relative w-full lg:w-5/12 h-64 lg:h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-500">
          {step === 1 && <LanguagePreview mounted={mounted} language={i18n.language} />}
          {step === 2 && <ThemePreview />}
          {step === 3 && <BackgroundPreview isGlobalBg={isGlobalBg} theme={theme} />}

          {/* Step Number Indicator */}
          <div className="absolute top-6 left-6 font-mono text-xs font-bold text-zinc-400 tracking-widest">
            0{step} — 0{totalSteps}
          </div>
        </div>

        {/* RIGHT SIDE: CONTROLS */}
        <div className="flex-1 flex flex-col p-8 lg:p-16 relative">
          <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
            {/* HEADLINES */}
            <div className="mb-10 space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {step === 1 && t('onboarding.select_language')}
                {step === 2 && t('onboarding.select_theme')}
                {step === 3 && t('onboarding.background_title')}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                {step === 1 && t('onboarding.language_desc')}
                {step === 2 && t('onboarding.desc_3')}
                {step === 3 && t('onboarding.background_desc')}
              </p>
            </div>

            {/* CONTROLS */}
            <div className="space-y-4">
              {/* STEP 1: Language Buttons */}
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'tr', label: 'Türkçe' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={cn(
                        'w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-200 group hover:border-zinc-300 dark:hover:border-zinc-600',
                        i18n.language === lang.code
                          ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                          : 'border-zinc-100 dark:border-zinc-800 bg-transparent'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{lang.code === 'en' ? '🇺🇸' : '🇹🇷'}</span>
                        <span
                          className={cn(
                            'font-medium text-lg',
                            i18n.language === lang.code ? 'font-bold' : ''
                          )}
                        >
                          {lang.label}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                          i18n.language === lang.code
                            ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black'
                            : 'border-zinc-300 dark:border-zinc-700'
                        )}
                      >
                        {i18n.language === lang.code && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: Theme Buttons */}
              {step === 2 && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: t('onboarding.theme_light'), icon: Sun },
                    { id: 'dark', label: t('onboarding.theme_dark'), icon: Moon },
                    { id: 'system', label: t('onboarding.theme_system'), icon: Monitor }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id as any)}
                      className={cn(
                        'flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 gap-3 hover:border-zinc-300 dark:hover:border-zinc-600',
                        theme === mode.id
                          ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                          : 'border-zinc-100 dark:border-zinc-800 bg-transparent'
                      )}
                    >
                      <mode.icon
                        className={cn(
                          'w-6 h-6',
                          theme === mode.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          theme === mode.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'
                        )}
                      >
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 3: Background Toggle */}
              {step === 3 && (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsGlobalBg(!isGlobalBg)}
                    className={cn(
                      'w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 group text-left',
                      isGlobalBg
                        ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'p-3 rounded-xl transition-colors',
                          isGlobalBg
                            ? 'bg-white dark:bg-black shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800'
                        )}
                      >
                        {isGlobalBg ? (
                          <ImageIcon className="w-6 h-6" />
                        ) : (
                          <LayoutTemplate className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-zinc-900 dark:text-white">
                          {isGlobalBg
                            ? t('onboarding.background_immersive')
                            : t('onboarding.background_minimal')}
                        </div>
                        <div className="text-zinc-500 text-sm">
                          {isGlobalBg ? 'Rich visual experience' : 'Clean, distraction-free'}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'w-14 h-8 rounded-full border-2 border-transparent transition-colors relative',
                        isGlobalBg ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-1 bottom-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300',
                          isGlobalBg ? 'left-[calc(100%-24px)]' : 'left-1'
                        )}
                      />
                    </div>
                  </button>
                  <p className="text-xs text-center text-zinc-400">
                    {t('onboarding.background_desc')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="mt-auto pt-12 flex justify-end">
            <button
              onClick={handleNext}
              className={cn(
                'group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0',
                theme === 'light'
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-white text-black hover:bg-zinc-200'
              )}
            >
              <span>{step === totalSteps ? t('onboarding.finish') : t('onboarding.continue')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LanguagePreviewProps {
  mounted: boolean;
  language: string;
}

const LanguagePreview: React.FC<LanguagePreviewProps> = ({ mounted, language }) => (
  <div className="relative w-full h-full flex items-center justify-center p-8">
    <div className="relative z-10 space-y-4">
      <div
        className={cn(
          'bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl transform transition-all duration-700',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-zinc-900 dark:text-white">
            {language === 'en' ? 'Hello!' : 'Merhaba!'}
          </div>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400">
          {language === 'en'
            ? 'Welcome to your new workspace.'
            : 'Yeni çalışma alanına hoş geldin.'}
        </p>
      </div>

      <div
        className={cn(
          'bg-zinc-900 dark:bg-white p-6 rounded-2xl shadow-xl transform transition-all duration-700 delay-100',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center text-white dark:text-zinc-900">
            <Command className="w-4 h-4" />
          </div>
          <div className="font-bold text-lg text-white dark:text-zinc-900">
            {language === 'en' ? 'Ready?' : 'Hazır mısın?'}
          </div>
        </div>
      </div>
    </div>

    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow" />
  </div>
);

const ThemePreview: React.FC = () => (
  <div className="relative w-full h-full flex items-center justify-center p-10 bg-zinc-100/50 dark:bg-zinc-900/50 transition-colors duration-500">
    <div className="w-full max-w-sm bg-white dark:bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-500">
      <div className="h-12 border-b border-zinc-100 dark:border-zinc-800 flex items-center px-4 justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="w-20 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800" />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900" />
          <div className="flex-1 space-y-2">
            <div className="w-3/4 h-3 rounded-full bg-zinc-100 dark:bg-zinc-900" />
            <div className="w-1/2 h-3 rounded-full bg-zinc-50 dark:bg-zinc-900/50" />
          </div>
        </div>
        <div className="h-24 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 p-3">
          <div className="w-full h-full rounded bg-zinc-200/50 dark:bg-zinc-800/50" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900" />
          <div className="px-4 py-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold">
            Button
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface BackgroundPreviewProps {
  isGlobalBg: boolean;
  theme: string;
}

const BackgroundPreview: React.FC<BackgroundPreviewProps> = ({ isGlobalBg, theme }) => (
  <div className="relative w-full h-full overflow-hidden">
    <div
      className={cn(
        'absolute inset-0 bg-cover bg-center transition-all duration-700',
        isGlobalBg ? 'scale-100 blur-0' : 'scale-110 blur-sm opacity-50'
      )}
      style={{ backgroundImage: `url(${theme === 'dark' ? '/dark.png' : '/light.png'})` }}
    />

    <div
      className={cn(
        'absolute inset-0 bg-zinc-50 dark:bg-black transition-opacity duration-700',
        isGlobalBg ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 h-40 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl flex items-center justify-center">
        {isGlobalBg ? (
          <div className="text-center text-white">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <span className="font-medium text-sm">Immersive Mode</span>
          </div>
        ) : (
          <div className="text-center text-zinc-900 dark:text-white">
            <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <span className="font-medium text-sm">Minimal Mode</span>
          </div>
        )}
      </div>
    </div>
  </div>
);
