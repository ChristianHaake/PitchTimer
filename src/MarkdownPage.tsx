import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPageProps {
  contentRawPromise: Promise<typeof import('*.md?raw')>;
}

export function MarkdownPage({ contentRawPromise }: MarkdownPageProps) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    contentRawPromise.then((mod) => {
      setContent(mod.default);
    });
  }, [contentRawPromise]);

  return (
    <div className="surface-panel" style={{ textAlign: 'left' }}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
