import { getMediaUrl } from '@/lib/db';

const FIELD_PATTERN = /\{\{([^{}]+)\}\}/g;
const SOUND_PATTERN = /\[sound:([^\]]+)\]/g;
const IMG_SRC_PATTERN = /<img([^>]+)src=(?:["']([^"']+)["']|([^\s>]+))/gi;

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
    if (blobUrl) {
      result = result.replace(match[0], `<audio controls src="${escapeAttr(blobUrl)}" class="card-audio"></audio>`);
    } else {
      // No blob found — show a muted indicator instead of broken audio
      result = result.replace(
        match[0],
        `<span class="card-media-missing" title="Audio: ${escapeAttr(filename)}">🔇 ${escapeAttr(filename)}</span>`,
      );
    }
  }

  const imgMatches = [...html.matchAll(new RegExp(IMG_SRC_PATTERN.source, 'gi'))];
  for (const match of imgMatches) {
    const filename = (match[2] || match[3] || '').trim();
    if (!filename) continue;

    if (
      filename.startsWith('http://') ||
      filename.startsWith('https://') ||
      filename.startsWith('blob:') ||
      filename.startsWith('data:')
    ) {
      continue;
    }

    const blobUrl = await getMediaUrl(filename);
    if (blobUrl) {
      result = result.replace(match[0], `<img${match[1]}src="${escapeAttr(blobUrl)}"`);
    } else {
      result = result.replace(
        match[0],
        `<span class="card-media-missing" title="Image: ${escapeAttr(filename)}">🖼️ ${escapeAttr(filename)}</span`,
      );
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
  display: block;
  margin: 0.5rem auto;
}
.anki-card audio,
.anki-card .card-audio {
  display: block;
  width: 100%;
  max-width: 280px;
  margin: 0.75rem auto;
  border-radius: 0.5rem;
}
.card-media-missing {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-radius: 0.375rem;
  font-size: 0.75rem;
  margin: 0.25rem 0;
}
</style><div class="anki-card">${html}</div>`;
  } else {
    html = `<style>
.anki-card img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  display: block;
  margin: 0.5rem auto;
}
.anki-card audio,
.anki-card .card-audio {
  display: block;
  width: 100%;
  max-width: 280px;
  margin: 0.75rem auto;
  border-radius: 0.5rem;
}
.card-media-missing {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  border-radius: 0.375rem;
  font-size: 0.75rem;
  margin: 0.25rem 0;
}
</style><div class="anki-card">${html}</div>`;
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

    const imgRegex = /<img[^>]+src=(?:["']([^"']+)["']|([^\s>]+))/gi;
    while ((match = imgRegex.exec(value)) !== null) {
      const filename = (match[1] || match[2] || '').trim();
      if (filename) refs.push(filename);
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
