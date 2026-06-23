interface ProgressBarProps {
  progress: number;
  label?: string;
}

export function ProgressBar({ progress, label = 'Timer progress' }: ProgressBarProps) {
  return (
    <div 
      className="progress-container"
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        margin: 'var(--spacing-4) 0'
      }}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div 
        className="progress-fill"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-primary)',
          transform: `scaleX(${progress / 100})`,
          transformOrigin: 'left center',
          transition: 'transform 1s linear'
        }}
      />
    </div>
  );
}
