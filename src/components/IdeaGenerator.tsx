import React, { useState } from 'react';
import {
  Sparkles,
  BookmarkPlus,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Target,
  Code2,
  DollarSign,
  Rocket,
  Layers,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Tag
} from 'lucide-react';
import { saveIdeaToFirestore } from '../lib/firebase';

interface IdeaGeneratorProps {
  userId: string;
  onIdeaSaved: () => void;
  onOpenAnalysis: (idea: any) => void;
}

const CATEGORIES = [
  'SaaS & AI Productivity',
  'Fintech & Keuangan',
  'EdTech & Pendidikan',
  'UMKM & E-Commerce',
  'Health & Wellness',
  'Developer Tools',
  'Social & Community',
  'Workflow Automation',
];

const AUDIENCES = [
  'UMKM & Toko Online Indonesia',
  'Startup Founder & Solo Developer',
  'Kreator Konten & Digital Marketer',
  'Mahasiswa & Fresh Graduate',
  'Tim Remote & Profesional Kantor',
  'Masyarakat Umum / Konsumen Rumah Tangga',
];

export const IdeaGenerator: React.FC<IdeaGeneratorProps> = ({
  userId,
  onIdeaSaved,
  onOpenAnalysis,
}) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetAudience, setTargetAudience] = useState(AUDIENCES[0]);
  const [problemSpace, setProblemSpace] = useState('');
  const [scope, setScope] = useState('MVP Cepat Siap Bangun');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedIdea, setGeneratedIdea] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          targetAudience,
          problemSpace: problemSpace.trim() || undefined,
          scope,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghasilkan ide dengan Gemini AI');
      }

      setGeneratedIdea(data.idea);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses permintaan AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!generatedIdea) return;
    setIsSaving(true);
    try {
      const featuresStr = Array.isArray(generatedIdea.keyFeatures)
        ? generatedIdea.keyFeatures.join('\n• ')
        : String(generatedIdea.keyFeatures || '');

      const techStackStr = typeof generatedIdea.techStack === 'object'
        ? `Frontend: ${generatedIdea.techStack.frontend || ''} | Backend: ${generatedIdea.techStack.backend || ''} | Database: ${generatedIdea.techStack.database || ''} | AI: ${generatedIdea.techStack.aiEngine || ''}`
        : String(generatedIdea.techStack || '');

      const tagsStr = Array.isArray(generatedIdea.tags)
        ? generatedIdea.tags.join(', ')
        : (generatedIdea.tags || generatedIdea.category || '');

      await saveIdeaToFirestore(userId, {
        title: generatedIdea.title,
        summary: generatedIdea.summary,
        category: generatedIdea.category,
        targetAudience: generatedIdea.targetAudience,
        techStack: techStackStr,
        keyFeatures: `• ${featuresStr}`,
        monetization: generatedIdea.monetization,
        status: 'Draft',
        isFavorite: false,
        tags: tagsStr,
        notes: `Tagline: ${generatedIdea.tagline || ''}\nMasalah: ${generatedIdea.problemSolved || ''}\n\nRencana Peluncuran MVP:\n${Array.isArray(generatedIdea.mvpLaunchPlan) ? generatedIdea.mvpLaunchPlan.map((s: string, idx: number) => `${idx + 1}. ${s}`).join('\n') : ''}`,
      });

      setSavedSuccess(true);
      onIdeaSaved();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving idea to Firestore:', err);
      alert('Gagal menyimpan ide ke Firestore: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedIdea) return;
    const text = `# ${generatedIdea.title}
_${generatedIdea.tagline}_

## Ringkasan
${generatedIdea.summary}

- Kategori: ${generatedIdea.category}
- Target Pasar: ${generatedIdea.targetAudience}
- Masalah yang Diselesaikan: ${generatedIdea.problemSolved}

## Fitur Utama:
${Array.isArray(generatedIdea.keyFeatures) ? generatedIdea.keyFeatures.map((f: string) => `- ${f}`).join('\n') : generatedIdea.keyFeatures}

## Model Monetisasi:
${generatedIdea.monetization}

## Rekomendasi Tech Stack:
${typeof generatedIdea.techStack === 'object' ? JSON.stringify(generatedIdea.techStack, null, 2) : generatedIdea.techStack}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Server-side Gemini 2.5 Flash Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Generator Ide Aplikasi Cerdas
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Hasilkan konsep aplikasi web & SaaS modern dengan blueprint fitur, arsitektur teknologi,
            strategi monetisasi, dan simpan langsung ke Firestore akun Anda.
          </p>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Configuration Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">Parameter Ideasi</h3>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Kategori Aplikasi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    category === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audiens */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Target Pengguna / Audiens
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {AUDIENCES.map((aud) => (
                <option key={aud} value={aud}>
                  {aud}
                </option>
              ))}
            </select>
          </div>

          {/* Fokus Masalah / Kata Kunci Tambahan */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Kata Kunci / Fokus Masalah (Opsional)
            </label>
            <textarea
              rows={3}
              value={problemSpace}
              onChange={(e) => setProblemSpace(e.target.value)}
              placeholder="Misal: otomatisasi pembukuan toko, rekomendasi makanan sehat AI, dsb..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Lingkup Proyek */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Skala Proyek
            </label>
            <div className="grid grid-cols-3 gap-2 text-center">
              {['MVP Cepat Siap Bangun', 'SaaS Lengkap', 'Enterprise'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                    scope === s
                      ? 'bg-violet-600 text-white font-semibold'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Tombol Eksekusi Gemini */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Merancang Ide dengan Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Hasilkan Ide Aplikasi Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Display */}
        <div className="lg:col-span-7">
          {generatedIdea ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
              {/* Header Title & Tagline */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {generatedIdea.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {generatedIdea.targetAudience}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {generatedIdea.title}
                  </h3>
                  <p className="text-sm font-medium text-indigo-300 mt-1 italic">
                    "{generatedIdea.tagline}"
                  </p>
                </div>

                {/* Quick actions: Copy & Save */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    title="Salin Markdown"
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveToFirestore}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                      savedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tersimpan di Firestore!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan ke Ide Saya'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Ringkasan Solusi
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {generatedIdea.summary}
                </p>
              </div>

              {/* Problem Solved */}
              {generatedIdea.problemSolved && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Masalah Utama yang Diselesaikan
                  </h4>
                  <div className="text-sm text-slate-300 bg-amber-950/20 border border-amber-900/40 p-3.5 rounded-xl flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{generatedIdea.problemSolved}</span>
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Fitur Utama (MVP Roadmap)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Array.isArray(generatedIdea.keyFeatures) ? (
                    generatedIdea.keyFeatures.map((feat: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <span>{feat}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-300">{generatedIdea.keyFeatures}</p>
                  )}
                </div>
              </div>

              {/* Tech Stack Blueprint */}
              {generatedIdea.techStack && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Rekomendasi Tech Stack Modern
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {typeof generatedIdea.techStack === 'object' ? (
                      Object.entries(generatedIdea.techStack).map(([layer, tech]) => (
                        <div
                          key={layer}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left"
                        >
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                            {layer}
                          </div>
                          <div className="text-xs font-medium text-slate-200 mt-0.5 truncate">
                            {String(tech)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 col-span-4">
                        {String(generatedIdea.techStack)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Monetization Model */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Model Monetisasi
                </h4>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{generatedIdea.monetization}</span>
                </div>
              </div>

              {/* Deep Analysis Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onOpenAnalysis(generatedIdea)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Jalankan Analisis Pasar & SWOT (AI Deep Dive)</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate Ide Lainnya</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[440px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/40">
              <div className="h-16 w-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Belum Ada Ide yang Dihasilkan
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
                Pilih parameter di sisi kiri lalu klik tombol "Hasilkan Ide Aplikasi Sekarang"
                untuk mendapatkan ide startup atau aplikasi web berkelas.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mulai dengan Rekomendasi AI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
