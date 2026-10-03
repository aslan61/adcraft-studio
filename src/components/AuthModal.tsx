import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from '../i18n/translations';
import { soundEngine } from '../utils/audioEngine';
import { AdCraftLogo } from './AdCraftLogo';

export const AuthModal: React.FC = () => {
  const { language } = useTranslation();
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    authError,
    clearAuthError,
    isLoading
  } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    soundEngine.playClick();
    clearAuthError();
    setFormError('');
    setAuthModalOpen(false);
  };

  const handleGoogleSignIn = async () => {
    soundEngine.playClick();
    setFormError('');
    await signInWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    setFormError('');
    clearAuthError();

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setFormError(language === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all required fields.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError(language === 'tr' ? 'Geçerli bir e-posta adresi giriniz.' : 'Please enter a valid email address.');
      return;
    }

    if (cleanPassword.length < 6) {
      setFormError(language === 'tr' ? 'Şifre en az 6 karakter olmalıdır.' : 'Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      await signUpWithEmail(cleanEmail, cleanPassword, displayName.trim());
    } else {
      await signInWithEmail(cleanEmail, cleanPassword);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0A0D15]/95 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl relative overflow-hidden font-['Geist'] text-white">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <AdCraftLogo size="lg" showText={false} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'signin'
              ? language === 'tr'
                ? 'AdCraft Studio Girişi'
                : 'Welcome Back to AdCraft'
              : language === 'tr'
              ? 'Yeni Hesap Oluştur'
              : 'Create Your Account'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
            {language === 'tr'
              ? 'Bulut projeleri, 4K ProRes renderlar ve AI reklam varyasyonlarınızı kaydedin.'
              : 'Save campaigns to cloud, unlock 4K renders and persistent AI hook variations.'}
          </p>
        </div>

        {/* Error notification banner */}
        {(authError || formError) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span>{authError || formError}</span>
            </div>
          </div>
        )}

        {/* Google 1-Click Login Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 group"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {language === 'tr' ? 'Google ile Hızlı Giriş Yap' : 'Continue with Google'}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-slate-800 flex-1" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            {language === 'tr' ? 'veya e-posta ile' : 'or with email'}
          </span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] text-slate-400 font-medium mb-1 block">
                {language === 'tr' ? 'Adınız / Stüdyo İsmi' : 'Full Name or Studio Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={language === 'tr' ? 'Ali Yılmaz' : 'Alex Rivera'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080D] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-400 font-medium mb-1 block">
              {language === 'tr' ? 'E-posta Adresi' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@adcraft.studio"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080D] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium mb-1 block">
              {language === 'tr' ? 'Şifre' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#07080D] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? language === 'tr'
                      ? 'Giriş Yap'
                      : 'Sign In'
                    : language === 'tr'
                    ? 'Hesabımı Oluştur (+250 Kredi)'
                    : 'Create Free Account (+250 Credits)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-5 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-400">
              {language === 'tr' ? 'Hesabınız yok mu?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setMode('signup');
                  clearAuthError();
                  setFormError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                {language === 'tr' ? 'Hemen Ücretsiz Kayıt Olun' : 'Sign Up Free'}
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              {language === 'tr' ? 'Zaten hesabınız var mı?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setMode('signin');
                  clearAuthError();
                  setFormError('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
              >
                {language === 'tr' ? 'Giriş Yap' : 'Sign In'}
              </button>
            </p>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-6 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Auth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'tr' ? '250 Başlangıç Kredisi' : '250 Starting Credits'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
