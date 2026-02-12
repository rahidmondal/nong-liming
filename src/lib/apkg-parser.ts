import JSZip from 'jszip';
import initSqlJs from 'sql.js';

const SQL_CONFIG = {
  locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`,
};

export interface ParsedCard {
  front: string;
  back: string;
}

export interface ParsedDeck {
  name: string;
  cards: ParsedCard[];
}

export interface AnkiField {
  name: string;
  ord: number;
}

export interface AnkiModel {
  id: string;
  name: string;
  fields: AnkiField[];
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

export function parseModels(modelsJson: string): Map<string, AnkiModel> {
  const modelsMap = new Map<string, AnkiModel>();
  const raw = JSON.parse(modelsJson) as Record<string, { name: string; flds: { name: string; ord: number }[] }>;

  for (const [id, model] of Object.entries(raw)) {
    modelsMap.set(id, {
      id,
      name: model.name,
      fields: model.flds.map(f => ({ name: f.name, ord: f.ord })).sort((a, b) => a.ord - b.ord),
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

interface NoteRow {
  mid: string;
  flds: string;
}

interface CardRow {
  nid: number;
  did: string;
}

export async function parseApkgFile(file: File, frontFieldIndex = 0, backFieldIndex = 1): Promise<ParsedDeck[]> {
  const dbBytes = await extractDbFromApkg(file);
  const SQL = await initSqlJs(SQL_CONFIG);
  const sqlDb = new SQL.Database(dbBytes);

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
    const deckCardsMap = new Map<string, ParsedCard[]>();

    if (cardsResult.length > 0) {
      for (const row of cardsResult[0].values) {
        const cardRow: CardRow = {
          nid: row[0] as number,
          did: String(row[1]),
        };

        const note = notesMap.get(cardRow.nid);
        if (!note) continue;

        const model = models.get(note.mid);
        const fields = note.flds.split(FIELD_SEPARATOR);

        const fIdx = model ? Math.min(frontFieldIndex, model.fields.length - 1) : frontFieldIndex;
        const bIdx = model ? Math.min(backFieldIndex, model.fields.length - 1) : backFieldIndex;

        const front = stripHtml(fields[fIdx] ?? '');
        const back = stripHtml(fields[bIdx] ?? '');

        if (!front && !back) continue;

        const deckId = cardRow.did;
        const existing = deckCardsMap.get(deckId);
        if (existing) {
          existing.push({ front, back });
        } else {
          deckCardsMap.set(deckId, [{ front, back }]);
        }
      }
    }

    const decks: ParsedDeck[] = [];
    for (const [deckId, cards] of deckCardsMap) {
      decks.push({
        name: deckNames.get(deckId) ?? `Deck ${deckId}`,
        cards,
      });
    }

    return decks;
  } finally {
    sqlDb.close();
  }
}

export async function getApkgModels(file: File): Promise<AnkiModel[]> {
  const dbBytes = await extractDbFromApkg(file);
  const SQL = await initSqlJs(SQL_CONFIG);
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
