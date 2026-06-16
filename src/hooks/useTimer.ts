import { useState, useEffect, useCallback } from 'react';
import { playBeep } from '../utils/audio';

const STORAGE_KEY = 'pitchtimer_time_mode';

interface UseTimerOptions {
  initialMode?: number;
  onComplete?: (mode: number, actualDuration: number) => void;
  onCancel?: (mode: number, actualDuration: number) => void;
}

export function useTimer({ initialMode = 60, onComplete, onCancel }: UseTimerOptions = {}) {
  const [timeMode, setTimeMode] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      return Number.isNaN(parsed) ? initialMode : parsed;
    }
    return initialMode;
  });

  const [timeLeft, setTimeLeft] = useState<number>(timeMode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(0);

  const handleSetTimeMode = (newMode: number) => {
    setTimeMode(newMode);
    if (!isRunning && !isPreparing) {
      setTimeLeft(newMode);
    }
  };

  // Persist timeMode
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, timeMode.toString());
  }, [timeMode]);

  const start = useCallback(() => {
    if (timeLeft === timeMode) {
      setIsPreparing(true);
      setPrepTimeLeft(3);
    } else {
      setIsRunning(true);
    }
  }, [timeLeft, timeMode]);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPreparing(false);
  }, []);

  const reset = useCallback(() => {
    if (isRunning || isPreparing || timeLeft < timeMode) {
      onCancel?.(timeMode, timeMode - timeLeft);
    }
    setIsRunning(false);
    setIsPreparing(false);
    setTimeLeft(timeMode);
  }, [timeMode, isRunning, isPreparing, timeLeft, onCancel]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isPreparing && prepTimeLeft > 0) {
      interval = setInterval(() => {
        setPrepTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPreparing(false);
            setIsRunning(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep();
            setIsRunning(false);
            onComplete?.(timeMode, timeMode);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPreparing, prepTimeLeft, timeLeft, timeMode, onComplete]);

  return {
    timeMode,
    setTimeMode: handleSetTimeMode,
    timeLeft,
    isRunning,
    isPreparing,
    prepTimeLeft,
    start,
    pause,
    reset,
    progress: ((timeMode - timeLeft) / timeMode) * 100,
  };
}
