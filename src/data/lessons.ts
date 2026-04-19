export interface LessonLine {
  id: string;
  speaker: 'system' | 'user';
  thai: string;
  english: string;
  transliteration?: string;
  delay?: number; // artificial delay before showing
}

export interface LessonChoice {
  id: string;
  thai: string;
  english: string;
  transliteration?: string;
  nextLineId: string; // which line follows this choice
  isCorrect?: boolean; // if undefined, it's just a branching choice without right/wrong
}

export interface LessonNode {
  id: string;
  lines: LessonLine[];
  choices: LessonChoice[];
}

export interface ConversationLesson {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  nodes: Record<string, LessonNode>;
  startNodeId: string;
}

export const lessons: ConversationLesson[] = [
  {
    id: 'lesson-1',
    title: 'Meeting Someone New',
    description: 'Learn basic greetings and introductions.',
    difficulty: 1,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        lines: [
          {
            id: 'l1',
            speaker: 'system',
            thai: 'สวัสดีครับ',
            english: 'Hello.',
            transliteration: 'sa-wat-dee khrap',
          },
        ],
        choices: [
          {
            id: 'c1',
            thai: 'สวัสดีค่ะ',
            english: 'Hello.',
            transliteration: 'sa-wat-dee kha',
            nextLineId: 'node_2',
            isCorrect: true,
          },
          {
            id: 'c2',
            thai: 'ลาก่อนค่ะ',
            english: 'Goodbye.',
            nextLineId: 'node_wrong_hello',
            isCorrect: false,
          },
        ],
      },
      node_wrong_hello: {
        id: 'node_wrong_hello',
        lines: [
          {
            id: 'l2',
            speaker: 'system',
            thai: 'เอ่อ... เราพึ่งเจอกันเองนะ',
            english: 'Umm... we just met.',
          },
        ],
        choices: [
          {
            id: 'c3',
            thai: 'ขอโทษค่ะ สวัสดีค่ะ',
            english: 'Sorry, hello.',
            transliteration: 'khor-thot kha, sa-wat-dee kha',
            nextLineId: 'node_2',
          },
        ],
      },
      node_2: {
        id: 'node_2',
        lines: [
          {
            id: 'l3',
            speaker: 'system',
            thai: 'คุณชื่ออะไรครับ?',
            english: 'What is your name?',
            transliteration: 'khun cheu a-rai krub?',
          },
        ],
        choices: [
          {
            id: 'c4',
            thai: 'ฉันชื่อแอนค่ะ',
            english: 'My name is Ann.',
            transliteration: 'chan cheu Ann kha',
            nextLineId: 'end',
            isCorrect: true,
          },
          {
            id: 'c5',
            thai: 'สบายดีค่ะ',
            english: 'I am fine.',
            nextLineId: 'node_wrong_name',
            isCorrect: false,
          },
        ],
      },
      node_wrong_name: {
        id: 'node_wrong_name',
        lines: [
          {
            id: 'l4',
            speaker: 'system',
            thai: 'ผมไม่ได้ถามว่าสบายดีไหมครับ ถามว่าชื่ออะไร',
            english: "I didn't ask how you are, I asked for your name.",
          },
        ],
        choices: [
          {
            id: 'c6',
            thai: 'อ๋อ ฉันชื่อแอนค่ะ',
            english: 'Oh, my name is Ann.',
            nextLineId: 'end',
          },
        ],
      },
      end: {
        id: 'end',
        lines: [
          {
            id: 'l5',
            speaker: 'system',
            thai: 'ยินดีที่ได้รู้จักครับแอน',
            english: 'Nice to meet you, Ann.',
            transliteration: 'yin-dee tee dai roo-jak krub Ann',
          },
        ],
        choices: [
          {
            id: 'c7',
            thai: 'ยินดีที่ได้รู้จักเช่นกันค่ะ',
            english: 'Nice to meet you too.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
    },
  },
  {
    id: 'lesson-2',
    title: 'Ordering Coffee',
    description: 'How to order your daily caffeine fix.',
    difficulty: 1,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        lines: [
          {
            id: 'l1',
            speaker: 'system',
            thai: 'รับอะไรดีคะ?',
            english: 'What would you like to have?',
          },
        ],
        choices: [
          {
            id: 'c1',
            thai: 'เอาลาเต้เย็นหนึ่งแก้วครับ',
            english: 'I will have one iced latte.',
            nextLineId: 'node_2',
            isCorrect: true,
          },
          {
            id: 'c2',
            thai: 'หิวมากครับ',
            english: 'I am very hungry.',
            nextLineId: 'node_wrong_coffee',
            isCorrect: false,
          },
        ],
      },
      node_wrong_coffee: {
        id: 'node_wrong_coffee',
        lines: [
          {
            id: 'l2',
            speaker: 'system',
            thai: 'ที่นี่ร้านกาแฟค่ะ ไม่มีอาหาร',
            english: 'This is a coffee shop, we have no food.',
          },
        ],
        choices: [
          {
            id: 'c3',
            thai: 'งั้นเอาลาเต้เย็นหนึ่งแก้วครับ',
            english: 'Then I will have one iced latte.',
            nextLineId: 'node_2',
          },
        ],
      },
      node_2: {
        id: 'node_2',
        lines: [
          {
            id: 'l3',
            speaker: 'system',
            thai: 'หวานปกติไหมคะ?',
            english: 'Normal sweetness?',
          },
        ],
        choices: [
          {
            id: 'c4',
            thai: 'ขอหวานน้อยครับ',
            english: 'Less sweet, please.',
            nextLineId: 'end',
          },
          {
            id: 'c5',
            thai: 'หวานปกติครับ',
            english: 'Normal sweetness.',
            nextLineId: 'end',
          },
        ],
      },
      end: {
        id: 'end',
        lines: [
          {
            id: 'l5',
            speaker: 'system',
            thai: 'รอสักครู่นะคะ',
            english: 'Please wait a moment.',
          },
        ],
        choices: [
          {
            id: 'c7',
            thai: 'ขอบคุณครับ',
            english: 'Thank you.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
    },
  },
  {
    id: 'lesson-3',
    title: 'Taking a Taxi',
    description: 'Give directions and negotiate clearly.',
    difficulty: 2,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        lines: [
          {
            id: 'l1',
            speaker: 'system',
            thai: 'ไปไหนครับน้อง?',
            english: 'Where are you going?',
            transliteration: 'pai nai krub nong?',
          },
        ],
        choices: [
          {
            id: 'c1',
            thai: 'ไปเซ็นทรัลเวิลด์ค่ะ',
            english: 'To Central World, please.',
            nextLineId: 'node_2',
            isCorrect: true,
          },
        ],
      },
      node_2: {
        id: 'node_2',
        lines: [
          {
            id: 'l3',
            speaker: 'system',
            thai: 'รถติดมากเลย ขึ้นทางด่วนไหม?',
            english: 'The traffic is very bad. Take the tollway?',
          },
        ],
        choices: [
          {
            id: 'c4',
            thai: 'ขึ้นทางด่วนเลยค่ะ',
            english: 'Yes, take the tollway.',
            nextLineId: 'end',
          },
          {
            id: 'c5',
            thai: 'ไม่ต้องขึ้นค่ะ',
            english: 'No need to take it.',
            nextLineId: 'end',
          },
        ],
      },
      end: {
        id: 'end',
        lines: [
          {
            id: 'l5',
            speaker: 'system',
            thai: 'ถึงแล้วครับ ทั้งหมดร้อยห้าสิบบาท',
            english: 'We have arrived. Total is 150 baht.',
          },
        ],
        choices: [
          {
            id: 'c7',
            thai: 'นี่ค่ะ เงินทอนไม่ต้องนะคะ',
            english: 'Here you go. Keep the change.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
    },
  },
  {
    id: 'lesson-4',
    title: 'Shopping at Night Market',
    description: 'Ask for prices and practice bartering.',
    difficulty: 2,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        lines: [
          {
            id: 'l1',
            speaker: 'system',
            thai: 'สนใจดูได้นะคะ',
            english: 'Feel free to take a look.',
          },
        ],
        choices: [
          {
            id: 'c1',
            thai: 'ตัวนี้ราคาเท่าไหร่คะ?',
            english: 'How much is this one?',
            nextLineId: 'node_2',
          },
        ],
      },
      node_2: {
        id: 'node_2',
        lines: [
          {
            id: 'l3',
            speaker: 'system',
            thai: 'สองร้อยห้าสิบบาทค่ะ สวยมากเลยนะ',
            english: '250 baht. It is very beautiful.',
          },
        ],
        choices: [
          {
            id: 'c4',
            thai: 'ลดหน่อยได้ไหมคะ? สองร้อยถ้วนได้ไหม?',
            english: 'Can you give a discount? 200 flat?',
            nextLineId: 'end',
          },
          {
            id: 'c5',
            thai: 'แพงไปค่ะ ขอบคุณค่ะ',
            english: 'Too expensive. Thank you.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
      end: {
        id: 'end',
        lines: [
          {
            id: 'l5',
            speaker: 'system',
            thai: 'เอ้าๆ สองร้อยก็สองร้อย ถือว่าประเดิมร้านละกัน',
            english: 'Alright, 200 it is. Consider it the first sale of the day.',
          },
        ],
        choices: [
          {
            id: 'c7',
            thai: 'ขอบคุณมากค่ะ',
            english: 'Thank you very much.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
    },
  },
  {
    id: 'lesson-5',
    title: 'Emergency Situations',
    description: 'Crucial vocab for doctors, police, or being lost.',
    difficulty: 3,
    startNodeId: 'start',
    nodes: {
      start: {
        id: 'start',
        lines: [
          {
            id: 'l1',
            speaker: 'system',
            thai: 'คุณเป็นอะไรครับ? หน้าซีดมาก',
            english: 'What is wrong with you? You look very pale.',
          },
        ],
        choices: [
          {
            id: 'c1',
            thai: 'ฉันปวดหัวและรู้สึกคลื่นไส้ค่ะ',
            english: 'I have a headache and feel nauseous.',
            nextLineId: 'node_2',
            isCorrect: true,
          },
          {
            id: 'c2',
            thai: 'ฉันชอบกินข้าวเหนียวมะม่วง',
            english: 'I like eating mango sticky rice.',
            nextLineId: 'node_wrong',
            isCorrect: false,
          },
        ],
      },
      node_wrong: {
        id: 'node_wrong',
        lines: [
          {
            id: 'l2',
            speaker: 'system',
            thai: 'อะไรนะครับ? คุณดูอาการไม่ดีเลย ไปหาหมอไหม?',
            english: "What? You don't look well at all. Should we go to the doctor?",
          },
        ],
        choices: [
          {
            id: 'c3',
            thai: 'ใช่ค่ะ รบกวนพาไปโรงพยาบาลหน่อย',
            english: 'Yes, please take me to the hospital.',
            nextLineId: 'end',
          },
        ],
      },
      node_2: {
        id: 'node_2',
        lines: [
          {
            id: 'l3',
            speaker: 'system',
            thai: 'งั้นเดี๋ยวผมเรียกรถพยาบาลให้นะครับ',
            english: 'Then I will call an ambulance for you.',
          },
        ],
        choices: [
          {
            id: 'c4',
            thai: 'ขอบคุณค่ะ ฉันมีประกันการเดินทาง',
            english: 'Thank you. I have travel insurance.',
            nextLineId: 'end',
          },
        ],
      },
      end: {
        id: 'end',
        lines: [
          {
            id: 'l5',
            speaker: 'system',
            thai: 'ทำใจดีๆไว้นะครับ รถพยาบาลใกล้ถึงแล้ว',
            english: 'Stay calm, the ambulance is almost here.',
          },
        ],
        choices: [
          {
            id: 'c7',
            thai: 'ขอบคุณที่ช่วยเหลือค่ะ',
            english: 'Thank you for your help.',
            nextLineId: 'COMPLETE',
          },
        ],
      },
    },
  },
];
