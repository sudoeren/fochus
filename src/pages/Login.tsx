import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, User, Key, ArrowLeft, Target, Zap, Moon, Sun, Check, Clock } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();

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
          setError('Şifreler eşleşmiyor');
          setIsLoading(false);
          return;
        }

        const { token } = await authAPI.register({
          username: formData.username,
          password: formData.password,
          name: formData.name
        });
        setAuthToken(token);
        onLogin();
      } else {
        const { token } = await authAPI.login({
          username: formData.username,
          password: formData.password
        });
        setAuthToken(token);
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      setError('Lütfen isminizi giriniz');
      return;
    }
    if (step === 2 && !formData.username.trim()) {
      setError('Lütfen bir kullanıcı adı seçiniz');
      return;
    }
    if (step === 2 && formData.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      return;
    }
    
    setError(null);
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  const handleGuestLogin = () => {
    setError('Misafir modu şu anda desteklenmiyor. Lütfen giriş yapın veya kayıt olun.');
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
      
      {/* Theme Switcher - Absolute Position */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-zinc-500 dark:text-white hover:bg-white/20 transition-all shadow-lg"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left Side - Visuals (Redesigned) */}
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12",
        theme === 'light' ? "bg-zinc-50" : "bg-black"
      )}>
        {/* Decorative Grid Pattern */}
        <div className={cn(
          "absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]",
          theme === 'light' ? "opacity-100" : "opacity-20"
        )} />

        <div className="relative w-full max-w-xl flex flex-col gap-12">
          {/* Main Title Section */}
          <div className="space-y-4">
            <h1 className={cn(
              "text-7xl font-bold tracking-tighter leading-[0.9]",
              theme === 'light' ? "text-zinc-900" : "text-white"
            )}>
              Zamanı <br />
              Yönet. <br />
              <span className="text-zinc-400 dark:text-zinc-600">Hayatı Yaşa.</span>
            </h1>
            <p className={cn(
              "text-xl max-w-md font-medium",
              theme === 'light' ? "text-zinc-500" : "text-zinc-400"
            )}>
              Karmaşadan uzaklaş. FOKUS ile hedeflerine giden yolda net bir görüş kazan.
            </p>
          </div>

          {/* Abstract Interface Mockup */}
          <div className="relative">
            {/* Background Card */}
            <div className={cn(
              "absolute inset-0 rotate-3 rounded-3xl border opacity-50 blur-[1px]",
              theme === 'light' ? "bg-zinc-200 border-zinc-300" : "bg-zinc-900 border-zinc-800"
            )} />
            
            {/* Foreground Card */}
            <div className={cn(
              "relative rounded-3xl p-6 border shadow-2xl backdrop-blur-sm",
              theme === 'light' ? "bg-white/80 border-zinc-200" : "bg-zinc-950/80 border-zinc-800"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme === 'light' ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white")}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className={cn("text-sm font-bold", theme === 'light' ? "text-zinc-900" : "text-white")}>Günlük Hedef</div>
                    <div className={cn("text-xs", theme === 'light' ? "text-zinc-500" : "text-zinc-400")}>%85 Tamamlandı</div>
                  </div>
                </div>
                <div className={cn("text-2xl font-mono font-bold", theme === 'light' ? "text-zinc-900" : "text-white")}>
                  04:25
                </div>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    i === 1 
                      ? (theme === 'light' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-900 border-white")
                      : (theme === 'light' ? "bg-zinc-50 text-zinc-500 border-zinc-100" : "bg-zinc-900 text-zinc-500 border-zinc-800")
                  )}>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      i === 1 
                        ? (theme === 'light' ? "border-white/30" : "border-zinc-900/30") 
                        : "border-current opacity-40"
                    )}>
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
              <div className={cn("text-3xl font-bold font-mono", theme === 'light' ? "text-zinc-900" : "text-white")}>12+</div>
              <div className={cn("text-sm font-medium", theme === 'light' ? "text-zinc-500" : "text-zinc-500")}>Odak Saati</div>
            </div>
            <div className="w-px bg-zinc-200 dark:bg-zinc-800" />
            <div>
              <div className={cn("text-3xl font-bold font-mono", theme === 'light' ? "text-zinc-900" : "text-white")}>85%</div>
              <div className={cn("text-sm font-medium", theme === 'light' ? "text-zinc-500" : "text-zinc-500")}>Verimlilik</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={cn(
        "flex-1 flex items-center justify-center p-8 lg:p-12 relative transition-colors duration-500",
        theme === 'light' ? "bg-zinc-50" : "bg-black"
      )}>
         {/* Subtle background effects for the form side too */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
            <div className={cn(
              "absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[90px] animate-pulse-slow transition-colors duration-500",
              theme === 'light' ? "bg-zinc-200/50" : "bg-white/5"
            )} />
            <div className={cn(
              "absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full blur-[80px] animate-pulse-slow delay-500 transition-colors duration-500",
              theme === 'light' ? "bg-zinc-300/50" : "bg-zinc-700/5"
            )} />
         </div>
        
        <div className={cn(
          "w-full max-w-md relative z-10 p-6 sm:p-8 rounded-3xl shadow-xl border transition-colors duration-500",
          theme === 'light' ? "bg-white border-zinc-200" : "bg-zinc-900 border-zinc-800"
        )}>
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg",
                theme === 'light' ? "bg-white border border-zinc-200" : "bg-zinc-900 border border-zinc-800"
              )}>
                <img src="/logo.svg" alt="Fokus Logo" className="w-12 h-12 object-contain" />
              </div>
            </div>
            <h2 className={cn(
              "text-3xl font-bold mb-2",
              theme === 'light' ? "text-zinc-900" : "text-white"
            )}>
              {isRegister ? 'Yeni Bir Başlangıç' : 'Tekrar Hoş Geldiniz'}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {isRegister 
                ? 'Hedeflerine ulaşmak için ilk adımı at.' 
                : 'Kaldığınız yerden devam edin.'}
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
                <label className={cn(
                  "block text-sm font-medium mb-1.5",
                  theme === 'light' ? "text-zinc-700" : "text-zinc-300"
                )}>İsim</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all",
                      theme === 'light' ? "bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400" : "bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10"
                    )}
                    placeholder="Adınız Soyadınız"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Username (Register) or Login */}
            {(!isRegister || step === 2) && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className={cn(
                  "block text-sm font-medium mb-1.5",
                  theme === 'light' ? "text-zinc-700" : "text-zinc-300"
                )}>Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus={isRegister}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all",
                      theme === 'light' ? "bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400" : "bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10"
                    )}
                    placeholder="kullaniciadi"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Password (Register) or Login */}
            {(!isRegister || step === 3) && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                <div>
                  <label className={cn(
                    "block text-sm font-medium mb-1.5",
                    theme === 'light' ? "text-zinc-700" : "text-zinc-300"
                  )}>Şifre</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      autoFocus={isRegister}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all",
                        theme === 'light' ? "bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400" : "bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10"
                      )}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-1.5",
                      theme === 'light' ? "text-zinc-700" : "text-zinc-300"
                    )}>Şifre Tekrar</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="password"
                        required
                        className={cn(
                          "w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 outline-none transition-all",
                          theme === 'light' ? "bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-300 focus:border-zinc-400" : "bg-zinc-800 border-zinc-700 text-white focus:ring-white/20 focus:border-white/10"
                        )}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
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
                    "px-6 py-3.5 rounded-xl font-medium hover:bg-zinc-300 transition-colors border",
                    theme === 'light' ? "bg-zinc-200 text-zinc-600 border-zinc-300" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-transparent",
                  theme === 'light' ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/10" : "bg-white text-black hover:bg-zinc-200 shadow-white/10"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegister && step < 3 ? 'Devam Et' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
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
                    "h-1.5 rounded-full transition-all duration-300",
                    s === step 
                      ? (theme === 'light' ? "w-8 bg-zinc-900" : "w-8 bg-white") 
                      : (theme === 'light' ? "w-2 bg-zinc-400" : "w-2 bg-zinc-800")
                  )}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className={cn(
              "h-px flex-1",
              theme === 'light' ? "bg-zinc-200" : "bg-zinc-800"
            )} />
            <span className={cn(
              "text-xs uppercase font-medium",
              theme === 'light' ? "text-zinc-500" : "text-zinc-500"
            )}>veya</span>
            <div className={cn(
              "h-px flex-1",
              theme === 'light' ? "bg-zinc-200" : "bg-zinc-800"
            )} />
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleGuestLogin}
              className={cn(
                "w-full py-3.5 rounded-xl font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm border",
                theme === 'light' ? "bg-zinc-100 text-zinc-600 border-zinc-200" : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
              )}
            >
              Misafir Olarak Devam Et
            </button>
            
            <p className="text-center text-sm text-zinc-500">
              {isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
              <button
                onClick={toggleMode}
                className={cn(
                  "ml-2 font-medium hover:underline",
                  theme === 'light' ? "text-zinc-700" : "text-white"
                )}
              >
                {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
