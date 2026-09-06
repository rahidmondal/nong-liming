import { consonants } from '@/data/consonants';
import { vowels } from '@/data/vowels';
import { numbers } from '@/data/numbers';
import { lessons } from '@/data/lessons';
import type { Exercise, Mission } from './missionTypes';

type Note = Mission['notes'][number];
const note = (thai: string, meaning: string, detail?: string): Note => ({ thai, meaning, detail });
function required<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Missing course content: ${label}`);
  return value;
}
const consonant = (char: string) =>
  required(
    consonants.find(item => item.thaiChar === char),
    char,
  );
const outcomes: Record<string, string> = {
  'first-words': 'Recognize ก, ม, น and combine them with า to read three words.',
  greetings: 'Choose a greeting, answer a name question, and build an introduction.',
  'vowel-a-i-u': 'Distinguish short and long a, i, and u and read มี and ดู.',
  'mid-common': 'Identify common middle-class letters by name, initial sound, and class.',
  'tone-clues': 'Explain why an unmarked word is not always mid tone.',
  coffee: 'Understand the sweetness question and build a less-sweet drink request.',
  'low-sonorants': 'Recognize low-class sonorants and explain why final ร sounds like n.',
  'vowel-front': 'Recognize e and ae spellings and separate a vowel from a tone mark.',
  'high-common': 'Identify common high-class letters and recognize a shared ph sound.',
  digits: 'Read Thai digits and build a quantity with the cup classifier.',
  'low-paired': 'Identify common low-class partners and recognize final ฟ as p.',
  'vowel-back': 'Distinguish central and rounded vowel patterns and read มือ and โต.',
  'mid-rare': 'Distinguish ฎ and ฏ and identify their shared final t sound.',
  'tone-live': 'Classify live and dead syllables and apply two unmarked mid-class tone rules.',
  taxi: 'Give a destination and choose whether to accept or decline the tollway.',
  'vowel-diphthongs': 'Recognize ia, uea, and ua spellings and read the word for boat.',
  'high-rare': 'Recognize the remaining high-class letters, including obsolete ฃ.',
  'low-rare-a': 'Recognize less common low-class letters and the final n sound of ญ.',
  prices: 'Read common prices and assemble 250 baht from number chunks.',
  'tone-marks': 'Apply mai ek and mai tho rules and use vowel length in low-class dead syllables.',
  'low-rare-b': 'Complete the consonant inventory and recognize final ฬ as n.',
  'vowel-special': 'Distinguish am and ao and choose familiar words using the two ai spellings.',
  market: 'Read a quoted price and choose a discount request or polite refusal.',
  'vowel-loan': 'Recognize the four historical vowel symbols and the word ฤดู.',
  finals: 'Read final consonant sounds and recognize changed or unwritten vowels.',
  clusters: 'Identify true clusters and explain the leading ห in หมา.',
  recovery: 'Choose requests for repetition or slower speech and build “I do not understand”.',
  emergency: 'Recognize symptom and help vocabulary and distinguish hospital from ambulance.',
  reading: 'Use a short menu and message to identify a price, preference, and destination.',
  checkpoint: 'Combine word reading, written tone rules, prices, and practical responses.',
};
function choice(
  id: string,
  prompt: string,
  correct: string,
  others: string[],
  explanation: string,
  skill = 'reading',
  cue?: string,
): Exercise {
  const labels = [correct, ...others];
  const options = labels.map((label, i) => ({ id: `${id}-${String(i)}`, label }));
  const offset = Array.from(id).reduce((total, char) => total + char.charCodeAt(0), 0) % options.length;
  return {
    id,
    kind: 'choice',
    prompt,
    cue,
    options: [...options.slice(offset), ...options.slice(0, offset)],
    answer: [`${id}-0`],
    hint: explanation,
    explanation,
    skill,
  };
}
function order(id: string, prompt: string, chunks: string[], explanation: string, skill = 'phrase-building'): Exercise {
  return {
    id,
    kind: 'order',
    prompt,
    options: chunks.map((label, i) => ({ id: `${id}-${String(i)}`, label })).reverse(),
    answer: chunks.map((_, i) => `${id}-${String(i)}`),
    hint: explanation,
    explanation,
    skill,
  };
}
function mission(
  id: string,
  title: string,
  introduction: string,
  notes: Note[],
  exercises: Exercise[],
  track: Mission['track'] = 'script',
  referencePath = '/reference',
): Mission {
  return {
    id,
    title,
    subtitle: track === 'script' ? 'Read Thai' : track === 'tones' ? 'Sounds & tones' : 'Everyday Thai',
    introduction,
    notes,
    exercises,
    track,
    referencePath,
    emoji: track === 'script' ? '🔤' : track === 'tones' ? '🎵' : '💬',
    minutes: 10,
    outcome: required(outcomes[id], id),
  };
}
function letterNotes(chars: string): Note[] {
  return Array.from(chars).map(char => {
    const letter = consonant(char);
    const rare = 'ฃฅ'.includes(char)
      ? 'Obsolete in everyday spelling; recognize it in the full alphabet. '
      : 'ฎฏฐฑฒณฆฌญธภศษฬ'.includes(char)
        ? 'Often found in names or words of Indic origin. '
        : '';
    return note(
      char,
      `${letter.thaiName} · ${letter.id.replaceAll('-', ' ')} · ${letter.class} class`,
      `${rare}Initial sound: ${letter.startSound}. ${letter.finalSound === '-' ? 'No regular final-consonant role in this reference.' : `Final sound: ${letter.finalSound}.${['k', 'p', 't'].includes(letter.finalSound) ? ' This final stop is unreleased.' : ''}`}`,
    );
  });
}
function initial(id: string, char: string): Exercise {
  const correct = consonant(char);
  const alternatives = ['ก', 'ม', 'น', 'ส', 'บ']
    .map(consonant)
    .filter(item => item.startSound !== correct.startSound)
    .slice(0, 2);
  return choice(
    id,
    `Which letter has the initial sound “${correct.startSound}”?`,
    char,
    alternatives.map(item => item.thaiChar),
    `${correct.thaiName} begins with ${correct.startSound}. This asks about the initial sound, not the letter name or final sound.`,
    'initial-sound',
  );
}
function letters(id: string, title: string, chars: string, introduction: string, application: Exercise): Mission {
  const group = Array.from(chars).map(consonant);
  const target = group[group.length - 1];
  return mission(
    id,
    title,
    introduction,
    [
      ...letterNotes(chars),
      note(
        'ต้น / ท้าย',
        'initial / final position',
        'Read a letter according to its role in the syllable. Consonant class is a spelling category used for tone rules, not the pitch by itself.',
      ),
    ],
    [
      initial('sound-first', group[0].thaiChar),
      initial('sound-last', target.thaiChar),
      choice(
        'letter-name',
        `Which letter has the name “${group[1].id.replaceAll('-', ' ')}”?`,
        group[1].thaiChar,
        [group[0].thaiChar, group[2]?.thaiChar ?? 'ม'],
        'The object in a Thai letter name helps distinguish letters that share a sound.',
        'letter-name',
      ),
      choice(
        'class',
        `Which consonant class does ${target.thaiChar} belong to?`,
        target.class,
        ['mid', 'high', 'low'].filter(c => c !== target.class),
        `${target.thaiChar} is ${target.class} class. Consonant class helps determine tone; it is not a pitch by itself.`,
        'consonant-class',
      ),
      application,
    ],
  );
}
function vowelLesson(
  id: string,
  title: string,
  chars: string[],
  introduction: string,
  extraNotes: Note[],
  tasks: Exercise[],
): Mission {
  return mission(
    id,
    title,
    introduction,
    [
      ...chars.map(char => {
        const vowel = required(
          vowels.find(item => item.thaiChar === char),
          char,
        );
        const rare = ['เอียะ', 'เอือะ', 'อัวะ', 'ฤ', 'ฤๅ', 'ฦ', 'ฦๅ'].includes(char);
        return note(
          char,
          vowel.english,
          `${rare ? 'Rare form: recognition is the priority. ' : ''}${['ฤ', 'ฤๅ', 'ฦ', 'ฦๅ'].includes(char) ? 'Traditional special vowel symbol; pronunciation depends on the word. ฦ and ฦๅ are obsolete in ordinary modern use.' : 'อ is a carrier in this reference form. Replace the carrier with the initial; do not pronounce it as a separate syllable.'}`,
        );
      }),
      ...extraNotes,
    ],
    tasks,
  );
}

const firstWords = mission(
  'first-words',
  'Read your first Thai words',
  'Start with three consonants and one long vowel. Thai vowel signs can sit around the consonant, and the carrier อ in a reference vowel is a placeholder. Read these real words as whole syllables; tone will get its own lessons.',
  [
    ...letterNotes('กมน'),
    note('อา', 'aa · long vowel', 'In มา, the า follows ม. The อ is only the reference carrier.'),
    note('มา', 'come · maa'),
    note('นา', 'rice field · naa'),
    note('กา', 'crow · kaa'),
  ],
  [
    {
      ...choice(
        'first-sound',
        'Which letter makes the initial sound “m”?',
        'ม',
        ['ก', 'น'],
        'ม makes m, ก makes k, and น makes n.',
        'initial-sound',
      ),
      options: [
        { id: 'm', label: 'ม' },
        { id: 'k', label: 'ก' },
        { id: 'n', label: 'น' },
      ],
      answer: ['m'],
    },
    choice('read-come', 'Which word means “come”?', 'มา', ['นา', 'กา'], 'มา combines ม with long า; it means come.'),
    order('build-field', 'Build the word for “rice field”.', ['น', 'า'], 'น + า is นา, rice field.', 'word-building'),
    choice('read-crow', 'What does กา mean?', 'crow', ['come', 'rice field'], 'กา is crow; ก begins with k.'),
    choice(
      'long-vowel',
      'Which part of มา supplies the long aa vowel?',
      'า',
      ['ม', '่'],
      'า is the long aa vowel sign. ม is the initial consonant.',
    ),
  ],
);

const coffee = mission(
  'coffee',
  'Order a drink your way',
  'Learn this exchange as useful spoken chunks before decoding every letter. The server asks what you want, then how sweet you want it. ครับ is one polite ending; ค่ะ is another for statements, while คะ is used for questions.',
  [
    note('รับอะไรดีคะ?', 'What would you like?'),
    note('เอาลาเต้เย็นหนึ่งแก้วครับ', 'One iced latte, please.'),
    note('หวานปกติไหมคะ?', 'Normal sweetness?'),
    note('ขอหวานน้อยครับ', 'Less sweet, please.', 'ขอ introduces a request; หวานน้อย means less sweet.'),
    note('ขอบคุณครับ', 'Thank you.'),
    note('รอสักครู่นะคะ', 'Please wait a moment.'),
  ],
  [
    choice(
      'server-question',
      'What does the server want to know?',
      'Your drink order',
      ['Your name', 'Your destination'],
      'รับอะไรดีคะ asks what you would like.',
      'conversation-understanding',
      'รับอะไรดีคะ?',
    ),
    choice(
      'sweetness',
      'The server asks หวานปกติไหมคะ? What is being checked?',
      'Sweetness',
      ['Price', 'Cup size'],
      'หวาน means sweet; ปกติ means normal.',
      'conversation-understanding',
    ),
    {
      ...order(
        'less-sweet',
        'Build “Less sweet, please” using ครับ.',
        ['ขอ', 'หวานน้อย', 'ครับ'],
        'Put the request ขอ first, then the preference หวานน้อย, then polite ครับ.',
      ),
      options: [
        { id: 'polite', label: 'ครับ' },
        { id: 'sweet', label: 'หวานน้อย' },
        { id: 'request', label: 'ขอ' },
      ],
      answer: ['request', 'sweet', 'polite'],
    },
    choice(
      'iced-latte',
      'Choose the order for one iced latte.',
      'เอาลาเต้เย็นหนึ่งแก้วครับ',
      ['ขอบคุณครับ', 'ขอหวานน้อยครับ'],
      'ลาเต้เย็น is iced latte; หนึ่งแก้ว is one cup.',
      'conversation-response',
    ),
    choice(
      'closing',
      'Your order is accepted. Which phrase thanks the server?',
      'ขอบคุณครับ',
      ['หวานปกติครับ', 'ไปไหนครับ'],
      'ขอบคุณ is thank you.',
      'conversation-response',
    ),
  ],
  'conversation',
  '/lessons/lesson-2',
);

const toneClues = mission(
  'tone-clues',
  'Meet the five tones',
  'Thai uses five lexical tones: mid, low, falling, high, and rising. A tone changes a word, not just the feeling of a sentence. Written tone marks are clues, but consonant class and syllable ending also matter. These exercises check written rules, not your pronunciation.',
  [
    note('มา', 'come · mid tone', 'Low-class ม, long vowel, live ending, no mark.'),
    note('ขา', 'leg · rising tone', 'High-class ข, long vowel, live ending, no mark.'),
    note('ข่า', 'galangal · low tone', 'High-class ข plus mai ek ่ gives low tone.'),
    note('ข้า', 'servant / I (historical) · falling tone', 'High-class ข plus mai tho ้ gives falling tone.'),
  ],
  [
    choice(
      'tone-count',
      'How many lexical tones does standard Thai distinguish?',
      'Five',
      ['Three', 'Four'],
      'The five are mid, low, falling, high, and rising.',
      'tone-rule',
    ),
    choice(
      'unmarked',
      'Does an unmarked syllable always have mid tone?',
      'No; class and syllable type matter',
      ['Yes; no mark means mid', 'No; all unmarked words rise'],
      'มา is mid but ขา is rising, although neither has a written tone mark.',
      'tone-rule',
    ),
    choice(
      'high-ek',
      'High-class ข with mai ek ่ produces which tone in ข่า?',
      'Low',
      ['Falling', 'High'],
      'High- and mid-class initials with mai ek have low tone.',
      'tone-rule',
    ),
    choice(
      'high-tho',
      'High-class ข with mai tho ้ produces which tone in ข้า?',
      'Falling',
      ['High', 'Rising'],
      'High- and mid-class initials with mai tho have falling tone.',
      'tone-rule',
    ),
    choice(
      'compare',
      'Which word in this set has rising tone?',
      'ขา',
      ['มา', 'ข่า'],
      'High-class ข plus an unmarked live syllable gives rising tone.',
      'tone-rule',
    ),
  ],
  'tones',
  '/tone-trainer',
);

const greetings = mission(
  'greetings',
  'Say hello and introduce yourself',
  'Begin with a greeting, answer the name question, and close with “nice to meet you”. Treat these as complete spoken phrases while script study catches up. The model uses ฉัน and ค่ะ; other pronouns and polite endings are possible in real conversation.',
  [
    note('สวัสดีค่ะ', 'Hello.'),
    note('คุณชื่ออะไรครับ?', 'What is your name?'),
    note('ฉันชื่อแอนค่ะ', 'My name is Ann.'),
    note('ยินดีที่ได้รู้จักค่ะ', 'Nice to meet you.'),
    note('สบายดีค่ะ', 'I am fine.'),
  ],
  [
    choice(
      'hello',
      'Choose a greeting when meeting someone.',
      'สวัสดีค่ะ',
      ['ขอบคุณค่ะ', 'ลาก่อนค่ะ'],
      'สวัสดี is hello. ลาก่อน is goodbye.',
      'conversation-response',
    ),
    choice(
      'name-question',
      'What information does คุณชื่ออะไรครับ ask for?',
      'Your name',
      ['Your health', 'Your order'],
      'ชื่อ means name and อะไร means what.',
      'conversation-understanding',
    ),
    order(
      'introduce',
      'Build “My name is Ann” with the model’s polite ending.',
      ['ฉัน', 'ชื่อแอน', 'ค่ะ'],
      'The model sequence is I + am named Ann + polite ending.',
    ),
    choice(
      'respond-name',
      'Someone asks your name. Choose the matching reply.',
      'ฉันชื่อแอนค่ะ',
      ['สบายดีค่ะ', 'ขอบคุณค่ะ'],
      'Answer the name question with ฉันชื่อ…',
      'conversation-response',
    ),
    choice(
      'meet',
      'What does ยินดีที่ได้รู้จักค่ะ convey?',
      'Nice to meet you',
      ['I am fine', 'See you tomorrow'],
      'Use this friendly closing after an introduction.',
      'conversation-understanding',
    ),
  ],
  'conversation',
  '/lessons/lesson-1',
);

const scriptLessons: Mission[] = [
  letters(
    'mid-common',
    'Six useful middle-class letters',
    'จดตบปอ',
    'Meet the rest of the common middle-class set. จ is an unaspirated affricate; ด and ต differ in voicing, while บ and ป do too. อ can carry a vowel when there is no other initial. Class will help you read tones later.',
    choice(
      'read-eye',
      'The word ตา means eye. Which letter is its initial?',
      'ต',
      ['ด', 'บ'],
      'ตา begins with ต; า is long aa.',
    ),
  ),
  letters(
    'low-sonorants',
    'Smooth sounds and living endings',
    'งนมยรลว',
    'These low-class consonants include nasals, liquids, and glides. Many keep air flowing at the end of a syllable. Notice that ร and ล are r/l initially but become n in ordinary final position; ย and ว also participate in vowel spellings.',
    choice(
      'final-r',
      'What is the regular final sound of ร?',
      'n',
      ['r', 'l'],
      'ร begins with r but normally ends a syllable as n.',
      'final-sound',
    ),
  ),
  letters(
    'high-common',
    'High-class sound partners',
    'ขฉถผฝสห',
    'Several high-class letters share initial sounds with low-class partners. “High class” names a spelling category, not an automatic high tone. ข/ค and ผ/พ are partner pairs; the extra breath in kh, th, and ph matters.',
    choice(
      'pair',
      'Which pair shares the aspirated initial ph sound?',
      'ผ / พ',
      ['ผ / ม', 'ผ / ก'],
      'ผ and พ both begin with aspirated ph but have different classes.',
      'sound-comparison',
    ),
  ),
  letters(
    'low-paired',
    'Everyday low-class partners',
    'คชซทพฟฮ',
    'Learn the low-class partners of sounds you have already met. ซ is low class and ผ is high class. Shared initial sounds do not mean letters are interchangeable: spelling fixes the word and helps determine its tone.',
    choice(
      'f-final',
      'ฟ begins with f. What is its regular final sound?',
      'p',
      ['f', 'm'],
      'ฟ closes a syllable as an unreleased p.',
      'final-sound',
    ),
  ),
  letters(
    'mid-rare',
    'The two less common middle-class letters',
    'ฎฏ',
    'Complete the nine middle-class consonants with ฎ and ฏ. These occur mainly in words and names of Indic origin. Learn their shapes and class without expecting to use them as often as ด and ต; both close syllables with t.',
    choice(
      'final-retroflex',
      'What final sound do both ฎ and ฏ normally have?',
      't',
      ['d', 'n'],
      'Both have final t, despite their different initial sounds.',
      'final-sound',
    ),
  ),
  letters(
    'high-rare',
    'Complete the high-class family',
    'ฃฐศษ',
    'Complete the high-class family. ฃ is obsolete in ordinary modern spelling but remains part of the 44-letter alphabet. ศ, ษ, and ส share initial s and final t; their historical spellings must be learned with words.',
    choice(
      'obsolete-high',
      'Which of these high-class letters is obsolete in everyday spelling?',
      'ฃ',
      ['ศ', 'ษ'],
      'ฃ remains in the alphabet but ข serves the modern kh spelling.',
      'letter-history',
    ),
  ),
  letters(
    'low-rare-a',
    'Names and historical spellings: part one',
    'ฅฆฌญฑ',
    'These low-class letters often occur in inherited or borrowed spellings. ฅ is obsolete in everyday writing; ฆ remains in use. ญ starts with y and normally ends with n. ฑ is often th initially, but some words have d, so check the whole word.',
    choice(
      'final-y',
      'What final sound does ญ normally represent?',
      'n',
      ['y', 'ng'],
      'ญ has initial y but final n.',
      'final-sound',
    ),
  ),
  letters(
    'low-rare-b',
    'Finish all 44 consonants',
    'ฒณธภฬ',
    'Finish the alphabet with five low-class letters. ฒ and ธ commonly begin with th, ณ with n, ภ with ph, and ฬ with l. These spellings are useful in names and borrowed vocabulary; their final sounds often differ from their initials.',
    choice(
      'final-l',
      'ฬ has initial l. What sound does it normally have at the end?',
      'n',
      ['l', 'w'],
      'Like ล, ฬ normally has final n.',
      'final-sound',
    ),
  ),
];

const vowelLessons: Mission[] = [
  vowelLesson(
    'vowel-a-i-u',
    'Short and long a, i, and u',
    ['อะ', 'อา', 'อิ', 'อี', 'อุ', 'อู'],
    'Length can distinguish Thai words. Learn a/aa, i/ii, and u/uu as pairs; the long version is held longer. The i signs sit above a consonant, and u signs sit below. Read the examples rather than inventing spellings by concatenation.',
    [note('มี', 'have · mii'), note('ดู', 'look / watch · duu')],
    [
      choice(
        'long-i',
        'Which reference form is long ii?',
        'อี',
        ['อิ', 'อุ'],
        'อี has the long ii sign above its carrier.',
        'vowel-recognition',
      ),
      choice(
        'short-u',
        'Which reference form is short u?',
        'อุ',
        ['อู', 'อา'],
        'อุ is short u; อู is long uu.',
        'vowel-recognition',
      ),
      choice(
        'position',
        'Where does the vowel sign in ดู sit?',
        'Below the initial',
        ['Before the initial', 'After the initial'],
        'The ู sign sits beneath ด.',
        'vowel-position',
      ),
      order(
        'build-have',
        'Build มี, “have”, from its parts.',
        ['ม', 'ี'],
        'ม + ี writes มี. The vowel renders above ม.',
        'word-building',
      ),
      choice('read-watch', 'Which word means “look / watch”?', 'ดู', ['มี', 'มา'], 'ดู uses ด and long uu.'),
    ],
  ),
  vowelLesson(
    'vowel-front',
    'Vowels written before the initial',
    ['เอะ', 'เอ', 'แอะ', 'แอ'],
    'The signs เ and แ are written before the initial consonant but pronounced after it. The final ะ in these open reference forms makes the vowel short. The aa-like sound ae differs from the e sound; listen to model audio when available.',
    [
      note('แม่', 'mother · mâe', 'แ is the vowel; ่ is a tone mark. Learn this as a whole word.'),
      note('แอะ', 'short ae', 'The vowel surrounds the carrier in this open form.'),
    ],
    [
      choice(
        'long-e',
        'Select the long e reference form.',
        'เอ',
        ['เอะ', 'แอะ'],
        'เอ is long e; เอะ is short e.',
        'vowel-recognition',
      ),
      choice(
        'short-ae',
        'Select the short ae reference form.',
        'แอะ',
        ['แอ', 'เอ'],
        'แอะ surrounds อ and includes short-vowel ะ.',
        'vowel-recognition',
      ),
      choice(
        'reading-order',
        'A vowel sign is written before an initial. Which sound is pronounced first?',
        'The initial consonant',
        ['The written vowel', 'Always a separate อ sound'],
        'Written position is not spoken order: the consonant is pronounced before its vowel.',
        'vowel-position',
      ),
      choice(
        'mother',
        'What does แม่ mean?',
        'mother',
        ['have', 'crow'],
        'แม่ means mother. The tone mark is separate from the vowel.',
      ),
      choice(
        'mark-vowel',
        'In แม่, which is the vowel sign?',
        'แ',
        ['ม', '่'],
        'แ supplies ae; ่ supplies a tone clue.',
        'vowel-position',
      ),
    ],
  ),
  vowelLesson(
    'vowel-back',
    'Round and central vowel pairs',
    ['อึ', 'อือ', 'โอะ', 'โอ', 'เอาะ', 'ออ', 'เออะ', 'เออ'],
    'Expand your vowel map with ue, o, aw, and oe pairs. Ue is made without rounded lips, unlike u. Reference forms show open syllables; some spellings change before a final consonant. For now, recognize the full forms and these explicitly taught words.',
    [note('มือ', 'hand · mue'), note('ขอ', 'ask for · khǎw'), note('โต', 'big / grow · too')],
    [
      choice(
        'long-ue',
        'Which reference form represents long ue?',
        'อือ',
        ['อึ', 'อู'],
        'อือ is long ue; อู is rounded uu.',
        'vowel-recognition',
      ),
      choice(
        'short-aw',
        'Which reference form is short aw?',
        'เอาะ',
        ['ออ', 'โอ'],
        'เอาะ is short aw; ออ is long aw.',
        'vowel-recognition',
      ),
      choice(
        'long-oe',
        'Which reference form is long oe?',
        'เออ',
        ['เออะ', 'เอ'],
        'เออ is long oe, distinct from long e.',
        'vowel-recognition',
      ),
      choice('hand', 'Which word means “hand”?', 'มือ', ['ขอ', 'โต'], 'มือ uses the long ue spelling.'),
      choice(
        'grow',
        'Which long vowel sign is written before ต in โต?',
        'โ',
        ['อ', 'เ'],
        'โ is written before ต and pronounced after it.',
        'vowel-position',
      ),
    ],
  ),
  vowelLesson(
    'vowel-diphthongs',
    'Vowels that glide',
    ['เอียะ', 'เอีย', 'เอือะ', 'เอือ', 'อัวะ', 'อัว'],
    'A diphthong moves between vowel qualities within one syllable. Learn ia, uea, and ua as complete spelling patterns. Their short open forms are rare; prioritize recognizing them, then practice the common long forms in real words.',
    [note('เสีย', 'lose / damaged · sǐa'), note('เรือ', 'boat · ruea'), note('ตัว', 'body / classifier · tua')],
    [
      choice(
        'ia',
        'Which reference form is long ia?',
        'เอีย',
        ['เอือ', 'อัว'],
        'เอีย is ia; เอือ is uea.',
        'vowel-recognition',
      ),
      choice(
        'ua',
        'Which reference form is long ua?',
        'อัว',
        ['อัวะ', 'เอียะ'],
        'อัว is the long form. Adding ะ makes this open pattern short.',
        'vowel-recognition',
      ),
      choice('boat', 'Which word means “boat”?', 'เรือ', ['เสีย', 'ตัว'], 'เรือ uses the long uea pattern.'),
      choice(
        'short-status',
        'How should a beginner prioritize เอือะ?',
        'Recognize it as a rare short form',
        ['Use it instead of every เอือ', 'Ignore it because it is a consonant'],
        'เอือะ is a real but rare short diphthong representation.',
        'vowel-recognition',
      ),
      choice(
        'body-pattern',
        'Which reference vowel pattern appears in ตัว?',
        'อัว',
        ['เอีย', 'เอือ'],
        'Replace the carrier อ in อัว with ต to see the spelling of ตัว.',
        'word-building',
      ),
    ],
  ),
  vowelLesson(
    'vowel-special',
    'Am, ai, and ao in useful words',
    ['อำ', 'ไอ', 'ใอ', 'เอา'],
    'These special vowel spellings include an ending sound. ไ and ใ both sound ai; choose their spelling by learning the word. Never infer that one is a different vowel sound. Use whole words ไป, ใจ, ทำ, and เอา as anchors.',
    [
      note('ไป', 'go · pai'),
      note('ใจ', 'heart / mind · jai'),
      note('ทำ', 'do / make · tham'),
      note('เอา', 'take / want · ao'),
    ],
    [
      choice(
        'am',
        'Which reference form contains the am sound?',
        'อำ',
        ['เอา', 'ไอ'],
        'อำ includes the final m sound.',
        'vowel-recognition',
      ),
      choice(
        'two-ai',
        'How do ไอ and ใอ differ in vowel sound?',
        'They share the ai sound',
        ['ไอ is ai; ใอ is ii', 'ไอ is short u; ใอ is long u'],
        'The two ai spellings share a sound. Their spelling is word-specific.',
        'vowel-recognition',
      ),
      choice('go', 'Choose the standard spelling of “go”.', 'ไป', ['ใจ', 'ทำ'], 'ไป means go and uses ไ.'),
      choice('heart', 'Choose the word for “heart / mind”.', 'ใจ', ['ไป', 'เอา'], 'ใจ means heart or mind and uses ใ.'),
      choice(
        'ao',
        'Which reference form has the ao sound?',
        'เอา',
        ['อำ', 'ใอ'],
        'เอา has ao, ending in a w-like glide.',
        'vowel-recognition',
      ),
    ],
  ),
  vowelLesson(
    'vowel-loan',
    'Recognize the four historical vowel symbols',
    ['ฤ', 'ฤๅ', 'ฦ', 'ฦๅ'],
    'Finish all 32 traditional vowel representations. These four symbols come from the Indic tradition and are not productive patterns for inventing Thai words. ฤ survives in particular words with word-dependent pronunciation; the other forms are rare or obsolete.',
    [
      note('ฤดู', 'season · rue-duu', 'A real word containing ฤ, read rue here.'),
      note('ฤๅษี', 'hermit · rue-sii', 'A traditional spelling containing the rare long symbol ฤๅ.'),
    ],
    [
      choice(
        'long-rue',
        'Which symbol is the traditional long rue form?',
        'ฤๅ',
        ['ฤ', 'ฦ'],
        'ฤๅ includes the length sign ๅ.',
        'vowel-recognition',
      ),
      choice(
        'lue',
        'Which symbol is the traditional short lue form?',
        'ฦ',
        ['ฤ', 'ฤๅ'],
        'ฦ is the obsolete lue symbol; ฤ is the r-series symbol.',
        'vowel-recognition',
      ),
      choice(
        'long-lue',
        'Which symbol is the traditional long lue form?',
        'ฦๅ',
        ['ฦ', 'ฤ'],
        'ฦๅ is the long member of the l-series.',
        'vowel-recognition',
      ),
      choice(
        'season',
        'What does ฤดู mean?',
        'season',
        ['boat', 'mother'],
        'ฤดู means season; here ฤ is pronounced rue.',
      ),
      choice(
        'priority',
        'What is the useful beginner goal for ฦ and ฦๅ?',
        'Recognize their historical forms',
        ['Use them in every new word', 'Treat them as tone marks'],
        'They complete the traditional inventory but are obsolete in normal modern spelling.',
        'vowel-recognition',
      ),
    ],
  ),
];

function dialogueNotes(id: string): Note[] {
  const source = required(
    lessons.find(lesson => lesson.id === id),
    id,
  );
  return ['start', 'node_2', 'end'].flatMap(key => {
    const node = source.nodes[key];
    return [
      ...node.lines.map(line => note(line.thai, line.english, line.transliteration)),
      ...node.choices
        .filter(item => item.isCorrect !== false)
        .map(item => note(item.thai, item.english, item.transliteration)),
    ];
  });
}
const digits = mission(
  'digits',
  'Read Thai digits and small quantities',
  'Thai digits represent the same quantities as Arabic digits. Learn their shapes alongside the spoken number words. For drink orders, the quantity comes before a classifier: หนึ่งแก้ว means one cup. Start by recognizing signs and matching a small order.',
  [
    ...numbers.slice(0, 10).map(n => note(n.thaiChar, `${n.arabicEquivalent} · ${n.thaiName}`, n.pronunciation)),
    note('หนึ่งแก้ว', 'one cup'),
    note('สองแก้ว', 'two cups'),
  ],
  [
    choice(
      'three',
      'Which Thai digit means 3?',
      '๓',
      ['๘', '๖'],
      '๓ represents three, spoken สาม.',
      'number-recognition',
    ),
    choice('zero', 'Which Thai digit means zero?', '๐', ['๑', '๙'], '๐ is zero, spoken ศูนย์.', 'number-recognition'),
    choice('eight', 'Read ๘.', '8', ['6', '3'], '๘ represents eight, spoken แปด.', 'number-recognition'),
    order('two-cups', 'Build “two cups”.', ['สอง', 'แก้ว'], 'The number goes before the cup classifier แก้ว.'),
    choice(
      'one-order',
      'How many cups are in หนึ่งแก้ว?',
      'One',
      ['Two', 'Nine'],
      'หนึ่ง means one; แก้ว is the cup classifier.',
      'number-reading',
    ),
  ],
  'conversation',
  '/reference',
);

const prices = mission(
  'prices',
  'Understand tens and everyday prices',
  'Build tens with สิบ and hundreds with ร้อย. Twenty has the special form ยี่สิบ; a final one after tens is เอ็ด, as in ยี่สิบเอ็ด. Read prices from largest unit to smallest, then บาท for baht. The examples prepare you for taxis and the market.',
  [
    note('สิบ', '10'),
    note('ยี่สิบ', '20'),
    note('ยี่สิบเอ็ด', '21', 'เอ็ด replaces หนึ่ง at the end of this number.'),
    note('ห้าสิบ', '50'),
    note('ร้อยห้าสิบบาท', '150 baht'),
    note('สองร้อยห้าสิบบาท', '250 baht'),
    note('สองร้อยบาท', '200 baht'),
  ],
  [
    choice(
      'twenty',
      'Which word means twenty?',
      'ยี่สิบ',
      ['สิบ', 'ห้าสิบ'],
      'Twenty is ยี่สิบ, a special tens form.',
      'number-reading',
    ),
    choice(
      'twenty-one',
      'Read ยี่สิบเอ็ด.',
      '21',
      ['11', '20'],
      'ยี่สิบ is twenty and final เอ็ด adds one.',
      'number-reading',
    ),
    order(
      'price-250',
      'Build “250 baht”.',
      ['สองร้อย', 'ห้าสิบ', 'บาท'],
      'Two hundred + fifty + baht.',
      'number-building',
    ),
    choice(
      'fare',
      'The fare is ร้อยห้าสิบบาท. How much is it?',
      '150 baht',
      ['250 baht', '50 baht'],
      'ร้อย is one hundred and ห้าสิบ is fifty.',
      'number-reading',
    ),
    choice(
      'discount-price',
      'Which price is lower than สองร้อยห้าสิบบาท?',
      'สองร้อยบาท',
      ['สามร้อยบาท', 'ห้าร้อยบาท'],
      'สองร้อยบาท is 200 baht, lower than 250.',
      'number-reading',
    ),
  ],
  'conversation',
);

const toneLive = mission(
  'tone-live',
  'Find live and dead syllables',
  'Before deriving unmarked tones, classify the syllable ending. Long open vowels and nasal or glide endings are live. Short open vowels and final unreleased p, t, or k are dead. The same ending category can be spelled with several different letters.',
  [
    note('มา', 'live · long open vowel'),
    note('กิน', 'eat · live', 'Final น is n, a nasal.'),
    note('มาก', 'much / very · dead', 'Final ก is k, a stop.'),
    note('กะ', 'estimate · dead', 'Short open vowel ะ ends with a glottal stop.'),
    note('กา', 'crow · mid tone', 'Unmarked mid-class initial with a live syllable.'),
    note('กัด', 'bite · low tone', 'Unmarked mid-class initial with a dead syllable.'),
  ],
  [
    choice(
      'nasal',
      'Is กิน live or dead?',
      'Live',
      ['Dead', 'Cannot tell from final น'],
      'Final n is a nasal, so กิน is live.',
      'syllable-type',
    ),
    choice(
      'stop',
      'Is มาก live or dead?',
      'Dead',
      ['Live', 'Always live because the vowel is long'],
      'Final k makes it dead even with a long vowel.',
      'syllable-type',
    ),
    choice(
      'short-open',
      'Why is กะ dead?',
      'It has a short open vowel',
      ['It has no tone mark', 'Every middle-class syllable is dead'],
      'A short open vowel ends with a glottal stop.',
      'syllable-type',
    ),
    choice(
      'mid-live',
      'Unmarked mid-class ก plus a live syllable: what tone in กา?',
      'Mid',
      ['Rising', 'High'],
      'Mid-class + live + no mark gives mid tone.',
      'tone-rule',
    ),
    choice(
      'mid-dead',
      'Unmarked mid-class ก plus a dead syllable: what tone in กัด?',
      'Low',
      ['Mid', 'Rising'],
      'Mid-class + dead + no mark gives low tone.',
      'tone-rule',
    ),
  ],
  'tones',
  '/tone-trainer',
);

const toneMarks = mission(
  'tone-marks',
  'Use class, marks, and vowel length',
  'Apply a small rule table to known words. Mai ek gives low tone with high/mid initials and falling with low initials. Mai tho gives falling with high/mid initials and high with low initials. Unmarked low-class dead syllables also depend on vowel length.',
  [
    note('ข่า', 'galangal · low', 'High-class + mai ek.'),
    note('ค่า', 'value / fee · falling', 'Low-class + mai ek.'),
    note('ข้า', 'servant / historical I · falling', 'High-class + mai tho.'),
    note('ค้า', 'trade · high', 'Low-class + mai tho.'),
    note('รัก', 'love · high', 'Low-class, no mark, dead syllable, short vowel.'),
    note('มาก', 'much / very · falling', 'Low-class, no mark, dead syllable, long vowel.'),
    note('จ๊ะ', 'friendly particle · high', 'Mid-class with mai tri ๊.'),
    note('จ๋า', 'affectionate response/call · rising', 'Mid-class with mai chattawa ๋.'),
  ],
  [
    choice(
      'low-ek',
      'What tone does ค่า have (low-class ค + mai ek)?',
      'Falling',
      ['Low', 'High'],
      'Mai ek gives falling tone with low-class initials.',
      'tone-rule',
    ),
    choice(
      'low-tho',
      'What tone does ค้า have (low-class ค + mai tho)?',
      'High',
      ['Falling', 'Rising'],
      'Mai tho gives high tone with low-class initials.',
      'tone-rule',
    ),
    choice(
      'short-dead',
      'Why does รัก have high tone?',
      'Low-class, unmarked, short dead syllable',
      ['Every ร word is high', 'A hidden mai tho is present'],
      'Low-class unmarked dead syllables are high with short vowels.',
      'tone-rule',
    ),
    choice(
      'long-dead',
      'What tone does มาก have?',
      'Falling',
      ['High', 'Mid'],
      'Low-class unmarked dead syllables are falling with long vowels.',
      'tone-rule',
    ),
    choice(
      'chattawa',
      'Which tone does mai chattawa give the mid-class syllable จ๋า?',
      'Rising',
      ['High', 'Low'],
      'Mai chattawa ๋ gives rising tone in this mid-class pattern.',
      'tone-rule',
    ),
    choice(
      'high-ek-again',
      'Which rule explains ข่า?',
      'High-class + mai ek gives low tone',
      ['High-class + mai ek gives falling tone', 'All high-class initials have high tone'],
      'Consonant class is a rule input, not the resulting pitch.',
      'tone-rule',
    ),
  ],
  'tones',
  '/tone-trainer',
);

const taxi = mission(
  'taxi',
  'Give a taxi destination',
  'Use the taxi scene to name a destination, understand a tollway question, and recognize arrival. You can accept or decline the tollway; both are valid choices in real life. In each exercise, follow the specific intention stated in the prompt.',
  dialogueNotes('lesson-3'),
  [
    choice(
      'destination-question',
      'The driver says ไปไหนครับน้อง? What do they need?',
      'Your destination',
      ['Your name', 'Your drink order'],
      'ไปไหน asks where you are going.',
      'conversation-understanding',
    ),
    order(
      'destination',
      'Build “To Central World, please” with ค่ะ.',
      ['ไป', 'เซ็นทรัลเวิลด์', 'ค่ะ'],
      'ไป introduces where you are going.',
    ),
    choice(
      'tollway-yes',
      'You want to take the tollway. Choose your reply.',
      'ขึ้นทางด่วนเลยค่ะ',
      ['ไม่ต้องขึ้นค่ะ', 'ขอบคุณค่ะ'],
      'ขึ้นทางด่วน accepts taking the tollway.',
      'conversation-response',
    ),
    choice(
      'tollway-no',
      'You want to decline the tollway. Choose your reply.',
      'ไม่ต้องขึ้นค่ะ',
      ['ขึ้นทางด่วนเลยค่ะ', 'ไปเซ็นทรัลเวิลด์ค่ะ'],
      'ไม่ต้อง means no need; here it declines the tollway.',
      'conversation-response',
    ),
    choice(
      'arrive',
      'The driver says ถึงแล้วครับ. What has happened?',
      'You have arrived',
      ['The taxi is cancelled', 'The driver asks your name'],
      'ถึงแล้ว means arrived already.',
      'conversation-understanding',
    ),
  ],
  'conversation',
  '/lessons/lesson-3',
);

const market = mission(
  'market',
  'Ask a price and respond at the market',
  'Follow a market exchange from price question to decision. A seller quotes 250 baht; you can ask for 200 or politely decline. The exercise intention determines the response. The phrase ราคาเท่าไหร่ asks how much something costs.',
  dialogueNotes('lesson-4'),
  [
    choice(
      'ask-price',
      'You want the price of an item. What do you say?',
      'ตัวนี้ราคาเท่าไหร่คะ?',
      ['ขอบคุณมากค่ะ', 'สวัสดีค่ะ'],
      'ราคาเท่าไหร่ asks how much the price is.',
      'conversation-response',
    ),
    choice(
      'quoted-price',
      'Read the seller’s price: สองร้อยห้าสิบบาท.',
      '250 baht',
      ['200 baht', '150 baht'],
      'สองร้อย is 200 and ห้าสิบ adds 50.',
      'number-reading',
    ),
    choice(
      'discount',
      'You want to ask for a discount. Choose the request.',
      'ลดหน่อยได้ไหมคะ?',
      ['แพงไปค่ะ ขอบคุณค่ะ', 'ขอบคุณมากค่ะ'],
      'ลดหน่อยได้ไหม asks whether the seller can lower the price.',
      'conversation-response',
    ),
    order(
      'decline',
      'Build the model’s polite “Too expensive. Thank you.”',
      ['แพงไปค่ะ', 'ขอบคุณค่ะ'],
      'State that it is too expensive, then thank the seller.',
    ),
    choice(
      'accepted-price',
      'The seller agrees to สองร้อย. What is the new price?',
      '200 baht',
      ['250 baht', '20 baht'],
      'สองร้อย means two hundred.',
      'number-reading',
    ),
  ],
  'conversation',
  '/lessons/lesson-4',
);

const finals = mission(
  'finals',
  'Read endings and changed vowel spellings',
  'An initial sound and a final sound can differ for the same letter. Final stops are unreleased: do not add an extra vowel. Some short vowels change their written form in closed syllables; learn these real examples instead of appending a final to the open reference form.',
  [
    note('กิน', 'eat · kin', 'Short i with final n; live.'),
    note('กับ', 'with · kap', 'Short a is written ั before final บ, pronounced p.'),
    note('คน', 'person · khon', 'The short o vowel is unwritten between ค and น.'),
    note('รถ', 'vehicle · rot', 'The short o vowel is unwritten; final ถ is t.'),
    note('เด็ก', 'child · dek', 'Short e in this closed spelling uses เ and ็; final ก is k.'),
    note('นอน', 'sleep · nawn', 'Long aw in a closed syllable; น closes with n.'),
  ],
  [
    choice(
      'final-b',
      'Which final sound do you pronounce in กับ?',
      'p',
      ['b', 'm'],
      'บ has initial b but final unreleased p.',
      'final-sound',
    ),
    choice(
      'implicit-o',
      'Which vowel is understood in คน?',
      'Short o',
      ['Long aa', 'Long ii'],
      'คน is khon: this short o is not separately written.',
      'vowel-spelling',
    ),
    choice(
      'short-a-spelling',
      'Which word uses ั for short a before a final?',
      'กับ',
      ['กิน', 'นอน'],
      'กับ shows the closed-syllable spelling ั.',
      'vowel-spelling',
    ),
    choice(
      'vehicle-final',
      'What is the final sound of รถ?',
      't',
      ['th', 'n'],
      'ถ is aspirated th initially but unreleased t finally.',
      'final-sound',
    ),
    choice('child', 'Which word means “child”?', 'เด็ก', ['คน', 'รถ'], 'เด็ก is child, with short e and final k.'),
  ],
);

const clusters = mission(
  'clusters',
  'Read clusters and a leading ห',
  'Two written consonants do not always mean two spoken syllables. In true clusters such as ปลา, both initial sounds are spoken. A leading ห before certain low-class sonorants is silent but gives the syllable high-class tone behavior. Learn the whole examples first.',
  [
    note('ปลา', 'fish · plaa', 'ป and ล form an initial cluster.'),
    note('ครู', 'teacher · khruu', 'ค and ร form an initial cluster.'),
    note(
      'หมา',
      'dog · mǎa',
      'Silent leading ห makes ม follow high-class tone behavior; live and unmarked gives rising.',
    ),
    note('ม้า', 'horse · máa', 'Low-class ม with mai tho gives high tone.'),
    note('หนู', 'mouse · nǔu', 'Leading ห + น; long live unmarked syllable gives rising tone.'),
  ],
  [
    choice(
      'fish-initial',
      'What initial cluster is spoken in ปลา?',
      'pl',
      ['p only', 'm'],
      'ป and ล are both spoken in this true cluster.',
      'cluster-reading',
    ),
    choice('teacher', 'Which word means “teacher”?', 'ครู', ['ปลา', 'หนู'], 'ครู means teacher and begins with khr.'),
    choice(
      'leading-h',
      'What does ห do in หมา?',
      'It is silent and changes tone-class behavior',
      ['It adds a separate haa syllable', 'It marks a long vowel'],
      'Leading ห is silent here, but the word follows high-class tone rules.',
      'tone-rule',
    ),
    choice(
      'dog-tone',
      'Why does หมา have rising tone?',
      'Leading ห, live syllable, no tone mark',
      ['Every word with ม rises', 'The vowel า is always rising'],
      'Leading ห supplies high-class behavior to this live unmarked syllable.',
      'tone-rule',
    ),
    choice(
      'horse',
      'Which word is “horse”, rather than “dog”?',
      'ม้า',
      ['หมา', 'หนู'],
      'ม้า means horse; หมา means dog. Their tones differ.',
    ),
  ],
);

const recovery = mission(
  'recovery',
  'Keep a conversation going',
  'You do not need to understand every word to keep talking. Practice saying that you did not understand, asking for repetition, and asking for slower speech. These are useful responses in their own right. The model uses ครับ; polite forms can vary by speaker.',
  [
    note('ไม่เข้าใจครับ', 'I do not understand.'),
    note('พูดอีกครั้งได้ไหมครับ?', 'Could you say that again?'),
    note('พูดช้า ๆ ได้ไหมครับ?', 'Could you speak slowly?'),
    note('ขอโทษครับ', 'Excuse me / sorry.'),
    note('ขอบคุณครับ', 'Thank you.'),
  ],
  [
    choice(
      'repeat',
      'You missed the sentence and want to hear it again.',
      'พูดอีกครั้งได้ไหมครับ?',
      ['ขอบคุณครับ', 'สวัสดีครับ'],
      'อีกครั้ง means again; this requests repetition.',
      'conversation-response',
    ),
    choice(
      'slow',
      'The speaker is too fast. Choose a request for slower speech.',
      'พูดช้า ๆ ได้ไหมครับ?',
      ['พูดอีกครั้งได้ไหมครับ?', 'ขอบคุณครับ'],
      'ช้า ๆ means slowly; this specifies speed.',
      'conversation-response',
    ),
    order(
      'not-understood',
      'Build “I do not understand” using the taught polite model.',
      ['ไม่', 'เข้าใจ', 'ครับ'],
      'ไม่ negates เข้าใจ, understand.',
    ),
    choice(
      'sorry',
      'What does ขอโทษครับ mean?',
      'Excuse me / sorry',
      ['Normal sweetness', 'Nice to meet you'],
      'ขอโทษ is useful for politely getting attention or apologizing.',
      'conversation-understanding',
    ),
    choice(
      'after-help',
      'Someone repeats the sentence for you. Choose a thank-you.',
      'ขอบคุณครับ',
      ['ไม่เข้าใจครับ', 'พูดช้า ๆ ได้ไหมครับ?'],
      'ขอบคุณ thanks the person for helping.',
      'conversation-response',
    ),
  ],
  'conversation',
  '/lessons',
);

const emergency = mission(
  'emergency',
  'Describe a problem and ask for help',
  'Practice language from the help-seeking dialogue: a headache, nausea, a hospital, and an ambulance. Learn these as useful chunks, with clear differences between a place and a vehicle. This lesson checks phrase understanding and response selection.',
  [
    ...dialogueNotes('lesson-5'),
    note('ปวดหัว', 'have a headache'),
    note('คลื่นไส้', 'nauseous'),
    note('โรงพยาบาล', 'hospital'),
    note('รถพยาบาล', 'ambulance'),
  ],
  [
    choice(
      'symptoms',
      'You have a headache and feel nauseous. Choose the matching reply.',
      'ฉันปวดหัวและรู้สึกคลื่นไส้ค่ะ',
      ['ฉันชอบกินข้าวเหนียวมะม่วง', 'สบายดีค่ะ'],
      'ปวดหัว describes a headache; คลื่นไส้ describes nausea.',
      'conversation-response',
    ),
    choice(
      'ambulance',
      'What is รถพยาบาล?',
      'An ambulance',
      ['A hospital building', 'Travel insurance'],
      'รถ indicates a vehicle; รถพยาบาล is ambulance.',
      'conversation-understanding',
    ),
    choice(
      'hospital',
      'Which word names the hospital?',
      'โรงพยาบาล',
      ['รถพยาบาล', 'ประกันการเดินทาง'],
      'โรงพยาบาล is the hospital; รถพยาบาล is the ambulance.',
      'conversation-understanding',
    ),
    order(
      'help-thanks',
      'Build “Thank you for your help” with ค่ะ.',
      ['ขอบคุณ', 'ที่ช่วยเหลือ', 'ค่ะ'],
      'ขอบคุณ + ที่ช่วยเหลือ thanks someone for helping.',
    ),
    choice(
      'insurance',
      'What does ฉันมีประกันการเดินทาง convey?',
      'I have travel insurance',
      ['I have arrived', 'I would like a taxi'],
      'ประกันการเดินทาง means travel insurance.',
      'conversation-understanding',
    ),
  ],
  'conversation',
  '/lessons/lesson-5',
);

const reading = mission(
  'reading',
  'Read a tiny menu and a message',
  'Use your script and practical phrases together. A menu often leaves out full-sentence grammar, so read the item and its price as a pair. In a message, use the purpose of the sentence to check your reading. Read before opening a hint and notice which support you needed.',
  [
    note('กาแฟ', 'coffee'),
    note('ชา', 'tea'),
    note('เย็น', 'iced / cool'),
    note('กาแฟเย็น ๕๐ บาท', 'Iced coffee · 50 baht'),
    note('ชาเย็น ๔๐ บาท', 'Iced tea · 40 baht'),
    note('ขอหวานน้อยครับ', 'Less sweet, please.'),
    note('ไปตลาด', 'go to the market', 'ตลาด means market; learn the word as a whole.'),
  ],
  [
    choice(
      'menu-coffee',
      'Read the menu. What is the iced coffee price?',
      '50 baht',
      ['40 baht', '150 baht'],
      'กาแฟเย็น is iced coffee; ๕๐ means 50.',
      'reading-comprehension',
      'กาแฟเย็น ๕๐ บาท\nชาเย็น ๔๐ บาท',
    ),
    choice(
      'menu-cheaper',
      'Which listed drink costs less?',
      'ชาเย็น',
      ['กาแฟเย็น', 'Both cost the same'],
      'Tea is 40 baht and coffee is 50.',
      'reading-comprehension',
      'กาแฟเย็น ๕๐ บาท\nชาเย็น ๔๐ บาท',
    ),
    choice(
      'message-sweet',
      'What preference is in this message?',
      'Less sweet',
      ['Normal sweetness', 'Extra sweet'],
      'หวานน้อย asks for less sweetness.',
      'reading-comprehension',
      'ขอหวานน้อยครับ',
    ),
    choice(
      'message-go',
      'Where is the writer going?',
      'The market',
      ['A hospital', 'A school'],
      'ไป means go; ตลาด is market.',
      'reading-comprehension',
      'ไปตลาด',
    ),
    order(
      'tea-order',
      'Build “I’ll have one iced tea” with ครับ.',
      ['เอา', 'ชาเย็น', 'หนึ่งแก้ว', 'ครับ'],
      'Request + drink + quantity/classifier + polite ending. Use the coffee pattern with tea.',
    ),
  ],
  'script',
  '/reading',
);

const checkpoint = mission(
  'checkpoint',
  'Put your first Thai course together',
  'This final checkpoint combines reading, written tone reasoning, price understanding, and a practical response. It is a sample of the skills you have practiced, not a fluency certificate. Try the questions before opening help; the notes are here whenever you need a refresher.',
  [
    note('มา / หมา / ม้า', 'come / dog / horse', 'The written initial pattern and tone mark distinguish these words.'),
    note('สองร้อยห้าสิบบาท', '250 baht'),
    note('พูดอีกครั้งได้ไหมครับ?', 'Could you say that again?'),
    note('ไปเซ็นทรัลเวิลด์ค่ะ', 'To Central World, please.'),
    note('ขอหวานน้อยครับ', 'Less sweet, please.'),
    note('กิน', 'eat', 'Final n makes this a live syllable.'),
  ],
  [
    choice(
      'read-dog',
      'Choose the word meaning “dog”.',
      'หมา',
      ['มา', 'ม้า'],
      'หมา is dog: leading ห gives high-class behavior and rising tone.',
    ),
    choice(
      'tone-transfer',
      'What tone is high-class ข with mai tho in ข้า?',
      'Falling',
      ['High', 'Low'],
      'High-class + mai tho gives falling tone.',
      'tone-rule',
    ),
    choice(
      'live-transfer',
      'Why is กิน a live syllable?',
      'It ends in the nasal n',
      ['It has a short vowel', 'It has no tone mark'],
      'A nasal ending makes a syllable live regardless of the vowel length.',
      'syllable-type',
    ),
    choice(
      'price-transfer',
      'A seller quotes สองร้อยห้าสิบบาท. Read the amount.',
      '250 baht',
      ['150 baht', '200 baht'],
      'Two hundred + fifty = 250.',
      'number-reading',
    ),
    order(
      'order-transfer',
      'Build a request for less sweetness using ครับ.',
      ['ขอ', 'หวานน้อย', 'ครับ'],
      'Request marker + less sweet + polite ending.',
    ),
    choice(
      'recover-transfer',
      'You did not catch what someone said. Ask for repetition.',
      'พูดอีกครั้งได้ไหมครับ?',
      ['ไปเซ็นทรัลเวิลด์ค่ะ', 'ขอหวานน้อยครับ'],
      'อีกครั้ง asks for the words again.',
      'conversation-response',
    ),
  ],
  'conversation',
  '/practice',
);

/** Stable catalog ordering also preserves existing mission links and saved runs. */
export const MISSIONS: Mission[] = [
  firstWords,
  coffee,
  toneClues,
  greetings,
  ...scriptLessons,
  ...vowelLessons,
  digits,
  prices,
  toneLive,
  toneMarks,
  taxi,
  market,
  finals,
  clusters,
  recovery,
  emergency,
  reading,
  checkpoint,
];

/** The pedagogical order is independent of the catalog's legacy first three entries. */
export const COURSE_LESSON_IDS: string[] = [
  'first-words',
  'greetings',
  'vowel-a-i-u',
  'mid-common',
  'tone-clues',
  'coffee',
  'low-sonorants',
  'vowel-front',
  'high-common',
  'digits',
  'low-paired',
  'vowel-back',
  'mid-rare',
  'tone-live',
  'taxi',
  'vowel-diphthongs',
  'high-rare',
  'low-rare-a',
  'prices',
  'tone-marks',
  'low-rare-b',
  'vowel-special',
  'market',
  'vowel-loan',
  'finals',
  'clusters',
  'recovery',
  'emergency',
  'reading',
  'checkpoint',
];
