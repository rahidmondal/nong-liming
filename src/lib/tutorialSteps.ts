export interface TutorialStep {
  route: string;
  element: string;
  title: string;
  description: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { route: '/', element: '#nav-course-pace', title: 'Choose your study pace', description: 'Choose 30, 45, or 60 study days. Every pace includes the same 30 lessons; longer plans add recall days. Study days advance when you finish, so you can take a break.' },
  { route: '/', element: '#nav-daily-session', title: 'Start with today’s lesson', description: 'Learn from short notes, try the questions, and check the explanation after each answer. You can resume an unfinished lesson. Hints are available whenever you need help.' },
  { route: '/', element: '#nav-course', title: 'See the whole course', description: 'Open the course path to see script, tones, and everyday conversations woven together. Return to earlier lessons for practice and see which study days you have completed.' },
  { route: '/reference', element: '#reference-tabs', title: 'Keep the full alphabet within reach', description: 'Use these tabs for all 44 consonants, 32 traditional vowel representations, Thai numbers, and tone marks. Consonant classes and vowel forms stay available as a reference while you learn them in smaller course lessons.' },
  { route: '/', element: '#nav-flashcards', title: 'Review with flashcards', description: 'Open your decks for spaced-repetition review. You can add cards and import Anki decks. Flashcard reviews are separate from your course lessons.' },
  { route: '/practice', element: '#nav-tab-practice', title: 'Find extra practice here', description: 'Practice opens this tools hub. Choose the tool that fits what you want to work on; these activities are available alongside your course.' },
  { route: '/practice', element: '#nav-dictionary', title: 'Look up a word', description: 'Search the dictionary to check a word and its meaning. Quick Add lets you keep useful vocabulary in a flashcard deck for later review.' },
  { route: '/practice', element: '#nav-builder', title: 'Explore spelling and handwriting', description: 'Writing Builder contains the word builder and a writing pad. Explore letter combinations or practice writing Thai. Use the course examples to check the words you build.' },
  { route: '/practice', element: '#nav-tone-trainer', title: 'Practice tone distinctions', description: 'Use the Tone Trainer for focused tone practice. The course also explains how consonant class, tone marks, and syllable endings determine a written word’s tone.' },
  { route: '/practice', element: '#nav-lessons', title: 'Try a conversation', description: 'Choose a dialogue about meeting someone, ordering coffee, taking a taxi, shopping, or asking for help. Read the exchange and select a response for the situation.' },
  { route: '/practice', element: '#nav-reading', title: 'Read with support', description: 'Smart Reading gives you Thai text to explore. Tap words for meaning and use the available support when you need it; try reading a phrase yourself first.' },
  { route: '/practice', element: '#nav-sentence-practice', title: 'Build a sentence', description: 'Sentence Practice lets you arrange word chunks into sentences. Use it to notice Thai word order after meeting useful phrases in the course.' },
  { route: '/stats', element: '#nav-tab-profile', title: 'Check your learning record', description: 'Profile opens your study statistics and recorded activity. Use this record to see your practice over time. Settings are opened from the gear on Home; we will visit them next.' },
  { route: '/settings', element: '#settings-audio', title: 'Adjust audio and appearance', description: 'Settings contains your theme and default playback speed. Audio uses a Thai voice available on your device; a slower speed can help when you are meeting a new word.' },
  { route: '/settings', element: '#settings-backup', title: 'Keep a backup of your learning', description: 'Export a full .nong backup to keep your data and media, or import one to restore them. You can replay this tour from Settings at any time. Choose Finish tour when you are ready to explore.' },
];
