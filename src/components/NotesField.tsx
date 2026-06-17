import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../i18n';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Download, Upload } from 'lucide-react';

const NOTES_STORAGE_KEY = 'pitchtimer_notes';
const MAX_NOTES_FILE_SIZE_BYTES = 100 * 1024;

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-toolbar hide-in-presentation">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="toolbar-divider" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <div className="toolbar-divider" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
};

const NOTES_TITLE_KEY = 'pitchtimer_notes_title';

export function NotesField() {
  const { t } = useTranslation();
  
  const [error, setError] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState<string>(() => {
    try {
      const savedContent = localStorage.getItem(NOTES_STORAGE_KEY) || '';
      const plainText = savedContent.replace(/<[^>]+>/g, ' ');
      const words = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
      const totalSeconds = Math.round((words / 130) * 60);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    } catch {
      return '0:00';
    }
  });
  const [pitchTitle, setPitchTitle] = useState<string>(() => {
    return localStorage.getItem(NOTES_TITLE_KEY) || '';
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const totalSeconds = Math.round((words / 130) * 60);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    setReadingTime(`${mins}:${secs.toString().padStart(2, '0')}`);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, editor.getHTML());
        calculateReadingTime(editor.getText());
      } catch (error) {
        console.error('Failed to save pitch notes to local storage:', error);
        setError(t('notes.saveError'));
      }
    },
  });

  // Load initial content on mount
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      try {
        const savedContent = localStorage.getItem(NOTES_STORAGE_KEY) || '';
        if (savedContent) {
          editor.commands.setContent(savedContent);
        }
      } catch (error) {
        console.error('Failed to read pitch notes from local storage:', error);
      }
    }
  }, [editor]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPitchTitle(newTitle);
    localStorage.setItem(NOTES_TITLE_KEY, newTitle);
  };

  const handleSave = () => {
    setError(null);
    if (!editor) return;
    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Generate filename based on title or default
    const safeTitle = pitchTitle.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = safeTitle ? `${safeTitle}.html` : 'pitch-notes.html';
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

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
        const currentContent = editor.getHTML();
        if (editor.getText().trim().length > 0 && currentContent !== content && !window.confirm(t('notes.replaceConfirm'))) {
          return;
        }
        editor.commands.setContent(content);
        calculateReadingTime(editor.getText());
        try {
          localStorage.setItem(NOTES_STORAGE_KEY, content);
          
          // Also set title based on filename if possible
          const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
          setPitchTitle(fileNameNoExt);
          localStorage.setItem(NOTES_TITLE_KEY, fileNameNoExt);
        } catch (error) {
          console.error('Failed to save pitch notes to local storage:', error);
        }
      }
    };
    reader.onerror = () => {
      setError(t('notes.openError'));
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="notes-field" style={{ marginTop: 'var(--spacing-6)' }}>
      <div style={{ marginBottom: 'var(--spacing-2)' }}>
        <input 
          type="text"
          value={pitchTitle}
          onChange={handleTitleChange}
          placeholder={t('notes.title')}
          className="pitch-title-input"
          style={{
            width: '100%',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-bold)',
            border: 'none',
            borderBottom: '2px solid transparent',
            padding: 'var(--spacing-2) 0',
            backgroundColor: 'transparent',
            outline: 'none',
            color: 'var(--color-text)'
          }}
        />
      </div>
      
      <div className="tiptap-container">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className="hide-in-presentation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--spacing-2)' }}>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-medium)' }}>
          {t('notes.readingTime') || 'Lesezeit:'} ~{readingTime} min
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-outline" 
            style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={t('notes.open')}
          >
            <Upload size={14} />
            <span>{t('notes.open')}</span>
          </button>
          <button 
            onClick={handleSave} 
            className="btn-outline" 
            style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}
            title={t('notes.save')}
          >
            <Download size={14} />
            <span>{t('notes.save')}</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".txt,.md,.html" 
            onChange={handleOpen} 
          />
        </div>
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

