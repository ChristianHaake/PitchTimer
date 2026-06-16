import { useTranslation } from '../i18n';

interface TimerControlsProps {
  isRunning: boolean;
  isPreparing?: boolean;
  timeLeft: number;
  timeMode: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({ isRunning, isPreparing, timeLeft, timeMode, onStart, onPause, onReset }: TimerControlsProps) {
  const { t } = useTranslation();
  const isFinished = timeLeft === 0;
  const active = isRunning || isPreparing;

  return (
    <div 
      className="timer-controls"
      style={{
        display: 'flex',
        gap: 'var(--spacing-4)',
        justifyContent: 'center',
        margin: 'var(--spacing-6) 0'
      }}
    >
      {!active && timeLeft > 0 && (
        <button onClick={onStart} className="btn-primary">
          {t('timer.start')}
        </button>
      )}
      
      {active && (
        <button onClick={onPause} className="btn-secondary">
          {t('timer.pause')}
        </button>
      )}
      
      {(!active && timeLeft !== timeMode) || isFinished ? (
        <button onClick={onReset} className="btn-secondary">
          {t('timer.reset')}
        </button>
      ) : null}
    </div>
  );
}
