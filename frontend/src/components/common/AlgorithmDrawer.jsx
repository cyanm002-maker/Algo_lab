import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, Box, Layers, Sparkles, Terminal } from 'lucide-react';

const DIFFICULTY_STYLES = {
  Foundational: 'bg-slate-100 text-slate-700 border-slate-200',
  Intermediate: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Advanced: 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function AlgorithmDrawer({
  isOpen,
  onClose,
  domains = [],
  algorithms = [],
  libraries = [],
  selectedSlug,
  onSelect
}) {
  const [mode, setMode] = useState('algorithms'); // 'algorithms' | 'libraries'
  const [activeDomain, setActiveDomain] = useState('all');
  const [filter, setFilter] = useState('all'); // 'all' | '2d' | '3d' | 'supervised' | 'unsupervised' | 'deep-learning'
  const [query, setQuery] = useState('');
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

  const filteredAlgorithms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return algorithms.filter((item) => {
      if (activeDomain !== 'all' && item.domainId !== activeDomain) return false;
      if (filter === '2d' && item.visualizationType !== '2d') return false;
      if (filter === '3d' && item.visualizationType !== '3d' && !item.supports2D3DToggle) return false;
      if (filter === 'supervised' && item.category !== 'supervised') return false;
      if (filter === 'unsupervised' && item.category !== 'unsupervised') return false;
      if (
        filter === 'deep-learning' &&
        !['deep-learning', 'transformers-nlp', 'computer-vision', 'generative-ai'].includes(item.domainId)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.domainTitle?.toLowerCase().includes(q)
      );
    });
  }, [algorithms, activeDomain, filter, query]);

  const filteredLibraries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return libraries.filter(
      (lib) =>
        !q ||
        lib.title.toLowerCase().includes(q) ||
        lib.summary.toLowerCase().includes(q)
    );
  }, [libraries, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px]"
      />

      <aside
        aria-label="Dual-Mode Curriculum Drawer"
        className="relative z-10 w-full max-w-3xl bg-white border-r border-slate-200 shadow-2xl flex flex-col h-full"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-[#F8FAFC] flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Segmented Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('algorithms')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mode === 'algorithms'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                AI &amp; ML Algorithms ({algorithms.length})
              </button>
              <button
                type="button"
                onClick={() => setMode('libraries')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  mode === 'libraries'
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
                Python AI Stack ({libraries.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                mode === 'algorithms'
                  ? 'Search 220+ algorithms (e.g. Transformer, PPO, PCA, XGBoost, Diffusion)...'
                  : 'Search Python libraries (NumPy, Pandas, PyTorch, Scikit-Learn, Matplotlib)...'
              }
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-[#4F46E5]"
            />
          </div>

          {mode === 'algorithms' && (
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: '2d', label: '2D' },
                { id: '3d', label: '3D' },
                { id: 'supervised', label: 'Supervised' },
                { id: 'unsupervised', label: 'Unsupervised' },
                { id: 'deep-learning', label: 'Deep Learning & AI' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                    filter === pill.id
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#475569] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Body */}
        {mode === 'algorithms' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Domain Rail (13 Domains) */}
            <div className="w-52 border-r border-slate-200 bg-[#F8FAFC] overflow-y-auto p-2 space-y-1 hidden sm:block">
              <button
                type="button"
                onClick={() => setActiveDomain('all')}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  activeDomain === 'all'
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-[#475569] hover:bg-slate-100'
                }`}
              >
                <span>All 13 Domains</span>
                <span className="font-mono text-[10px]">{algorithms.length}</span>
              </button>
              {domains.map((dom) => (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setActiveDomain(dom.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between gap-1 ${
                    activeDomain === dom.id
                      ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                      : 'text-[#475569] hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{dom.shortTitle}</span>
                  <span className="font-mono text-[10px] opacity-75">{dom.count}</span>
                </button>
              ))}
            </div>

            {/* Right Algorithm Cards */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 content-start">
              {filteredAlgorithms.map((item) => {
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
                    className={`text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-[#4F46E5] ring-1 ring-[#4F46E5]/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0F172A] line-clamp-1">
                        {item.title}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border shrink-0 inline-flex items-center gap-0.5 ${
                          is3D || item.supports2D3DToggle
                            ? 'bg-[#FFFBEB] text-[#D97706] border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {is3D ? <Box className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                        {item.supports2D3DToggle ? '2D/3D' : item.visualizationType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#475569] line-clamp-2">{item.summary}</p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSup ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#F0FDFA] text-[#0D9488]'
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
              })}
            </div>
          </div>
        ) : (
          /* Tab 2: Python AI Stack & Libraries */
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
            {filteredLibraries.map((lib) => {
              const isSelected = lib.slug === selectedSlug;
              return (
                <button
                  key={lib.slug}
                  type="button"
                  onClick={() => {
                    onSelect(lib.slug);
                    onClose();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-[#2563EB] ring-1 ring-[#2563EB]/30'
                      : 'bg-white border-slate-200 hover:border-[#2563EB]/50 hover:bg-[#EFF6FF]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0F172A]">{lib.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-200">
                      {lib.visualizationType.toUpperCase()} Lab
                    </span>
                  </div>
                  <p className="text-xs text-[#475569]">{lib.summary}</p>
                  <span className="text-[11px] font-mono text-[#2563EB] font-semibold">
                    Archetype: {lib.visualArchetype}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}
