import { useState, useRef } from 'react';
import { useTranslation } from '../i18n';

const NOTES_STORAGE_KEY = 'pitchtimer_notes';
const MAX_NOTES_FILE_SIZE_BYTES = 100 * 1024;

export function NotesField() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    } catch (error) {
      console.error('Failed to read pitch notes from local storage:', error);
      return '';
    }
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateNotes = (nextNotes: string) => {
    setNotes(nextNotes);
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, nextNotes);
    } catch (error) {
      console.error('Failed to save pitch notes to local storage:', error);
      setError(t('notes.saveError'));
    }
  };

  const handleSave = () => {
    setError(null);
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitch-notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > MAX_NOTES_FILE_SIZE_BYTES) {
      setError(t('notes.fileTooLarge'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        if (notes.trim().length > 0 && content !== notes && !window.confirm(t('notes.replaceConfirm'))) {
          return;
        }
        updateNotes(content);
      }
    };
    reader.onerror = () => {
      setError(t('notes.openError'));
    };
    reader.readAsText(file);
    // Reset input so the same file can be opened again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="notes-field" style={{ marginTop: 'var(--spacing-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-2)' }}>
        <label 
          htmlFor="pitch-notes" 
          style={{ 
            fontWeight: 'var(--font-weight-medium)' 
          }}
        >
          {t('notes.title')}
        </label>
        
        <div className="hide-in-presentation" style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-outline" 
            style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={t('notes.open')}
          >
            <span>{t('notes.open')}</span>
          </button>
          <button 
            onClick={handleSave} 
            className="btn-outline" 
            style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={t('notes.save')}
          >
            <span>{t('notes.save')}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".txt,.md" 
            onChange={handleOpen} 
          />
        </div>
      </div>
      <textarea
        id="pitch-notes"
        value={notes}
        onChange={(e) => updateNotes(e.target.value)}
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
        {error && (
          <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
            {error}
          </p>
        )}
    </div>
  );
}
