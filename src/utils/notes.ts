export function stripHtmlForReadingTime(content: string) {
  return content.replace(/<[^>]+>/g, ' ');
}

export function escapeHtmlText(content: string) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function plainTextToEditorHtml(content: string) {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return '<p></p>';
  }

  return paragraphs
    .map((paragraph) => `<p>${escapeHtmlText(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function isHtmlNotesFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return file.type === 'text/html' || lowerName.endsWith('.html') || lowerName.endsWith('.htm');
}
