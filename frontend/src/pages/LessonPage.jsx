import React, { useEffect, useMemo, useState } from 'react';
import { BrainCircuit, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { useAlgorithm, useAlgorithms } from '../api/modelApi';
import { runLinearRegressionHistory } from '../engines/linearRegressionMath';
import { runKMeansHistory } from '../engines/kMeansMath';
import { useAlgorithmPlayback } from '../hooks/useAlgorithmPlayback';
import LessonWorkspace from '../components/layout/LessonWorkspace';

export default function LessonPage() {
  const [selectedSlug, setSelectedSlug] = useState('linear-regression');
  const [hyperparams, setHyperparams] = useState({});
  const [customPoints, setCustomPoints] = useState(null);

  const { data: algorithms = [], isLoading: isListLoading } = useAlgorithms();
  const {
    data: algorithm,
    isLoading: isLessonLoading,
    isError,
    error
  } = useAlgorithm(selectedSlug);

  // Initialize default hyperparameters when switching lessons
  useEffect(() => {
    if (!algorithm?.hyperparameters) return;
    const defaults = {};
    for (const hp of algorithm.hyperparameters) {
      defaults[hp.key] = hp.defaultValue;
    }
    setHyperparams(defaults);
    setCustomPoints(null);
  }, [algorithm]);

  const activePoints = useMemo(() => {
    if (customPoints) return customPoints;
    return algorithm?.defaultDataset || [];
  }, [customPoints, algorithm]);

  // Execute pure JS math engine locally (0ms network latency)
  const history = useMemo(() => {
    if (!algorithm) return [];
    if (algorithm.slug === 'linear-regression') {
      return runLinearRegressionHistory(activePoints, hyperparams);
    }
    if (algorithm.slug === 'k-means') {
      return runKMeansHistory(activePoints, hyperparams);
    }
    return [];
  }, [algorithm, activePoints, hyperparams]);

  const playback = useAlgorithmPlayback(history.length, 500);
  const currentStepData = history[playback.currentStep] || history[0] || null;

  const handleHyperparamChange = (key, value) => {
    setHyperparams((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPoint = (pt) => {
    setCustomPoints((prev) => {
      const base = prev || algorithm?.defaultDataset || [];
      return [...base, { id: base.length + 1, x: pt.x, y: pt.y }];
    });
  };

  const handleResetPoints = () => {
    setCustomPoints(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation & Lesson Switcher */}
      <header className="border-b border-slate-800/90 bg-slate-950/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                AI/ML Visual Lab
              </h1>
              <p className="text-xs text-slate-400">
                Zero-latency 2D/3D math &amp; code playground
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Lessons">
            {isListLoading ? (
              <span className="text-xs text-slate-400">Loading modules...</span>
            ) : (
              algorithms.map((item) => {
                const isActive = item.slug === selectedSlug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => {
                      playback.reset();
                      setSelectedSlug(item.slug);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-semibold shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{item.title}</span>
                    <span
                      className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : item.category === 'supervised'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-violet-500/15 text-violet-300'
                      }`}
                    >
                      {item.category} · {item.visualizationType.toUpperCase()}
                    </span>
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {isLessonLoading && (
          <div className="flex items-center justify-center h-64 gap-2 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
            Loading curriculum module...
          </div>
        )}

        {isError && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold">Failed to load algorithm module</div>
              <div className="text-xs text-rose-200/80">
                {error?.message || 'Ensure the Express backend is running on port 5000.'}
              </div>
            </div>
          </div>
        )}

        {algorithm && !isLessonLoading && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {algorithm.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {algorithm.summary}
                </p>
              </div>
            </div>

            <LessonWorkspace
              algorithm={algorithm}
              hyperparams={hyperparams}
              onHyperparamChange={handleHyperparamChange}
              playback={playback}
              currentStepData={currentStepData}
              points={activePoints}
              onAddPoint={handleAddPoint}
              onResetPoints={handleResetPoints}
              hasCustomPoints={Boolean(customPoints)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
