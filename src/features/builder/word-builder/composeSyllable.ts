// These patterns arrange signs; they do not verify vocabulary or derive tone.
const OPEN: Record<string, string> = {
  อะ: 'Cะ',
  อา: 'Cา',
  อิ: 'Cิ',
  อี: 'Cี',
  อึ: 'Cึ',
  อือ: 'Cือ',
  อุ: 'Cุ',
  อู: 'Cู',
  เอะ: 'เCะ',
  เอ: 'เC',
  แอะ: 'แCะ',
  แอ: 'แC',
  โอะ: 'โCะ',
  โอ: 'โC',
  เอาะ: 'เCาะ',
  ออ: 'Cอ',
  เออะ: 'เCอะ',
  เออ: 'เCอ',
  เอียะ: 'เCียะ',
  เอีย: 'เCีย',
  เอือะ: 'เCือะ',
  เอือ: 'เCือ',
  อัวะ: 'Cัวะ',
  อัว: 'Cัว',
};
const CLOSED: Record<string, string> = {
  อะ: 'Cั',
  อา: 'Cา',
  อิ: 'Cิ',
  อี: 'Cี',
  อึ: 'Cึ',
  อือ: 'Cื',
  อุ: 'Cุ',
  อู: 'Cู',
  เอะ: 'เC็',
  เอ: 'เC',
  แอะ: 'แC็',
  แอ: 'แC',
  โอะ: 'C',
  โอ: 'โC',
  ออ: 'Cอ',
  เอีย: 'เCีย',
  เอือ: 'เCือ',
  อัว: 'Cว',
};

export function composeSyllable(initial: string, vowel: string, tone = '', final = '') {
  if (!initial || !vowel) return { text: initial, supported: false };
  const pattern = (final ? CLOSED : OPEN)[vowel];
  if (!pattern || (tone && pattern.includes('็'))) return { text: '', supported: false };
  // Dependent vowels come before the tone mark in the encoded combining sequence.
  const marked = pattern.replace(/C([ัิีึืุู]?)/, (_, vowelSign: string) => initial + vowelSign + tone);
  return { text: marked + final, supported: true };
}
