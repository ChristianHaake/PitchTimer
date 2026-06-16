import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';

const NOTES_STORAGE_KEY = 'pitchtimer_notes';

export function NotesField() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_STORAGE_KEY) || '');

  useEffect(() => {
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
  }, [notes]);

  return (
    <div className="notes-field" style={{ marginTop: 'var(--spacing-6)' }}>
      <label 
        htmlFor="pitch-notes" 
        style={{ 
          display: 'block', 
          marginBottom: 'var(--spacing-2)', 
          fontWeight: 'var(--font-weight-medium)' 
        }}
      >
        {t('notes.title')}
      </label>
      <textarea
        id="pitch-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('notes.placeholder')}
        style={{
          width: '100%',
          minHeight: '120px',
          padding: 'var(--spacing-3)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-workspace)',
          color: 'var(--color-text-primary)',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />
    </div>
  );
}
