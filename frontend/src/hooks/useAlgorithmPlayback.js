import { useCallback, useEffect, useState } from 'react';

/**
 * Playback controller for stepping through precomputed algorithm history.
 * Auto-Play advances every 1500ms so 2D/3D animations complete smoothly.
 */
export function useAlgorithmPlayback(totalSteps, intervalMs = 1500) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const maxStep = Math.max(0, totalSteps - 1);

  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, maxStep));
  }, [maxStep]);

  useEffect(() => {
    if (!isPlaying || totalSteps <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= maxStep) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, maxStep, totalSteps, intervalMs]);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(maxStep, prev + 1));
  }, [maxStep]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentStep >= maxStep) {
        setCurrentStep(0);
      }
      return !prev;
    });
  }, [currentStep, maxStep]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const goToStep = useCallback(
    (stepIndex) => {
      setIsPlaying(false);
      setCurrentStep(Math.max(0, Math.min(maxStep, stepIndex)));
    },
    [maxStep]
  );

  return {
    currentStep,
    maxStep,
    isPlaying,
    stepForward,
    stepBackward,
    togglePlay,
    reset,
    goToStep
  };
}
