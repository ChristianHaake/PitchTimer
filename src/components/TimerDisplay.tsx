import { useTranslation } from '../i18n';

interface TimerDisplayProps {
  timeLeft: number;
  isPreparing?: boolean;
  prepTimeLeft?: number;
}

export function TimerDisplay({ timeLeft, isPreparing, prepTimeLeft }: TimerDisplayProps) {
  const { t } = useTranslation();

  if (isPreparing) {
    return (
      <div 
        className="timer-display"
        style={{ 
          fontSize: '3rem', 
          fontWeight: 'var(--font-weight-bold)', 
          textAlign: 'center',
          margin: 'var(--spacing-6) 0',
          color: 'var(--color-text-secondary)'
        }}
        aria-live="polite"
      >
        {t('timer.prepare', String(prepTimeLeft))}
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // Simple Ampelanzeige logic as an MVP extension
  // Red if <= 5 seconds left, Yellow if <= 15 seconds, otherwise normal color
  let color = 'inherit';
  if (timeLeft <= 5 && timeLeft > 0) color = 'var(--color-error)';
  else if (timeLeft <= 15 && timeLeft > 0) color = '#eab308'; // Yellow-ish warning

  return (
    <div 
      className="timer-display"
      style={{ 
        fontSize: '4rem', 
        fontWeight: 'var(--font-weight-bold)', 
        textAlign: 'center',
        margin: 'var(--spacing-6) 0',
        fontVariantNumeric: 'tabular-nums',
        color 
      }}
      aria-live="polite"
    >
      {formattedMinutes}:{formattedSeconds}
    </div>
  );
}
