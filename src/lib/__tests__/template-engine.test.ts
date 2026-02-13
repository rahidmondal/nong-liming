import { extractMediaReferences, parseMedia, renderCardSide, renderTemplate } from '@/lib/template-engine';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  getMediaUrl: vi.fn((filename: string) => Promise.resolve(`blob:mock/${filename}`)),
}));

describe('renderTemplate', () => {
  it('substitutes a single field', () => {
    const result = renderTemplate('{{Front}}', { Front: 'Hello' });
    expect(result).toBe('Hello');
  });

  it('substitutes multiple fields', () => {
    const result = renderTemplate('Q: {{Front}} A: {{Back}}', {
      Front: 'สวัสดี',
      Back: 'Hello',
    });
    expect(result).toBe('Q: สวัสดี A: Hello');
  });

  it('replaces {{FrontSide}} with provided frontSide', () => {
    const result = renderTemplate('{{FrontSide}}<hr>{{Back}}', { Back: 'Answer' }, '<b>Question</b>');
    expect(result).toBe('<b>Question</b><hr>Answer');
  });

  it('returns empty string for {{FrontSide}} when no frontSide provided', () => {
    const result = renderTemplate('{{FrontSide}}<hr>{{Back}}', { Back: 'Answer' });
    expect(result).toBe('<hr>Answer');
  });

  it('returns empty string for missing fields', () => {
    const result = renderTemplate('{{Missing}}', {});
    expect(result).toBe('');
  });

  it('handles fields with spaces in names', () => {
    const result = renderTemplate('{{ Front }}', { Front: 'trimmed' });
    expect(result).toBe('trimmed');
  });

  it('preserves HTML in field values', () => {
    const result = renderTemplate('{{Front}}', { Front: '<b>bold</b>' });
    expect(result).toBe('<b>bold</b>');
  });

  it('handles template with no placeholders', () => {
    const result = renderTemplate('static text', { Front: 'unused' });
    expect(result).toBe('static text');
  });
});

describe('parseMedia', () => {
  it('converts [sound:file.mp3] to audio element with blob url', async () => {
    const result = await parseMedia('[sound:hello.mp3]');
    expect(result).toContain('<audio');
    expect(result).toContain('blob:mock/hello.mp3');
    expect(result).toContain('controls');
    expect(result).toContain('autoplay');
  });

  it('converts multiple sound tags', async () => {
    const result = await parseMedia('[sound:a.mp3] text [sound:b.ogg]');
    expect(result).toContain('blob:mock/a.mp3');
    expect(result).toContain('blob:mock/b.ogg');
    expect(result.match(/<audio/g)).toHaveLength(2);
  });

  it('leaves text without sound tags unchanged', async () => {
    const input = 'plain text without media';
    expect(await parseMedia(input)).toBe(input);
  });

  it('resolves img tags with blob urls', async () => {
    const input = '<img src="photo.jpg">';
    const result = await parseMedia(input);
    expect(result).toContain('blob:mock/photo.jpg');
  });

  it('ignores img tags with http urls', async () => {
    const input = '<img src="http://example.com/photo.jpg">';
    const result = await parseMedia(input);
    expect(result).toBe(input);
  });

  it('escapes special characters in filenames', async () => {
    const result = await parseMedia('[sound:file "name".mp3]');
    expect(result).toContain('&quot;');
  });
});

describe('renderCardSide', () => {
  it('renders a complete card side', async () => {
    const result = await renderCardSide('{{Front}}', { Front: 'Hello' });
    expect(result).toContain('<div class="anki-card">');
    expect(result).toContain('Hello');
  });

  it('wraps with scoped CSS when provided', async () => {
    const result = await renderCardSide('{{Front}}', { Front: 'Hello' }, { css: '.card { color: red; }' });
    expect(result).toContain('<style>');
    expect(result).toContain('.anki-card { color: red; }');
    expect(result).toContain('<div class="anki-card">');
    expect(result).toContain('Hello');
  });

  it('renders answer side with frontSide context', async () => {
    const result = await renderCardSide('{{FrontSide}}<hr>{{Back}}', { Back: 'World' }, { frontSide: 'Hello' });
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('processes media tags in rendered output', async () => {
    const result = await renderCardSide('{{Audio}}', { Audio: '[sound:test.mp3]' });
    expect(result).toContain('<audio');
    expect(result).toContain('blob:mock/test.mp3');
  });
});

describe('extractMediaReferences', () => {
  it('extracts sound file references', () => {
    const refs = extractMediaReferences({
      Front: 'Question',
      Audio: '[sound:hello.mp3]',
    });
    expect(refs).toContain('hello.mp3');
  });

  it('extracts img src references', () => {
    const refs = extractMediaReferences({
      Front: '<img src="photo.jpg">',
    });
    expect(refs).toContain('photo.jpg');
  });

  it('extracts multiple references', () => {
    const refs = extractMediaReferences({
      Front: '[sound:a.mp3] <img src="b.png">',
      Back: '[sound:c.ogg]',
    });
    expect(refs).toHaveLength(3);
    expect(refs).toContain('a.mp3');
    expect(refs).toContain('b.png');
    expect(refs).toContain('c.ogg');
  });

  it('returns empty array for fields with no media', () => {
    const refs = extractMediaReferences({ Front: 'plain text', Back: 'more text' });
    expect(refs).toHaveLength(0);
  });
});
