import React, { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  PanelLeftOpen,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAlgorithm, useCurriculum } from '../api/modelApi';
import { runAlgorithmEngine } from '../engines';
import { useAlgorithmPlayback } from '../hooks/useAlgorithmPlayback';
import AlgorithmDrawer from '../components/common/AlgorithmDrawer';
import LessonWorkspace from '../components/layout/LessonWorkspace';

const FLAGSHIP_PILLS = [
  { slug: 'gradient-descent-batch-gd', label: 'Gradient Descent 3D' },
  { slug: 'linear-regression', label: 'Linear Regression 2D' },
  { slug: 'k-means', label: 'K-Means 3D' },
  { slug: 'numpy-tensor-lab', label: 'NumPy 3D Cube' }
];

export default function LessonPage() {
  const [selectedSlug, setSelectedSlug] = useState('gradient-descent-batch-gd');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  const [hyperparams, setHyperparams] = useState({});
  const [customPoints, setCustomPoints] = useState(null);

  const { data: curriculum } = useCurriculum();
  const algorithms = curriculum?.data || [];
  const domains = curriculum?.domains || [];
  const libraries = curriculum?.libraries || [];

  const { data: algorithm, isLoading, isError, error } = useAlgorithm(selectedSlug);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!algorithm) return;
    const defaults = {};
    for (const hp of algorithm.hyperparameters || []) {
      defaults[hp.key] = hp.defaultValue;
    }
    setHyperparams(defaults);
    setViewMode(algorithm.visualizationType || '2d');
    setCustomPoints(null);
  }, [algorithm]);

  const activePoints = useMemo(
    () => customPoints || algorithm?.defaultDataset || [],
    [customPoints, algorithm]
  );

  const history = useMemo(() => {
    if (!algorithm) return [];
    return runAlgorithmEngine(algorithm, activePoints, hyperparams, viewMode);
  }, [algorithm, activePoints, hyperparams, viewMode]);

  // Auto-advances every 1.5s
  const playback = useAlgorithmPlayback(history.length, 1500);
  const currentStepData = history[playback.currentStep] || history[0] || null;

  const badgeStyle =
    algorithm?.category === 'library'
      ? 'bg-[#EFF6FF] text-[#2563EB]'
      : algorithm?.category === 'supervised'
      ? 'bg-[#EEF2FF] text-[#4F46E5]'
      : 'bg-[#F0FDFA] text-[#0D9488]';

  const selectTopic = (slug) => {
    playback.reset();
    setSelectedSlug(slug);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <AlgorithmDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        domains={domains}
        algorithms={algorithms}
        libraries={libraries}
        selectedSlug={selectedSlug}
        onSelect={selectTopic}
      />

      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200/70">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#0F172A] hidden sm:inline">
                AI/ML Studio
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <PanelLeftOpen className="w-3.5 h-3.5" />
              <span>Explore ({algorithms.length || 222} + {libraries.length || 5} Labs)</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            {/* 4 Flagship Quick-Jump Pills */}
            <div className="hidden xl:flex items-center gap-1.5 pl-1 border-l border-slate-200">
              {FLAGSHIP_PILLS.map((pill) => (
                <button
                  key={pill.slug}
                  type="button"
                  onClick={() => selectTopic(pill.slug)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                    selectedSlug === pill.slug
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'bg-white text-[#475569] border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {algorithm && (
              <div className="flex items-center gap-2 xl:hidden">
                <span className="text-sm font-bold text-[#0F172A]">{algorithm.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeStyle}`}>
                  {algorithm.domainTitle || algorithm.category}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {algorithm?.supports2D3DToggle && (
              <div className="inline-flex rounded-lg bg-[#F1F5F9] p-0.5 border border-slate-200 mr-1">
                {['2d', '3d'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-all ${
                      viewMode === mode ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#475569]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={playback.reset}
                title="Reset"
                className="p-1.5 rounded-md hover:bg-white text-[#475569] hover:text-[#0F172A]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={playback.stepBackward}
                disabled={playback.currentStep <= 0}
                title="Step Back"
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-40 text-[#475569] hover:text-[#0F172A]"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={playback.togglePlay}
                className="px-2.5 py-1 rounded-md bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                {playback.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Play
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={playback.stepForward}
                disabled={playback.currentStep >= playback.maxStep}
                title="Step Forward"
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-40 text-[#475569] hover:text-[#0F172A]"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono font-semibold text-[#475569]">
                {playback.currentStep}/{playback.maxStep}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {isLoading && (
          <div className="flex items-center justify-center h-64 gap-2 text-sm text-[#475569]">
            <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5]" />
            Loading curriculum module...
          </div>
        )}

        {isError && (
          <div className="bento-card p-5 border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold">Failed to load module</div>
              <div className="text-xs">{error?.message}</div>
            </div>
          </div>
        )}

        {algorithm && !isLoading && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-[#0F172A]">{algorithm.title}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeStyle}`}>
                    {algorithm.domainTitle || algorithm.category}
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-0.5">{algorithm.summary}</p>
              </div>
            </div>

            <LessonWorkspace
              algorithm={algorithm}
              viewMode={viewMode}
              hyperparams={hyperparams}
              onHyperparamChange={(k, v) =>
                setHyperparams((prev) => ({ ...prev, [k]: v }))
              }
              currentStepData={currentStepData}
              onAddPoint={(pt) =>
                setCustomPoints((prev) => {
                  const base = prev || algorithm.defaultDataset || [];
                  return [...base, { id: base.length + 1, x: pt.x, y: pt.y }];
                })
              }
              onMoveQuery={(q) =>
                setHyperparams((prev) => ({ ...prev, queryPoint: q }))
              }
              onResetPoints={() => setCustomPoints(null)}
              hasCustomPoints={Boolean(customPoints)}
              onSelectLibrary={selectTopic}
            />
          </div>
        )}
      </main>
    </div>
  );
}
