import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Box, Layers, Sparkles } from 'lucide-react';

const DIFFICULTY_STYLES = {
  Foundational: 'bg-slate-100 text-slate-700 border-slate-200',
  Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Advanced: 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function AlgorithmDrawer({
  isOpen,
  onClose,
  algorithms = [],
  selectedSlug,
  onSelect
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'supervised' | 'unsupervised' | '3d'
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const counts = useMemo(() => {
    const sup = algorithms.filter((a) => a.category === 'supervised').length;
    const unsup = algorithms.filter((a) => a.category === 'unsupervised').length;
    const threeD = algorithms.filter(
      (a) => a.visualizationType === '3d' || a.supports2D3DToggle
    ).length;
    return { all: algorithms.length, sup, unsup, threeD };
  }, [algorithms]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return algorithms.filter((item) => {
      if (filter === 'supervised' && item.category !== 'supervised') return false;
      if (filter === 'unsupervised' && item.category !== 'unsupervised') return false;
      if (
        filter === '3d' &&
        item.visualizationType !== '3d' &&
        !item.supports2D3DToggle
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.difficulty.toLowerCase().includes(q)
      );
    });
  }, [algorithms, filter, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] transition-opacity"
      />

      {/* Sliding Left Drawer */}
      <aside
        aria-label="Algorithm Curriculum Drawer"
        className="relative z-10 w-full max-w-md bg-white border-r border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-200"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                Explore Algorithms ({algorithms.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search regression, SVM, PCA, clustering..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#4F46E5]"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'supervised', label: `Supervised (${counts.sup})` },
              { id: 'unsupervised', label: `Unsupervised (${counts.unsup})` },
              { id: '3d', label: `3D Models (${counts.threeD})` }
            ].map((pill) => {
              const active = filter === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                    active
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#475569] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Algorithm Cards List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No algorithms match "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.slug === selectedSlug;
              const isSup = item.category === 'supervised';
              const is3D = item.visualizationType === '3d';
              return (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => {
                    onSelect(item.slug);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-[#4F46E5] ring-1 ring-[#4F46E5]/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400">
                        {String(item.order || '').padStart(2, '0')}
                      </span>
                      {item.title}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border inline-flex items-center gap-0.5 ${
                          is3D || item.supports2D3DToggle
                            ? 'bg-[#FFFBEB] text-[#D97706] border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {is3D ? <Box className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                        {item.supports2D3DToggle ? '2D/3D' : item.visualizationType.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#475569] line-clamp-1">
                    {item.summary}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        isSup
                          ? 'bg-[#EEF2FF] text-[#4F46E5]'
                          : 'bg-[#F0FDFA] text-[#0D9488]'
                      }`}
                    >
                      {isSup ? 'Supervised' : 'Unsupervised'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        DIFFICULTY_STYLES[item.difficulty] || DIFFICULTY_STYLES.Foundational
                      }`}
                    >
                      {item.difficulty}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
