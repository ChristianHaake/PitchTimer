import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { useTranslation } from './i18n';

interface MarkdownPageProps {
  contentRawPromise: Promise<typeof import('*.md?raw')>;
}

export function MarkdownPage({ contentRawPromise }: MarkdownPageProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    contentRawPromise.then((mod) => {
      setContent(mod.default);
    });
  }, [contentRawPromise]);

  return (
    <div className="surface-panel" style={{ textAlign: 'left' }}>
      <Link to="/" className="content-back-link">{t('content.back')}</Link>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
