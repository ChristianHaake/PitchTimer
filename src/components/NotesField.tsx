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

export function NotesField() {
  const { t } = useTranslation();
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, editor.getHTML());
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

  const handleSave = () => {
    setError(null);
    if (!editor) return;
    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pitch-notes.html';
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
        try {
          localStorage.setItem(NOTES_STORAGE_KEY, content);
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
      
      <div className="tiptap-container">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-2)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

