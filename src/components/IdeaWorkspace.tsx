import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Tag,
  CheckCircle,
  Clock,
  Hammer,
  CheckCheck,
  ChevronRight
} from 'lucide-react';
import { AppIdea, saveIdeaToFirestore, deleteIdeaFromFirestore } from '../lib/firebase';

interface IdeaWorkspaceProps {
  userId: string;
  ideas: AppIdea[];
  onOpenAnalysis: (idea: AppIdea) => void;
  onOpenManual: () => void;
  onGoToGenerator: () => void;
}

export const IdeaWorkspace: React.FC<IdeaWorkspaceProps> = ({
  userId,
  ideas,
  onOpenAnalysis,
  onOpenManual,
  onGoToGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories
  const categories = ['Semua', ...Array.from(new Set(ideas.map((i) => i.category).filter(Boolean)))];

  // Filtered ideas
  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.tags && idea.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      idea.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Semua' || idea.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'Semua' || idea.status === selectedStatus;

    const matchesFavorite = !onlyFavorites || idea.isFavorite;

    return matchesSearch && matchesCategory && matchesStatus && matchesFavorite;
  });

  const handleToggleFavorite = async (idea: AppIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveIdeaToFirestore(userId, {
        ...idea,
        isFavorite: !idea.isFavorite,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleStatusChange = async (idea: AppIdea, newStatus: AppIdea['status']) => {
    try {
      await saveIdeaToFirestore(userId, {
        ...idea,
        status: newStatus,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (ideaId: string) => {
    setIsDeleting(true);
    try {
      await deleteIdeaFromFirestore(userId, ideaId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menghapus ide: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportAllAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ideas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ideaflow_ideas_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getStatusBadge = (status: AppIdea['status']) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Draft</span>
          </span>
        );
      case 'Validasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <TrendingUp className="w-3 h-3 text-amber-400" />
            <span>Validasi</span>
          </span>
        );
      case 'Dalam Pengembangan':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Hammer className="w-3 h-3 text-indigo-400" />
            <span>Dev</span>
          </span>
        );
      case 'Rilis':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCheck className="w-3 h-3 text-emerald-400" />
            <span>Rilis</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Koleksi Ide Aplikasi Saya
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Firestore Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Semua data tersimpan secara privat pada database Firestore akun Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {ideas.length > 0 && (
            <button
              type="button"
              onClick={exportAllAsJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenManual}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>+ Catat Ide Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul ide, tag, atau kata kunci..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Kategori: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Validasi">Validasi</option>
              <option value="Dalam Pengembangan">Dalam Pengembangan</option>
              <option value="Rilis">Rilis</option>
            </select>
          </div>

          {/* Favorite Toggle Button */}
          <div className="md:col-span-2 flex items-center">
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all border ${
                onlyFavorites
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorit Saja</span>
            </button>
          </div>
        </div>

        {/* Quick count indicator */}
        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
          <span>Menampilkan {filteredIdeas.length} dari total {ideas.length} ide</span>
          {onlyFavorites && (
            <span className="text-amber-400 font-medium">Filter favorit aktif</span>
          )}
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="group bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {idea.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(idea, e)}
                      title={idea.isFavorite ? 'Hapus dari favorit' : 'Tandai sebagai favorit'}
                      className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          idea.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors line-clamp-1 mb-1.5">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                  {idea.summary}
                </p>

                {/* Target Audience & Stack */}
                <div className="text-[11px] text-slate-400 space-y-1 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div className="truncate">
                    <strong className="text-slate-300">Target:</strong> {idea.targetAudience}
                  </div>
                  <div className="truncate">
                    <strong className="text-slate-300">Stack:</strong> {idea.techStack}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-3">
                {/* Status Switcher & Date */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={idea.status}
                      onChange={(e) => handleStatusChange(idea, e.target.value as AppIdea['status'])}
                      className="text-[11px] font-medium bg-slate-950 text-slate-300 border border-slate-800 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Validasi">Validasi</option>
                      <option value="Dalam Pengembangan">Dalam Dev</option>
                      <option value="Rilis">Rilis</option>
                    </select>
                    {getStatusBadge(idea.status)}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(idea.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {/* Actions: Deep Dive & Delete */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenAnalysis(idea)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Analisis AI & Detail</span>
                  </button>

                  {deleteConfirmId === idea.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(idea.id)}
                        disabled={isDeleting}
                        className="px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold"
                      >
                        Yakin?
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(idea.id)}
                      title="Hapus ide dari Firestore"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center bg-slate-900/30">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {ideas.length === 0
              ? 'Belum ada ide yang disimpan'
              : 'Tidak ada ide yang sesuai dengan filter'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            {ideas.length === 0
              ? 'Gunakan Generator AI untuk menghasilkan ide aplikasi dengan Gemini 2.5 Flash, atau catat ide manual Anda sendiri.'
              : 'Coba ubah kata kunci pencarian atau sesuaikan pilihan kategori dan status.'}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoToGenerator}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buka Generator AI</span>
            </button>
            <button
              type="button"
              onClick={onOpenManual}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <span>+ Buat Manual</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
