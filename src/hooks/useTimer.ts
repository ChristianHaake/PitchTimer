import { useState, useEffect, useCallback, useRef } from 'react';
import { playBeep } from '../utils/audio';

const STORAGE_KEY = 'pitchtimer_time_mode';
const TIME_MODES = [30, 60, 90, 120] as const;
const PREP_SECONDS = 3;
const TICK_INTERVAL_MS = 100;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function secondsUntil(deadlineMs: number, nowMs: number) {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export function isSupportedTimeMode(value: number) {
  return TIME_MODES.some((mode) => mode === value);
}

function readStoredTimeMode(initialMode: number) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialMode;

    const parsed = Number.parseInt(saved, 10);
    return isSupportedTimeMode(parsed) ? parsed : initialMode;
  } catch (error) {
    console.error('Failed to read timer mode from local storage:', error);
    return initialMode;
  }
}

interface UseTimerOptions {
  initialMode?: number;
  onComplete?: (mode: number, actualDuration: number) => void;
  onCancel?: (mode: number, actualDuration: number) => void;
}

export function useTimer({ initialMode = 60, onComplete, onCancel }: UseTimerOptions = {}) {
  const [timeMode, setTimeMode] = useState<number>(() => readStoredTimeMode(initialMode));

  const [timeLeft, setTimeLeft] = useState<number>(timeMode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(0);
  const deadlineRef = useRef<number | null>(null);
  const prepDeadlineRef = useRef<number | null>(null);
  const timeLeftRef = useRef(timeLeft);
  const timeModeRef = useRef(timeMode);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    timeModeRef.current = timeMode;
  }, [timeMode]);

  const handleSetTimeMode = (newMode: number) => {
    if (!isSupportedTimeMode(newMode)) return;

    setTimeMode(newMode);
    if (!isRunning && !isPreparing) {
      setTimeLeft(newMode);
    }
  };

  // Persist timeMode
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, timeMode.toString());
    } catch (error) {
      console.error('Failed to save timer mode to local storage:', error);
    }
  }, [timeMode]);

  const start = useCallback(() => {
    const now = Date.now();
    const currentTimeLeft = timeLeftRef.current;

    if (currentTimeLeft === timeModeRef.current) {
      prepDeadlineRef.current = now + PREP_SECONDS * 1000;
      setIsPreparing(true);
      setPrepTimeLeft(PREP_SECONDS);
    } else {
      deadlineRef.current = now + currentTimeLeft * 1000;
      setIsRunning(true);
    }
  }, []);

  const pause = useCallback(() => {
    const deadline = deadlineRef.current;
    if (deadline) {
      setTimeLeft(secondsUntil(deadline, Date.now()));
    }

    deadlineRef.current = null;
    prepDeadlineRef.current = null;
    setIsRunning(false);
    setIsPreparing(false);
  }, []);

  const reset = useCallback(() => {
    const currentTimeLeft = timeLeftRef.current;
    const currentTimeMode = timeModeRef.current;

    if (isRunning || isPreparing || timeLeft < timeMode) {
      onCancel?.(currentTimeMode, Math.max(0, currentTimeMode - currentTimeLeft));
    }

    deadlineRef.current = null;
    prepDeadlineRef.current = null;
    setIsRunning(false);
    setIsPreparing(false);
    setPrepTimeLeft(0);
    setTimeLeft(currentTimeMode);
  }, [isRunning, isPreparing, timeLeft, timeMode, onCancel]);

  useEffect(() => {
    if (!isPreparing && !isRunning) return;

    const interval = window.setInterval(() => {
      const now = Date.now();

      if (isPreparing) {
        const prepDeadline = prepDeadlineRef.current;
        if (!prepDeadline) return;

        const nextPrepTimeLeft = secondsUntil(prepDeadline, now);
        setPrepTimeLeft(nextPrepTimeLeft);

        if (nextPrepTimeLeft === 0) {
          prepDeadlineRef.current = null;
          deadlineRef.current = now + timeLeftRef.current * 1000;
          setIsPreparing(false);
          setIsRunning(true);
        }
        return;
      }

      if (isRunning) {
        const deadline = deadlineRef.current;
        if (!deadline) return;

        const nextTimeLeft = secondsUntil(deadline, now);
        setTimeLeft(nextTimeLeft);

        if (nextTimeLeft === 0) {
          deadlineRef.current = null;
          playBeep();
          setIsRunning(false);
          onComplete?.(timeModeRef.current, timeModeRef.current);
        }
      }
    }, TICK_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isRunning, isPreparing, onComplete]);

  useEffect(() => {
    return () => {
      deadlineRef.current = null;
      prepDeadlineRef.current = null;
    };
  }, []);

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
    progress: clamp(((timeMode - timeLeft) / timeMode) * 100, 0, 100),
  };
}
