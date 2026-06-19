import { useEffect } from 'react';

interface WakeLockSentinel {
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
  removeEventListener: (type: 'release', listener: () => void) => void;
}

interface NavigatorWakeLockAccess {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}

export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let sentinel: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      const wakeLock = (navigator as NavigatorWakeLockAccess).wakeLock;
      if (!wakeLock || document.visibilityState !== 'visible') return;

      try {
        sentinel = await wakeLock.request('screen');
        sentinel.addEventListener('release', handleRelease);
      } catch (error) {
        console.info('Screen wake lock unavailable:', error);
      }
    };

    const handleRelease = () => {
      sentinel?.removeEventListener('release', handleRelease);
      sentinel = null;
      if (!cancelled && document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestWakeLock();
      }
    };

    void requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sentinel?.removeEventListener('release', handleRelease);
      void sentinel?.release().catch(() => undefined);
      sentinel = null;
    };
  }, [enabled]);
}
