import { getMediaUrl } from '@/lib/db';

const FIELD_PATTERN = /\{\{([^{}]+)\}\}/g;
const SOUND_PATTERN = /\[sound:([^\]]+)\]/g;
const IMG_SRC_PATTERN = /<img([^>]+)src=["']([^"']+)["']/gi;

export function renderTemplate(template: string, fields: Record<string, string>, frontSide?: string): string {
  return template.replace(FIELD_PATTERN, (_match, fieldName: string) => {
    const trimmed = fieldName.trim();

    if (trimmed === 'FrontSide') {
      return frontSide ?? '';
    }

    return fields[trimmed] ?? '';
  });
}

export async function parseMedia(html: string): Promise<string> {
  let result = html;

  const soundMatches = [...html.matchAll(new RegExp(SOUND_PATTERN.source, 'g'))];
  for (const match of soundMatches) {
    const filename = match[1].trim();
    const blobUrl = await getMediaUrl(filename);
    const src = blobUrl || filename;
    result = result.replace(match[0], `<audio controls autoplay src="${escapeAttr(src)}"></audio>`);
  }

  const imgMatches = [...html.matchAll(new RegExp(IMG_SRC_PATTERN.source, 'gi'))];
  for (const match of imgMatches) {
    const filename = match[2].trim();
    if (!filename.startsWith('http://') && !filename.startsWith('https://') && !filename.startsWith('blob:')) {
      const blobUrl = await getMediaUrl(filename);
      if (blobUrl) {
        result = result.replace(match[0], `<img${match[1]}src="${escapeAttr(blobUrl)}"`);
      }
    }
  }

  return result;
}

export async function renderCardSide(
  template: string,
  fields: Record<string, string>,
  options: {
    frontSide?: string;
    css?: string;
  } = {},
): Promise<string> {
  let html = renderTemplate(template, fields, options.frontSide);

  html = await parseMedia(html);

  if (options.css) {
    const scopedCss = options.css.replace(/\.card\s*\{/g, '.anki-card {').replace(/\.card\./g, '.anki-card.');

    html = `<style>
${scopedCss}
/* Theme-adaptive overrides — inherit app colors */
.anki-card {
  color: var(--foreground) !important;
  background-color: transparent !important;
}
.anki-card img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
.anki-card audio {
  width: 100%;
  max-width: 300px;
  margin: 0.5rem 0;
}
</style><div class="anki-card">${html}</div>`;
  } else {
    html = `<div class="anki-card">${html}</div>`;
  }

  return html;
}

export function extractMediaReferences(fields: Record<string, string>): string[] {
  const refs: string[] = [];

  for (const value of Object.values(fields)) {
    let match: RegExpExecArray | null;
    const soundRegex = /\[sound:([^\]]+)\]/g;
    while ((match = soundRegex.exec(value)) !== null) {
      refs.push(match[1].trim());
    }

    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    while ((match = imgRegex.exec(value)) !== null) {
      refs.push(match[1].trim());
    }
  }

  return refs;
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
