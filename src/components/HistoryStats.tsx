import { useState } from 'react';
import { type PitchRecord } from '../utils/history';
import { useTranslation } from '../i18n';

interface HistoryStatsProps {
  history: PitchRecord[];
  onClear: () => void;
}

export function HistoryStats({ history, onClear }: HistoryStatsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (history.length === 0) {
    return null;
  }

  const handleClear = () => {
    if (window.confirm(t('history.clearConfirm'))) {
      onClear();
    }
  };

  return (
    <div className="history-stats hide-in-presentation" style={{ marginTop: 'var(--spacing-8)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-6)' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="btn-outline"
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>{isOpen ? t('history.hide') : t('history.show')} ({history.length})</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              {t('history.empty')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {history.map((record) => (
                <div key={record.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-bg-workspace)',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: `4px solid ${record.status === 'completed' ? 'var(--color-primary)' : 'var(--color-error)'}`
                }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {record.status === 'completed' ? t('history.status.completed') : t('history.status.cancelled')}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {new Date(record.date).toLocaleDateString()} {new Date(record.date).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 'var(--font-size-sm)' }}>
                    <div>{t('history.target')} {record.timeMode}s</div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)' }}>{t('history.actual')} {record.actualDuration}s</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {history.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
              <button 
                onClick={handleClear} 
                className="btn-outline" 
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              >
                {t('history.clear')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
