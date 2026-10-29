import React from 'react';
import {
  Sparkles,
  Layers,
  PlusCircle,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'workspace' | 'manual' | 'admin';
  setActiveTab: (tab: 'generator' | 'workspace' | 'manual' | 'admin') => void;
  ideasCount: number;
  user: {
    displayName: string;
    email?: string;
    username?: string;
    photoURL?: string;
    isAdmin: boolean;
  };
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  ideasCount,
  user,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                IdeaFlow AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI App Ideation & Firestore Cloud Workspace
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Generator AI</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Ide Saya</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {ideasCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'manual'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Buat Ide Manual</span>
            <span className="md:hidden">Manual</span>
          </button>

          {user.isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </button>
          )}
        </nav>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-6 h-6 rounded-full border border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center text-indigo-300 text-xs font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight max-w-[120px] truncate">
                {user.displayName}
              </span>
              <span className="text-[10px] text-slate-500 font-mono leading-tight">
                {user.isAdmin ? 'Super Admin' : 'User'}
              </span>
            </div>
          </div>

          {/* Tombol Logout (Wajib Sesuai Instruksi) */}
          <button
            onClick={onLogout}
            title="Keluar dari akun"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
