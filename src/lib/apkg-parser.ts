import JSZip from 'jszip';
import initSqlJs from 'sql.js';

const SQL_CONFIG = {
  locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`,
};

export interface AnkiField {
  name: string;
  ord: number;
}

export interface AnkiTemplate {
  name: string;
  ord: number;
  qfmt: string;
  afmt: string;
}

export interface AnkiModel {
  id: string;
  name: string;
  fields: AnkiField[];
  templates: AnkiTemplate[];
  css: string;
}

export interface ParsedNote {
  modelId: string;
  fields: Record<string, string>;
}

export interface ParsedDeck {
  name: string;
  notes: ParsedNote[];
  mediaRefs: string[];
}

export interface ParsedApkg {
  decks: ParsedDeck[];
  models: AnkiModel[];

  getMediaBlob: (filename: string) => Promise<Blob | null>;
  availableMedia: string[];
}

export interface ParsedCard {
  front: string;
  back: string;
}

export async function extractDbFromApkg(file: File): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(file);

  const anki21 = zip.file('collection.anki21');
  if (anki21) {
    return new Uint8Array(await anki21.async('arraybuffer'));
  }

  const anki2 = zip.file('collection.anki2');
  if (anki2) {
    return new Uint8Array(await anki2.async('arraybuffer'));
  }

  throw new Error('Invalid .apkg file: could not find collection.anki2 or collection.anki21 inside the archive.');
}

interface RawModel {
  name: string;
  flds: { name: string; ord: number }[];
  tmpls?: { name: string; ord: number; qfmt: string; afmt: string }[];
  css?: string;
}

export function parseModels(modelsJson: string): Map<string, AnkiModel> {
  const modelsMap = new Map<string, AnkiModel>();
  const raw = JSON.parse(modelsJson) as Record<string, RawModel>;

  for (const [id, model] of Object.entries(raw)) {
    modelsMap.set(id, {
      id,
      name: model.name,
      fields: model.flds.map(f => ({ name: f.name, ord: f.ord })).sort((a, b) => a.ord - b.ord),
      templates: (model.tmpls ?? [])
        .map(t => ({
          name: t.name,
          ord: t.ord,
          qfmt: t.qfmt,
          afmt: t.afmt,
        }))
        .sort((a, b) => a.ord - b.ord),
      css: model.css ?? '',
    });
  }

  return modelsMap;
}

export function parseDeckNames(decksJson: string): Map<string, string> {
  const decksMap = new Map<string, string>();
  const raw = JSON.parse(decksJson) as Record<string, { name: string }>;

  for (const [id, deck] of Object.entries(raw)) {
    decksMap.set(id, deck.name);
  }

  return decksMap;
}

const FIELD_SEPARATOR = '\x1f';

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

const SOUND_PATTERN = /\[sound:([^\]]+)\]/g;
const IMG_SRC_PATTERN = /<img[^>]+src=["']([^"']+)["']/gi;

function extractMediaFromText(text: string): string[] {
  const refs: string[] = [];
  let match: RegExpExecArray | null;

  const soundRegex = new RegExp(SOUND_PATTERN.source, 'g');
  while ((match = soundRegex.exec(text)) !== null) {
    refs.push(match[1].trim());
  }

  const imgRegex = new RegExp(IMG_SRC_PATTERN.source, 'gi');
  while ((match = imgRegex.exec(text)) !== null) {
    refs.push(match[1].trim());
  }

  return refs;
}

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    webm: 'audio/webm',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    mp4: 'video/mp4',
  };
  return mimeTypes[ext] ?? 'application/octet-stream';
}

interface NoteRow {
  mid: string;
  flds: string;
}

interface CardRow {
  nid: number;
  did: string;
}

export async function parseApkgFile(file: File): Promise<ParsedApkg> {
  const zip = await JSZip.loadAsync(file);

  const anki21 = zip.file('collection.anki21');
  const anki2 = zip.file('collection.anki2');
  const dbFile = anki21 ?? anki2;
  if (!dbFile) {
    throw new Error('Invalid .apkg file: could not find collection database inside the archive.');
  }
  const dbBytes = new Uint8Array(await dbFile.async('arraybuffer'));

  let SQL;
  try {
    SQL = await initSqlJs(SQL_CONFIG);
  } catch (e) {
    throw new Error(
      `Failed to load SQL engine (WASM). Check your internet connection or try refreshing. Details: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
  const sqlDb = new SQL.Database(dbBytes);

  const mediaMap = new Map<string, string>();
  const reverseMediaMap = new Map<string, string>();
  const mediaFile = zip.file('media');
  if (mediaFile) {
    try {
      const mediaJson = await mediaFile.async('text');
      const mediaObj = JSON.parse(mediaJson) as Record<string, string>;
      for (const [key, filename] of Object.entries(mediaObj)) {
        mediaMap.set(key, filename);
        reverseMediaMap.set(filename, key);
      }
    } catch {}
  }

  try {
    const colResult = sqlDb.exec('SELECT models, decks FROM col LIMIT 1');
    if (colResult.length === 0 || colResult[0].values.length === 0) {
      throw new Error('Invalid .apkg: col table is empty.');
    }

    const modelsJson = colResult[0].values[0][0] as string;
    const decksJson = colResult[0].values[0][1] as string;

    const models = parseModels(modelsJson);
    const deckNames = parseDeckNames(decksJson);

    const notesResult = sqlDb.exec('SELECT id, mid, flds FROM notes');
    const notesMap = new Map<number, NoteRow>();

    if (notesResult.length > 0) {
      for (const row of notesResult[0].values) {
        const noteId = row[0] as number;
        const mid = String(row[1]);
        const flds = row[2] as string;
        notesMap.set(noteId, { mid, flds });
      }
    }

    const cardsResult = sqlDb.exec('SELECT nid, did FROM cards');
    const deckNotesMap = new Map<string, ParsedNote[]>();
    const deckMediaMap = new Map<string, Set<string>>();

    if (cardsResult.length > 0) {
      for (const row of cardsResult[0].values) {
        const cardRow: CardRow = {
          nid: row[0] as number,
          did: String(row[1]),
        };

        const note = notesMap.get(cardRow.nid);
        if (!note) continue;

        const model = models.get(note.mid);
        if (!model) continue;

        const fieldValues = note.flds.split(FIELD_SEPARATOR);
        const fields: Record<string, string> = {};
        for (let i = 0; i < model.fields.length; i++) {
          fields[model.fields[i].name] = fieldValues[i] ?? '';
        }

        const hasContent = Object.values(fields).some(v => v.trim().length > 0);
        if (!hasContent) continue;

        const parsedNote: ParsedNote = {
          modelId: note.mid,
          fields,
        };

        const deckId = cardRow.did;
        const existing = deckNotesMap.get(deckId);
        if (existing) {
          existing.push(parsedNote);
        } else {
          deckNotesMap.set(deckId, [parsedNote]);
        }

        const mediaSet = deckMediaMap.get(deckId) ?? new Set<string>();
        for (const value of Object.values(fields)) {
          for (const ref of extractMediaFromText(value)) {
            mediaSet.add(ref);
          }
        }
        deckMediaMap.set(deckId, mediaSet);
      }
    }

    const decks: ParsedDeck[] = [];
    for (const [deckId, notes] of deckNotesMap) {
      decks.push({
        name: deckNames.get(deckId) ?? `Deck ${deckId}`,
        notes,
        mediaRefs: Array.from(deckMediaMap.get(deckId) ?? []),
      });
    }

    return {
      decks,
      models: Array.from(models.values()),
      availableMedia: Array.from(mediaMap.values()),
      getMediaBlob: async (filename: string): Promise<Blob | null> => {
        const numericKey = reverseMediaMap.get(filename);
        if (!numericKey) return null;

        const entry = zip.file(numericKey);
        if (!entry) return null;

        const arrayBuffer = await entry.async('arraybuffer');
        const mimeType = guessMimeType(filename);
        return new Blob([arrayBuffer], { type: mimeType });
      },
    };
  } finally {
    sqlDb.close();
  }
}

