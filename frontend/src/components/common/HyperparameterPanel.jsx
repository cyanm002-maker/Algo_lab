import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export default function HyperparameterPanel({
  hyperparameters = [],
  values = {},
  onChange,
  playback,
  currentStepData
}) {
  const {
    currentStep,
    maxStep,
    isPlaying,
    stepForward,
    stepBackward,
    togglePlay,
    reset,
    goToStep
  } = playback;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            title="Reset to Step 0"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={stepBackward}
            disabled={currentStep <= 0}
            title="Step Back"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Auto-Play
              </>
            )}
          </button>
          <button
            type="button"
            onClick={stepForward}
            disabled={currentStep >= maxStep}
            title="Step Forward"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-sky-300 font-mono">
            Step {currentStep} / {maxStep}
          </span>
          {currentStepData?.phase && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
              {currentStepData.phase}
            </span>
          )}
        </div>
      </div>

      {/* Step Scrubber */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400 w-10">0</span>
        <input
          type="range"
          min={0}
          max={maxStep}
          step={1}
          value={currentStep}
          onChange={(e) => goToStep(Number(e.target.value))}
          aria-label="Iteration Step Scrubber"
          className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
          {maxStep}
        </span>
      </div>

      {/* Hyperparameter Sliders */}
      {hyperparameters.length > 0 && (
        <div className="border-t border-slate-800/80 pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hyperparameters.map((hp) => {
            const val = values[hp.key] ?? hp.defaultValue;
            return (
              <div key={hp.key} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                    {hp.label}
                  </span>
                  <span className="font-mono text-sky-300 bg-slate-800/90 px-2 py-0.5 rounded">
                    {val}
                    {hp.unit ? ` ${hp.unit}` : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={hp.min}
                  max={hp.max}
                  step={hp.step}
                  value={val}
                  onChange={(e) => onChange(hp.key, Number(e.target.value))}
                  aria-label={hp.label}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <p className="text-[11px] text-slate-400 leading-snug">
                  {hp.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
