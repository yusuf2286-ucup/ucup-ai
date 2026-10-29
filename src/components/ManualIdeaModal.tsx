import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  Tag,
  DollarSign,
  Layers,
  Code
} from 'lucide-react';
import { saveIdeaToFirestore } from '../lib/firebase';

interface ManualIdeaModalProps {
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

export const ManualIdeaModal: React.FC<ManualIdeaModalProps> = ({
  userId,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SaaS & AI Productivity');
  const [targetAudience, setTargetAudience] = useState('');
  const [techStack, setTechStack] = useState('React, Node.js Express, Firebase, Gemini API');
  const [summary, setSummary] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [monetization, setMonetization] = useState('Freemium Subscription');
  const [status, setStatus] = useState<'Draft' | 'Validasi' | 'Dalam Pengembangan' | 'Rilis'>('Draft');
  const [tags, setTags] = useState('Web App, MVP');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setErrorMsg('Judul dan ringkasan ide wajib diisi');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      await saveIdeaToFirestore(userId, {
        title: title.trim(),
        category,
        targetAudience: targetAudience.trim() || 'Pengguna Umum',
        techStack: techStack.trim() || 'Modern Web Stack',
        summary: summary.trim(),
        keyFeatures: keyFeatures.trim() || 'Fitur MVP Utama',
        monetization: monetization.trim() || 'Freemium',
        status,
        tags: tags.trim() || 'Web App',
        notes: notes.trim(),
      });

      onSaved();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal menyimpan ide ke Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!title.trim() && !summary.trim()) {
      setErrorMsg('Isi judul atau sedikit ringkasan terlebih dahulu agar AI bisa mengembangkannya');
      return;
    }

    setIsEnhancing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          problemSpace: `${title}: ${summary}`,
          targetAudience: targetAudience || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.idea) {
        const idea = data.idea;
        if (!title.trim()) setTitle(idea.title);
        if (!summary.trim() || summary.length < 50) setSummary(idea.summary);
        if (!targetAudience.trim()) setTargetAudience(idea.targetAudience);
        if (!keyFeatures.trim()) {
          setKeyFeatures(
            Array.isArray(idea.keyFeatures) ? idea.keyFeatures.map((f: string) => `• ${f}`).join('\n') : idea.keyFeatures
          );
        }
        if (!monetization.trim()) setMonetization(idea.monetization);
        if (idea.techStack && typeof idea.techStack === 'object') {
          setTechStack(`${idea.techStack.frontend || 'React'}, ${idea.techStack.backend || 'Express'}, ${idea.techStack.database || 'Firebase'}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal menyempurnakan dengan AI: ' + err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Catat Ide Aplikasi Manual</h3>
              <p className="text-xs text-slate-400">Simpan langsung ke koleksi Firestore privat Anda</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Judul Aplikasi *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: InvoiceBot AI"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="SaaS & AI Productivity">SaaS & AI Productivity</option>
                <option value="Fintech & Keuangan">Fintech & Keuangan</option>
                <option value="EdTech & Pendidikan">EdTech & Pendidikan</option>
                <option value="UMKM & E-Commerce">UMKM & E-Commerce</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Social & Community">Social & Community</option>
                <option value="Workflow Automation">Workflow Automation</option>
              </select>
            </div>
          </div>

          {/* AI Helper Banner */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Butuh bantuan merumuskan ide? AI Gemini bisa melengkapinya.</span>
            </div>
            <button
              type="button"
              onClick={handleEnhanceWithAI}
              disabled={isEnhancing}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shrink-0"
            >
              {isEnhancing ? 'Mengisi...' : 'Bantu Lengkapi'}
            </button>
          </div>

          {/* Target Audience & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Target Audiens / Pasar
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Contoh: Freelancer & UMKM Kuliner"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Tech Stack
              </label>
              <input
                type="text"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="React, Express, Firebase"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Ringkasan Konsep Aplikasi *
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Deskripsikan masalah yang ingin diselesaikan dan bagaimana solusi aplikasi Anda bekerja..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Key Features */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
              Fitur Kunci (Tulis per baris)
            </label>
            <textarea
              rows={3}
              value={keyFeatures}
              onChange={(e) => setKeyFeatures(e.target.value)}
              placeholder="• Fitur 1: Integrasi WhatsApp API&#10;• Fitur 2: Generate invoice PDF otomatis&#10;• Fitur 3: Dashboard analisis penjualan"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Monetization & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Model Monetisasi
              </label>
              <input
                type="text"
                value={monetization}
                onChange={(e) => setMonetization(e.target.value)}
                placeholder="Freemium, $9/bulan, Ads"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Status Saat Ini
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Draft">Draft</option>
                <option value="Validasi">Validasi Pasar</option>
                <option value="Dalam Pengembangan">Dalam Pengembangan</option>
                <option value="Rilis">Rilis Publik</option>
              </select>
            </div>
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Tag / Label (Pisahkan koma)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, SaaS, B2B"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Catatan Pribadi
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Rencana MVP dalam 2 minggu..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan ke Firestore...' : 'Simpan Ide ke Firestore'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
