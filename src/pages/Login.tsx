import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, User, Key, ArrowLeft, Target, Zap } from 'lucide-react';
import { authAPI, setAuthToken } from '../services/api';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    localStorage.setItem('userType', 'guest');
    onLogin();
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
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black items-center justify-center">
        {/* Abstract Light Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top light beam */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/[0.03] rounded-full blur-[120px]" />
          
          {/* Bottom ambient glow */}
          <div className="absolute -bottom-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[100px]" />
          
          {/* Sharp streak of light */}
          <div className="absolute top-0 right-0 w-[2px] h-screen bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-50 rotate-12 transform origin-top-right" />
        </div>
        
        <div className="relative z-10 p-16 max-w-2xl text-white">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-14 w-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
              <span className="text-3xl font-bold">F</span>
            </div>
            <span className="text-4xl font-bold tracking-tight text-white/90">FOKUS</span>
          </div>

          <h1 className="text-6xl font-bold leading-tight mb-8 tracking-tight">
            Karanlığın <br />
            içindeki <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              ışık.
            </span>
          </h1>
          
          <div className="space-y-10 text-zinc-400 mt-12">
            <div className="flex items-center gap-6 group">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 group-hover:border-white/20 transition-colors">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-medium mb-1">Zihni Sustur</h3>
                <p className="font-light text-zinc-500">Gürültüden uzaklaş, sadece yapman gerekene odaklan.</p>
              </div>
            </div>

            <div className="flex items-center gap-6 group">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 group-hover:border-white/20 transition-colors">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xl font-medium mb-1">Akışı Yakala</h3>
                <p className="font-light text-zinc-500">Hedefinle arandaki tüm engelleri kaldır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-zinc-50 dark:bg-black relative">
         {/* Subtle background effects for the form side too */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-[90px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-zinc-700/5 rounded-full blur-[80px] animate-pulse-slow delay-500" />
         </div>
        <div className="w-full max-w-md relative z-10 p-6 sm:p-8 bg-white dark:bg-zinc-950 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="h-12 w-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold">F</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {isRegister ? 'Yeni Bir Başlangıç' : 'Tekrar Hoş Geldiniz'}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {isRegister 
                ? 'Hedeflerine ulaşmak için ilk adımı at.' 
                : 'Kaldığınız yerden devam edin.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 text-red-400 rounded-xl text-sm font-medium border border-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Step 1: Name (Register Only) */}
            {isRegister && step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">İsim</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all text-zinc-900 dark:text-white"
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
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Kullanıcı Adı</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    autoFocus={isRegister}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all text-zinc-900 dark:text-white"
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
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Şifre</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input
                      type="password"
                      required
                      autoFocus={isRegister}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all text-zinc-900 dark:text-white"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Şifre Tekrar</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-white/20 focus:border-white/10 outline-none transition-all text-zinc-900 dark:text-white"
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
                  className="px-6 py-3.5 bg-zinc-800 text-zinc-400 rounded-xl font-medium hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-200"
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-white' : 
                    s < step ? 'w-2 bg-zinc-600' : 'w-2 bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs text-zinc-500 uppercase font-medium">veya</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleGuestLogin}
              className="w-full py-3.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-zinc-800/10"
            >
              Misafir Olarak Devam Et
            </button>
            
            <p className="text-center text-sm text-zinc-500">
              {isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}
              <button
                onClick={toggleMode}
                className="ml-2 font-medium text-white hover:underline"
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
