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
import { useAlgorithm, useAlgorithms } from '../api/modelApi';
import { runAlgorithmEngine } from '../engines';
import { useAlgorithmPlayback } from '../hooks/useAlgorithmPlayback';
import AlgorithmDrawer from '../components/common/AlgorithmDrawer';
import LessonWorkspace from '../components/layout/LessonWorkspace';

export default function LessonPage() {
  const [selectedSlug, setSelectedSlug] = useState('linear-regression');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('2d');
  const [hyperparams, setHyperparams] = useState({});
  const [customPoints, setCustomPoints] = useState(null);

  const { data: algorithms = [] } = useAlgorithms();
  const { data: algorithm, isLoading, isError, error } = useAlgorithm(selectedSlug);

  // Cmd/Ctrl + K shortcut to toggle Slide-Over Algorithm Drawer
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

  // Reset defaults when switching algorithms
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

  // 0ms client-side execution
  const history = useMemo(() => {
    if (!algorithm) return [];
    return runAlgorithmEngine(algorithm.slug, activePoints, hyperparams, viewMode);
  }, [algorithm, activePoints, hyperparams, viewMode]);

  const playback = useAlgorithmPlayback(history.length, 550);
  const currentStepData = history[playback.currentStep] || history[0] || null;

  const isSup = algorithm?.category === 'supervised';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* Slide-Over Algorithm Drawer */}
      <AlgorithmDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        algorithms={algorithms}
        selectedSlug={selectedSlug}
        onSelect={(slug) => {
          playback.reset();
          setSelectedSlug(slug);
        }}
      />

      {/* Top Control Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand + Drawer Trigger + Active Algorithm */}
          <div className="flex flex-wrap items-center gap-3">
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
              <span>Explore Algorithms ({algorithms.length || 14})</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-700 text-slate-200 rounded">
                ⌘K
              </kbd>
            </button>

            {algorithm && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0F172A]">
                  {algorithm.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    isSup
                      ? 'bg-[#EEF2FF] text-[#4F46E5]'
                      : 'bg-[#F0FDFA] text-[#0D9488]'
                  }`}
                >
                  {isSup ? 'Supervised' : 'Unsupervised'}
                </span>
              </div>
            )}
          </div>

          {/* Right: 2D/3D Toggle + Playback Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {algorithm?.supports2D3DToggle && (
              <div className="inline-flex rounded-lg bg-[#F1F5F9] p-0.5 border border-slate-200 mr-1">
                {['2d', '3d'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase transition-all ${
                      viewMode === mode
                        ? 'bg-white text-[#0F172A] shadow-sm'
                        : 'text-[#475569]'
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
                className="p-1.5 rounded-md hover:bg-white text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={playback.stepBackward}
                disabled={playback.currentStep <= 0}
                title="Step Back"
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-40 text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={playback.togglePlay}
                className="px-2.5 py-1 rounded-md bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {playback.isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Auto-Play
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={playback.stepForward}
                disabled={playback.currentStep >= playback.maxStep}
                title="Step Forward"
                className="p-1.5 rounded-md hover:bg-white disabled:opacity-40 text-[#475569] hover:text-[#0F172A] transition-colors"
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

      {/* Main Bento Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {isLoading && (
          <div className="flex items-center justify-center h-64 gap-2 text-sm text-[#475569]">
            <Loader2 className="w-5 h-5 animate-spin text-[#4F46E5]" />
            Loading algorithm module...
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
            <p className="text-xs text-[#475569]">{algorithm.summary}</p>
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
            />
          </div>
        )}
      </main>
    </div>
  );
}
