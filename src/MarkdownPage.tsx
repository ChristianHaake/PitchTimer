import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useTranslation } from './i18n';

interface MarkdownPageProps {
  loadContentRaw: () => Promise<typeof import('*.md?raw')>;
}

export function MarkdownPage({ loadContentRaw }: MarkdownPageProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    loadContentRaw().then((mod) => {
      if (!cancelled) {
        setContent(mod.default);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadContentRaw]);

  return (
    <div className="surface-panel" style={{ textAlign: 'left' }}>
      <Link to="/" className="content-back-link">{t('content.back')}</Link>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
