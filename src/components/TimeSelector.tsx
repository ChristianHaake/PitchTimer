import { useTranslation } from '../i18n';

interface TimeSelectorProps {
  timeMode: number;
  setTimeMode: (mode: number) => void;
  disabled: boolean;
}

export function TimeSelector({ timeMode, setTimeMode, disabled }: TimeSelectorProps) {
  const { t } = useTranslation();
  const modes = [30, 60, 90, 120];

  return (
    <div className="time-selector hide-in-presentation" style={{ display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
      {modes.map((mode) => (
        <button
          key={mode}
          className={timeMode === mode ? 'btn-primary' : 'btn-outline'}
          onClick={() => setTimeMode(mode)}
          disabled={disabled}
        >
          {mode} {t('timeSelector.seconds')}
        </button>
      ))}
    </div>
  );
}
