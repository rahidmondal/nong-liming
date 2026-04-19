import { parseDeckNames, parseModels, stripHtml } from '@/lib/apkg-parser';
import { describe, expect, it } from 'vitest';

describe('stripHtml', () => {
  it('strips simple HTML tags', () => {
    expect(stripHtml('<b>bold</b>')).toBe('bold');
  });

  it('converts <br> to newlines', () => {
    expect(stripHtml('line1<br>line2')).toBe('line1\nline2');
    expect(stripHtml('line1<br/>line2')).toBe('line1\nline2');
    expect(stripHtml('line1<br />line2')).toBe('line1\nline2');
  });

  it('decodes HTML entities', () => {
    expect(stripHtml('&amp; &lt; &gt; &quot; &#39;')).toBe('& < > " \'');
  });

  it('decodes &nbsp; to space', () => {
    expect(stripHtml('hello&nbsp;world')).toBe('hello world');
  });

  it('trims whitespace', () => {
    expect(stripHtml('  hello  ')).toBe('hello');
  });

  it('handles nested tags', () => {
    expect(stripHtml('<div><span>nested</span></div>')).toBe('nested');
  });

  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
  });

  it('handles complex Anki HTML', () => {
    const ankiHtml = '<div style="font-family: Arial;">สวัสดี</div><br><i>hello</i>';
    expect(stripHtml(ankiHtml)).toBe('สวัสดี\nhello');
  });

  it('handles unclosed malicious tags', () => {
    expect(stripHtml('hello <script src="x.js"')).toBe('hello');
    expect(stripHtml('hello <img src="x" onerror="alert(1)"')).toBe('hello');
  });

  it('handles nested malicious tags (multi-character sanitization)', () => {
    expect(stripHtml('<<script>script>')).toBe('');
    expect(stripHtml('<s<script>cript>')).toBe('cript>');
    expect(stripHtml('<<img src=x onerror=alert(1)>>')).toBe('<>');
  });
});

describe('parseModels', () => {
  it('parses a single model with fields', () => {
    const modelsJson = JSON.stringify({
      '1234567890': {
        name: 'Basic',
        flds: [
          { name: 'Front', ord: 0 },
          { name: 'Back', ord: 1 },
        ],
      },
    });

    const result = parseModels(modelsJson);
    expect(result.size).toBe(1);

    const model = result.get('1234567890');
    expect(model).toBeDefined();
    expect(model?.name).toBe('Basic');
    expect(model?.fields).toHaveLength(2);
    expect(model?.fields[0].name).toBe('Front');
    expect(model?.fields[1].name).toBe('Back');
  });

  it('parses multiple models', () => {
    const modelsJson = JSON.stringify({
      '111': {
        name: 'Basic',
        flds: [
          { name: 'Front', ord: 0 },
          { name: 'Back', ord: 1 },
        ],
      },
      '222': {
        name: 'Cloze',
        flds: [
          { name: 'Text', ord: 0 },
          { name: 'Extra', ord: 1 },
        ],
      },
    });

    const result = parseModels(modelsJson);
    expect(result.size).toBe(2);
    expect(result.get('111')?.name).toBe('Basic');
    expect(result.get('222')?.name).toBe('Cloze');
  });

  it('sorts fields by ordinal', () => {
    const modelsJson = JSON.stringify({
      '1': {
        name: 'Reversed',
        flds: [
          { name: 'Second', ord: 1 },
          { name: 'First', ord: 0 },
          { name: 'Third', ord: 2 },
        ],
      },
    });

    const result = parseModels(modelsJson);
    const model = result.get('1');
    expect(model?.fields[0].name).toBe('First');
    expect(model?.fields[1].name).toBe('Second');
    expect(model?.fields[2].name).toBe('Third');
  });

  it('handles empty models JSON', () => {
    const result = parseModels('{}');
    expect(result.size).toBe(0);
  });
});

describe('parseDeckNames', () => {
  it('parses deck names', () => {
    const decksJson = JSON.stringify({
      '1': { name: 'Default' },
      '123456': { name: 'Thai::Vocabulary' },
    });

    const result = parseDeckNames(decksJson);
    expect(result.size).toBe(2);
    expect(result.get('1')).toBe('Default');
    expect(result.get('123456')).toBe('Thai::Vocabulary');
  });

  it('handles empty decks JSON', () => {
    const result = parseDeckNames('{}');
    expect(result.size).toBe(0);
  });
});