export async function getApkgModels(file: File): Promise<AnkiModel[]> {
  const dbBytes = await extractDbFromApkg(file);

  let SQL;
  try {
    SQL = await initSqlJs(SQL_CONFIG);
  } catch (e) {
    throw new Error(
      `Failed to load SQL engine (WASM). Check your internet connection or try refreshing. Details: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
  const sqlDb = new SQL.Database(dbBytes);

  try {
    const colResult = sqlDb.exec('SELECT models FROM col LIMIT 1');
    if (colResult.length === 0 || colResult[0].values.length === 0) {
      throw new Error('Invalid .apkg: col table is empty.');
    }

    const modelsJson = colResult[0].values[0][0] as string;
    const models = parseModels(modelsJson);
    return Array.from(models.values());
  } finally {
    sqlDb.close();
  }
}

/**
 * Legacy helper: Parse an .apkg and flatten to simple front/back cards.
 * Used for backward compatibility with older code paths.
 */
export async function parseApkgFlat(
  file: File,
  frontFieldIndex = 0,
  backFieldIndex = 1,
): Promise<{ name: string; cards: ParsedCard[] }[]> {
  const result = await parseApkgFile(file);

  return result.decks.map(deck => ({
    name: deck.name,
    cards: deck.notes.map(note => {
      const fieldNames = Object.keys(note.fields);
      const fIdx = Math.min(frontFieldIndex, fieldNames.length - 1);
      const bIdx = Math.min(backFieldIndex, fieldNames.length - 1);
      return {
        front: stripHtml(note.fields[fieldNames[fIdx]] ?? ''),
        back: stripHtml(note.fields[fieldNames[bIdx]] ?? ''),
      };
    }),
  }));
}
