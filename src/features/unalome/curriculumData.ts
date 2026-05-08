export type NodeType = 'lesson' | 'practice' | 'reading' | 'challenge';

export interface UnalomeNode {
  id: string;
  title: string;
  description: string;
  type: NodeType;
  position: { x: number; y: number }; // Relative coordinates (0-100) for SVG
  requires: string[]; // Node IDs that must be completed to unlock this
}

export const UNALOME_NODES: UnalomeNode[] = [
  {
    id: 'node_1',
    title: 'The Awakening',
    description: 'Learn your first Thai consonants.',
    type: 'lesson',
    position: { x: 50, y: 90 },
    requires: [],
  },
  {
    id: 'node_2',
    title: 'Vowel Harmony',
    description: 'Introduce simple vowels.',
    type: 'lesson',
    position: { x: 30, y: 80 },
    requires: ['node_1'],
  },
  {
    id: 'node_3',
    title: 'First Words',
    description: 'Combine what you learned.',
    type: 'practice',
    position: { x: 70, y: 70 },
    requires: ['node_2'],
  },
  {
    id: 'node_4',
    title: 'Tone Mastery',
    description: 'Understand the 5 tones.',
    type: 'challenge',
    position: { x: 20, y: 60 },
    requires: ['node_3'],
  },
  {
    id: 'node_5',
    title: 'Smart Reading',
    description: 'Read your first story.',
    type: 'reading',
    position: { x: 80, y: 50 },
    requires: ['node_4'],
  },
  {
    id: 'node_6',
    title: 'The Path Forward',
    description: 'Advanced sentence building.',
    type: 'lesson',
    position: { x: 50, y: 20 },
    requires: ['node_5'],
  },
];
