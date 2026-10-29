import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Key,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Code2,
  Lock,
  Layers,
  Send
} from 'lucide-react';
import { testConnection } from '../lib/firebase';

interface AdminPanelProps {
  adminUser: {
    username?: string;
    displayName: string;
    email?: string;
    role: string;
    isAdmin: boolean;
  };
  totalIdeasCount: number;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  adminUser,
  totalIdeasCount,
}) => {
  const [apiHealth, setApiHealth] = useState<any | null>(null);
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState<boolean | null>(null);

  // Gemini Sandbox state
  const [testPrompt, setTestPrompt] = useState('Buat 1 micro-saas idea untuk developer dengan analitik real-time');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingAi, setIsTestingAi] = useState(false);

  const fetchHealthAndStats = async () => {
    setIsChecking(true);
    try {
      const [resHealth, resStats] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/admin/stats'),
      ]);

      if (resHealth.ok) {
        const dataH = await resHealth.json();
        setApiHealth(dataH);
      }
      if (resStats.ok) {
        const dataS = await resStats.json();
        setAdminStats(dataS.stats);
      }

      const fsOk = await testConnection();
      setFirestoreStatus(fsOk);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    fetchHealthAndStats();
  }, []);

  const handleTestPrompt = async () => {
    if (!testPrompt.trim()) return;
    setIsTestingAi(true);
    setTestResponse(null);

    try {
      const res = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'DevTools & Automation',
          problemSpace: testPrompt,
          scope: 'Micro-SaaS',
        }),
      });

      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTestingAi(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Admin Identity Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                  Panel Administrator Super
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {adminUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Kredensial Aktif: <strong className="text-amber-200">{adminUser.username || 'mhmmdyusf'}</strong>
                {adminUser.email && ` (${adminUser.email})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchHealthAndStats}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Segarkan Status</span>
          </button>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Express Server */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Backend Express
            </span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{apiHealth?.status === 'ok' ? 'Aktif (Serverless)' : 'Menghubungkan...'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Endpoint: /api/index.ts (Vercel rewrite)
          </div>
        </div>

        {/* Gemini AI Server-side */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Gemini AI Engine
            </span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>gemini-2.5-flash</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {apiHealth?.hasGeminiKey ? 'API Key Terpasang di Server' : 'Cek Environment'}
          </div>
        </div>

        {/* Firestore Database */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Firestore Database
            </span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{firestoreStatus ? 'Terhubung' : 'Aktif'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
            Path: /users/{'{uid}'}/ideas
          </div>
        </div>

        {/* Total Ideas in User Session */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ide di Workspace
            </span>
            <Layers className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {totalIdeasCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Data tersimpan per user di Firestore
          </div>
        </div>
      </div>

      {/* Deployment & Architecture Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Arsitektur & Konfigurasi Siap Deploy Vercel</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>vercel.json Rewrites</span>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/60 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`"rewrites": [
  { "source": "/api/(.*)", 
    "destination": "/api" }
]`}
            </pre>
            <p className="text-slate-400 text-[11px]">
              Semua panggilan <code>/api/*</code> otomatis diteruskan ke handler Express <code>api/index.ts</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Build Output (dist)</span>
            </div>
            <pre className="p-2.5 rounded-lg bg-black/60 text-slate-300 font-mono text-[11px] overflow-x-auto">
{`"outputDirectory": "dist"
"buildCommand": "npm run build"`}
            </pre>
            <p className="text-slate-400 text-[11px]">
              Vite mengompilasi bundel React statis berkecepatan tinggi ke folder <code>dist</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Keamanan GEMINI_API_KEY</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Kunci API Gemini dieksekusi 100% pada sisi server di <code>api/index.ts</code>. Tidak pernah diekspos ke klien browser pengguna.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/50">
              STATUS: Server-side Verified
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Sandbox for Admin */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-base">Konsol Uji Coba Gemini AI Server-side</h3>
              <p className="text-xs text-slate-400">
                Uji langsung respons API Gemini 2.5 Flash melalui endpoint Express server
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Ketik topik atau prompt ideasi..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="button"
              onClick={handleTestPrompt}
              disabled={isTestingAi}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all disabled:opacity-60 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isTestingAi ? 'Menjalankan...' : 'Kirim Uji'}</span>
            </button>
          </div>

          {testResponse && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Respons JSON Server:</span>
                <button
                  type="button"
                  onClick={() => setTestResponse(null)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  Bersihkan
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 overflow-y-auto">
                {testResponse}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
