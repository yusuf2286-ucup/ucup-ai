import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  ShieldCheck,
  Target,
  Sparkles,
  Layers,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Lightbulb,
  Rocket,
  CheckCircle2
} from 'lucide-react';
import { AppIdea, saveIdeaToFirestore } from '../lib/firebase';

interface IdeaDetailModalProps {
  idea: AppIdea | any;
  userId: string;
  onClose: () => void;
  onUpdated?: () => void;
}

export const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({
  idea,
  userId,
  onClose,
  onUpdated,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(
    idea.aiAnalysis ? (() => {
      try {
        return JSON.parse(idea.aiAnalysis);
      } catch {
        return null;
      }
    })() : null
  );
  const [copied, setCopied] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menganalisis ide');
      }

      setAnalysis(data.analysis);

      // Save analysis to Firestore if idea has an ID
      if (idea.id && userId) {
        await saveIdeaToFirestore(userId, {
          ...idea,
          aiAnalysis: JSON.stringify(data.analysis),
        });
        if (onUpdated) onUpdated();
      }
    } catch (err: any) {
      console.error(err);
      alert('Error analisis AI: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyMarkdown = () => {
    const text = `# ${idea.title}
Kategori: ${idea.category}
Target Audiens: ${idea.targetAudience}

## Ringkasan
${idea.summary}

## Fitur Utama
${idea.keyFeatures}

## Model Bisnis & Monetisasi
${idea.monetization}

## Tech Stack
${idea.techStack}

${
  analysis
    ? `## Analisis Pasar & SWOT (Gemini 2.5 Flash)
- Skor Pasar: ${analysis.marketScore}/100 (${analysis.marketScoreLabel})
- Kekuatan (Strengths): ${analysis.swot?.strengths?.join(', ')}
- Kelemahan (Weaknesses): ${analysis.swot?.weaknesses?.join(', ')}
- Peluang (Opportunities): ${analysis.swot?.opportunities?.join(', ')}
- Ancaman (Threats): ${analysis.swot?.threats?.join(', ')}
- Moat Kompetitif: ${analysis.competitiveMoat}
- Strategi Go-To-Market: ${analysis.growthStrategy}`
    : ''
}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {idea.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                {idea.status || 'Draft'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {idea.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyMarkdown}
              title="Salin ke Clipboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Ringkasan Ide
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {idea.summary}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-400">Target Audiens:</div>
              <div className="text-white">{idea.targetAudience}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-slate-400">Model Monetisasi:</div>
              <div className="text-emerald-400 font-medium">{idea.monetization}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1 col-span-1 sm:col-span-2">
              <div className="font-semibold text-slate-400">Rekomendasi Tech Stack:</div>
              <div className="text-slate-200 font-mono text-[11px]">{idea.techStack}</div>
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Fitur Utama
            </h4>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
              {idea.keyFeatures}
            </div>
          </div>

          {/* Notes if available */}
          {idea.notes && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Catatan Pribadi & Roadmap
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
                {idea.notes}
              </div>
            </div>
          )}

          {/* AI Deep Dive Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <span>Analisis Kelayakan & Riset Pasar AI</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Didukung model Gemini 2.5 Flash server-side (SWOT & Go-To-Market)
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-violet-600/20 disabled:opacity-60 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Menganalisis...' : analysis ? 'Analisis Ulang' : 'Jalankan Analisis'}</span>
              </button>
            </div>

            {analysis ? (
              <div className="space-y-4">
                {/* Score & Feasibility Header */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-800/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Skor Potensi Pasar:</div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="text-2xl text-violet-400 font-extrabold">
                        {analysis.marketScore}
                      </span>
                      <span className="text-xs font-normal text-slate-400">/ 100</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {analysis.marketScoreLabel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Kompleksitas Teknis:</div>
                    <div className="text-xs font-semibold text-slate-200 mt-1">
                      {analysis.technicalComplexity || 'Sedang'}
                    </div>
                  </div>
                </div>

                {/* SWOT Analysis Grid */}
                {analysis.swot && (
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Matriks SWOT
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Strengths */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                        <div className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Kekuatan (Strengths)</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {analysis.swot.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40">
                        <div className="text-xs font-bold text-amber-400 mb-1.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Kelemahan (Weaknesses)</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {analysis.swot.weaknesses?.map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40">
                        <div className="text-xs font-bold text-blue-400 mb-1.5 flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5" />
                          <span>Peluang (Opportunities)</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {analysis.swot.opportunities?.map((o: string, idx: number) => (
                            <li key={idx}>{o}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Threats */}
                      <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40">
                        <div className="text-xs font-bold text-red-400 mb-1.5 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Ancaman (Threats)</span>
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                          {analysis.swot.threats?.map((t: string, idx: number) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Competitive Moat & Growth Strategy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-400 mb-1">
                      Keunggulan Kompetitif (Moat)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.competitiveMoat}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-xs font-bold text-violet-400 mb-1">
                      Strategi Peluncuran 100 Pengguna
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.growthStrategy}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center">
                <p className="text-xs text-slate-400 mb-3">
                  Klik "Jalankan Analisis" untuk meminta model Gemini AI membedah potensi pasar, matriks SWOT,
                  dan strategi akuisisi pengguna.
                </p>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? 'Menganalisis...' : 'Mulai Analisis AI Sekarang'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
