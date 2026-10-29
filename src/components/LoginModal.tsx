import React, { useState } from 'react';
import {
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Server,
  Key
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LoginModalProps {
  onAdminLoginSuccess: (adminData: {
    username: string;
    displayName: string;
    email: string;
    role: string;
    isAdmin: boolean;
  }) => void;
  onGoogleLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onAdminLoginSuccess,
  onGoogleLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      onGoogleLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Gagal login dengan Google. Pastikan pop-up tidak diblokir oleh browser.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAdminLoginSuccess(data.user);
      } else {
        setErrorMessage(data.error || 'Autentikasi admin gagal. Periksa username dan password.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan menghubungi server Express.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper button to prefill admin credentials as instructed: mhmmdyusf / yusuf2286
  const fillAdminCredentials = () => {
    setAdminUsername('mhmmdyusf');
    setAdminPassword('yusuf2286');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/25 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            IdeaFlow <span className="text-indigo-400">AI</span> Studio
          </h1>
          <p className="text-sm text-slate-400">
            Platform Ideasi Aplikasi Cerdas dengan Gemini AI & Firestore Sync
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Method Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('google');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'google'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Google Sign-In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Login Admin</span>
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'google' ? (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-4">
                  Masuk dengan akun Google untuk mengelola ide aplikasi privat Anda yang tersimpan di Firestore.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Firebase Auth & Firestore per-user terenkripsi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Server-side Gemini AI 2.5 Flash API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Akun mhmmdyusf2286@gmail.com otomatis mendapat hak Admin</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <div className="font-semibold mb-1 flex items-center justify-between">
                  <span>Akun Admin Terdaftar:</span>
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="text-[11px] font-mono underline hover:text-white"
                  >
                    Isi Otomatis
                  </button>
                </div>
                <div className="font-mono text-[11px] text-amber-200">
                  Username: <strong className="text-white">mhmmdyusf</strong> | Sandi: <strong className="text-white">yusuf2286</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Username Admin
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="mhmmdyusf"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-sm transition-all shadow-md shadow-amber-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Memverifikasi Admin...' : 'Masuk sebagai Admin mhmmdyusf'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Feature Badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Sparkles className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
            <div className="text-[11px] font-semibold text-slate-200">Gemini 2.5</div>
            <div className="text-[10px] text-slate-500">Server-side AI</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Database className="w-4 h-4 text-violet-400 mx-auto mb-1" />
            <div className="text-[11px] font-semibold text-slate-200">Firestore</div>
            <div className="text-[10px] text-slate-500">Per-user Storage</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
            <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-semibold text-slate-200">Express API</div>
            <div className="text-[10px] text-slate-500">Vercel Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};
