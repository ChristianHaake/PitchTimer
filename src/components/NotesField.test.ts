import { describe, expect, it } from 'vitest';
import { escapeHtmlText, plainTextToEditorHtml, stripHtmlForReadingTime } from '../utils/notes';

describe('stripHtmlForReadingTime', () => {
  it('removes markup without collapsing words together', () => {
    expect(stripHtmlForReadingTime('<h1>Hello</h1><p>pitch notes</p>')).toBe(' Hello  pitch notes ');
  });
});

describe('plainTextToEditorHtml', () => {
  it('escapes literal text imports before they enter the editor', () => {
    expect(plainTextToEditorHtml('<script>alert(1)</script>\nplain')).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt;<br>plain</p>',
    );
  });

  it('preserves paragraphs for plain text notes', () => {
    expect(plainTextToEditorHtml('first\n\nsecond')).toBe('<p>first</p><p>second</p>');
  });
});

describe('escapeHtmlText', () => {
  it('escapes HTML-sensitive characters', () => {
    expect(escapeHtmlText(`"<tag>" & 'quote'`)).toBe('&quot;&lt;tag&gt;&quot; &amp; &#39;quote&#39;');
  });
});
