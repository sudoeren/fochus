import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  User,
  Key,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Check,
  Shield
} from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

// Password strength calculator
const calculatePasswordStrength = (
  password: string
): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2) return { score: Math.min(score, 2), label: 'weak', color: 'bg-red-500' };
  if (score <= 4) return { score: Math.min(score, 4), label: 'medium', color: 'bg-yellow-500' };
  return { score, label: 'strong', color: 'bg-emerald-500' };
};

// Password Strength Indicator Component
const PasswordStrengthIndicator: React.FC<{
  password: string;
  t: (key: string) => string;
  isDark: boolean;
}> = ({ password, t, isDark }) => {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              level <= strength.score ? strength.color : !isDark ? 'bg-zinc-200' : 'bg-zinc-700'
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium',
            strength.label === 'weak' && 'text-red-500',
            strength.label === 'medium' && 'text-yellow-500',
            strength.label === 'strong' && 'text-emerald-500'
          )}
        >
          {t(`login.password_${strength.label}`) || strength.label}
        </span>
        {strength.label === 'strong' && <Shield className="w-3.5 h-3.5 text-emerald-500" />}
      </div>
    </div>
  );
};

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme, isDark } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (step !== 3) {
          handleNextStep();
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError(t('login.error_match'));
          setIsLoading(false);
          return;
        }

        const { token } = await authAPI.register({
          username: formData.username,
          password: formData.password,
          name: formData.name
        });
        setAuthToken(token);

        // Trigger global onboarding flow
        localStorage.setItem('fokus_onboarding_pending', 'true');
        onLogin();
      } else {
        const { token } = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        setAuthToken(token);
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error_general'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      setError(t('login.error_name'));
      return;
    }
    if (step === 2 && !formData.username.trim()) {
      setError(t('login.error_username'));
      return;
    }
    if (step === 2 && formData.username.length < 3) {
      setError(t('login.error_username_len'));
      return;
    }

    setError(null);
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setStep(1);
    setError(null);
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-black transition-colors duration-300">
      {/* Top Left Branding */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
        <img src="/logo.svg" alt="Fochus" className="w-6 h-6" />
        <span
          className={cn(
            'font-bold text-lg tracking-tight',
            !isDark ? 'text-zinc-900' : 'text-white'
          )}
        >
          FOCHUS
        </span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <button
            onClick={() => i18n.changeLanguage('tr')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
              i18n.language === 'tr'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-500 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            )}
          >
            TR
          </button>
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
              i18n.language === 'en'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-500 dark:text-zinc-300 hover:text-black dark:hover:text-white'
            )}
          >
            EN
          </button>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={() =>
            setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
          }
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-zinc-500 dark:text-white hover:bg-white/20 transition-all shadow-lg"
        >
          {theme === 'dark' ? (
            <Moon className="w-5 h-5" />
          ) : theme === 'system' ? (
            <Monitor className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Left Side - Visuals (Redesigned) */}
      <div
        className={cn(
          'hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12',
          !isDark ? 'bg-zinc-50' : 'bg-black'
        )}
      >
        {/* Decorative Grid Pattern */}
        <div
          className={cn(
            'absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
            !isDark ? 'opacity-100' : 'opacity-20'
          )}
        />

        <div className="relative w-full max-w-xl flex flex-col gap-12">
          {/* Main Title Section */}
          <div className="space-y-4">
            <h1
              className={cn(
                'text-7xl font-bold tracking-tighter leading-[0.9] whitespace-pre-line',
                !isDark ? 'text-zinc-900' : 'text-white'
              )}
            >
              {t('login.hero_title')}
            </h1>
            <p
              className={cn(
                'text-xl max-w-md font-medium',
                !isDark ? 'text-zinc-500' : 'text-zinc-400'
              )}
            >
              {t('login.hero_desc')}
            </p>
          </div>

          {/* Abstract Interface Mockup */}
          <div className="relative">
            {/* Background Card */}
            <div
              className={cn(
                'absolute inset-0 rotate-3 rounded-3xl border opacity-50 blur-[1px]',
                !isDark ? 'bg-zinc-200 border-zinc-300' : 'bg-zinc-900 border-zinc-800'
              )}
            />

            {/* Foreground Card */}
            <div
              className={cn(
                'relative rounded-3xl p-6 border shadow-2xl backdrop-blur-sm',
                !isDark ? 'bg-white/80 border-zinc-200' : 'bg-zinc-950/80 border-zinc-800'
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      !isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'
                    )}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div
                      className={cn('text-sm font-bold', !isDark ? 'text-zinc-900' : 'text-white')}
                    >
                      {t('login.daily_goal')}
                    </div>
                    <div className={cn('text-xs', !isDark ? 'text-zinc-500' : 'text-zinc-400')}>
                      %85 {t('login.completed')}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-2xl font-mono font-bold',
                    !isDark ? 'text-zinc-900' : 'text-white'
                  )}
                >
                  04:25
                </div>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      i === 1
                        ? !isDark
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-900 border-white'
                        : !isDark
                          ? 'bg-zinc-50 text-zinc-500 border-zinc-100'
                          : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        i === 1
                          ? !isDark
                            ? 'border-white/30'
                            : 'border-zinc-900/30'
                          : 'border-current opacity-40'
                      )}
                    >
                      {i === 1 && <Check className="w-3 h-3" />}
                    </div>
                    <div className="h-2 w-24 rounded-full bg-current opacity-40" />
                    <div className="h-2 w-12 rounded-full bg-current opacity-20 ml-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex gap-8 pt-4">
            <div>
              <div
                className={cn(
                  'text-3xl font-bold font-mono',
                  !isDark ? 'text-zinc-900' : 'text-white'
                )}
              >
                12+
              </div>
              <div
                className={cn('text-sm font-medium', !isDark ? 'text-zinc-500' : 'text-zinc-500')}
              >
                {t('login.stat_focus')}
              </div>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <div
                className={cn(
                  'text-3xl font-bold font-mono',
                  !isDark ? 'text-zinc-900' : 'text-white'
                )}
              >
                85%
              </div>
              <div
                className={cn('text-sm font-medium', !isDark ? 'text-zinc-500' : 'text-zinc-500')}
              >
                {t('login.stat_efficiency')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className={cn(
          'flex-1 flex items-center justify-center p-8 lg:p-12 relative transition-colors duration-500',
          !isDark ? 'bg-zinc-50' : 'bg-black'
        )}
      >
        {/* Subtle background effects for the form side too */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
          <div
            className={cn(
              'absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[90px] animate-pulse-slow transition-colors duration-500',
              !isDark ? 'bg-zinc-200/50' : 'bg-white/5'
            )}
          />
          <div
            className={cn(
              'absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full blur-[80px] animate-pulse-slow delay-500 transition-colors duration-500',
              !isDark ? 'bg-zinc-300/50' : 'bg-zinc-700/5'
            )}
          />
        </div>

        <div
          className={cn(
            'w-full max-w-md relative z-10 p-6 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-500',
            !isDark ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
          )}
        >
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div
                className={cn(
                  'h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg',
                  !isDark ? 'bg-white border border-zinc-200' : 'bg-zinc-900 border border-zinc-800'
                )}
              >
                <img src="/logo.svg" alt="Fokus Logo" className="w-12 h-12 object-contain" />
              </div>
            </div>
            <h2 className={cn('text-3xl font-bold mb-2', !isDark ? 'text-zinc-900' : 'text-white')}>
              {isRegister ? t('login.new_beginning') : t('login.welcome_back')}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {isRegister ? t('login.start_journey') : t('login.continue_journey')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Name (Register Only) */}
            {isRegister && step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label
                  className={cn(
                    'block text-sm font-medium mb-1.5',
                    !isDark ? 'text-zinc-700' : 'text-zinc-300'
                  )}
                >
                  {t('login.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all',
                      !isDark
                        ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400'
                        : 'bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10'
                    )}
                    placeholder={t('login.name_placeholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Username (Register) or Login */}
            {(!isRegister || step === 2) && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label
                  className={cn(
                    'block text-sm font-medium mb-1.5',
                    !isDark ? 'text-zinc-700' : 'text-zinc-300'
                  )}
                >
                  {t('login.username')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus={isRegister}
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all',
                      !isDark
                        ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400'
                        : 'bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10'
                    )}
                    placeholder={t('login.username_placeholder')}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Password (Register) or Login */}
            {(!isRegister || step === 3) && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                <div>
                  <label
                    className={cn(
                      'block text-sm font-medium mb-1.5',
                      !isDark ? 'text-zinc-700' : 'text-zinc-300'
                    )}
                  >
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      autoFocus={isRegister}
                      className={cn(
                        'w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all',
                        !isDark
                          ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400'
                          : 'bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10'
                      )}
                      placeholder={t('login.password_placeholder')}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  {isRegister && (
                    <PasswordStrengthIndicator password={formData.password} t={t} isDark={isDark} />
                  )}
                </div>

                {isRegister && (
                  <div>
                    <label
                      className={cn(
                        'block text-sm font-medium mb-1.5',
                        !isDark ? 'text-zinc-700' : 'text-zinc-300'
                      )}
                    >
                      {t('login.confirm_password')}
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="password"
                        required
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all',
                          !isDark
                            ? 'bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400'
                            : 'bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10'
                        )}
                        placeholder={t('login.password_placeholder')}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              {isRegister && step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className={cn(
                    'px-6 py-3.5 rounded-xl font-medium hover:bg-zinc-300 transition-colors border',
                    !isDark
                      ? 'bg-zinc-200 text-zinc-600 border-zinc-300'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'flex-1 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-transparent',
                  !isDark
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/10'
                    : 'bg-white text-black hover:bg-zinc-200 shadow-white/10'
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegister && step < 3
                      ? t('login.continue_btn')
                      : isRegister
                        ? t('login.register_btn')
                        : t('login.login_btn')}
                    {(!isRegister || step < 3) && <ArrowRight className="w-4 h-4" />}
                    {isRegister && step === 3 && <CheckCircle2 className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </form>

          {isRegister && (
            <div className="mt-8 flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    s === step
                      ? !isDark
                        ? 'w-8 bg-zinc-900'
                        : 'w-8 bg-white'
                      : !isDark
                        ? 'w-2 bg-zinc-400'
                        : 'w-2 bg-zinc-800'
                  )}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className={cn('h-px flex-1', !isDark ? 'bg-zinc-200' : 'bg-zinc-800')} />
            <span
              className={cn(
                'text-xs uppercase font-medium',
                !isDark ? 'text-zinc-500' : 'text-zinc-500'
              )}
            >
              {t('login.or')}
            </span>
            <div className={cn('h-px flex-1', !isDark ? 'bg-zinc-200' : 'bg-zinc-800')} />
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-zinc-500">
              {isRegister ? t('login.have_account') : t('login.no_account')}
              <button
                onClick={toggleMode}
                className={cn(
                  'ml-2 font-medium hover:underline',
                  !isDark ? 'text-zinc-700' : 'text-white'
                )}
              >
                {isRegister ? t('login.login_btn') : t('login.register_btn')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
