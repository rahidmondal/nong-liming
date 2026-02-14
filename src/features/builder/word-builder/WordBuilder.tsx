import { consonants } from '@/data/consonants';
import { tones } from '@/data/tones';
import { vowels } from '@/data/vowels';
import type { ThaiConsonant, ThaiTone, ThaiVowel } from '@/types/alphabet';
import { motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, RotateCcw, Volume2, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const FINAL_CONSONANT_SOUNDS = new Set(['k', 't', 'p', 'n', 'm', 'ng', 'y', 'w']);

const finalConsonants = consonants.filter(c => FINAL_CONSONANT_SOUNDS.has(c.finalSound));

const builderVowels = vowels.filter(v => v.type !== 'special');

const toneMarks = tones.filter(t => t.thaiChar !== '');

interface SlotPickerProps {
  label: string;
  items: { id: string; thaiChar: string; label: string }[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  accentColor: string;
  optional?: boolean;
}

function SlotPicker({ label, items, selected, onSelect, accentColor, optional = false }: SlotPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedItem = items.find(i => i.id === selected);
  const displayItems = expanded ? items : items.slice(0, 8);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
          {label}
          {optional && <span className="text-xs text-muted-foreground font-normal">(optional)</span>}
        </h3>
        {selected && (
          <button
            onClick={() => {
              onSelect(null);
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {displayItems.map(item => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onSelect(selected === item.id ? null : item.id);
            }}
            className={`
              relative px-3 py-2 rounded-lg text-lg font-medium transition-all border
              ${
                selected === item.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                  : 'bg-card text-foreground border-border hover:border-primary/50 hover:shadow-sm'
              }
            `}
            title={item.label}
          >
            {item.thaiChar || '—'}
          </motion.button>
        ))}
      </div>

      {items.length > 8 && (
        <button
          onClick={() => {
            setExpanded(!expanded);
          }}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show all {items.length}
            </>
          )}
        </button>
      )}

      {selectedItem && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium">{selectedItem.label}</span>
        </p>
      )}
    </div>
  );
}

export function WordBuilder() {
  const [initialConsonant, setInitialConsonant] = useState<string | null>(null);
  const [selectedVowel, setSelectedVowel] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [finalConsonant, setFinalConsonant] = useState<string | null>(null);

  const consonantItems = useMemo(
    () =>
      consonants.map((c: ThaiConsonant) => ({
        id: c.id,
        thaiChar: c.thaiChar,
        label: `${c.thaiName} [${c.class}]`,
      })),
    [],
  );

  const vowelItems = useMemo(
    () =>
      builderVowels.map((v: ThaiVowel) => ({
        id: v.id,
        thaiChar: v.thaiChar.replace(/อ/g, ''),
        label: `${v.thaiName} — ${v.english}`,
      })),
    [],
  );

  const toneItems = useMemo(
    () =>
      toneMarks.map((t: ThaiTone) => ({
        id: t.id,
        thaiChar: t.thaiChar,
        label: t.thaiName,
      })),
    [],
  );

  const finalConsonantItems = useMemo(
    () =>
      finalConsonants.map((c: ThaiConsonant) => ({
        id: c.id,
        thaiChar: c.thaiChar,
        label: `${c.thaiName} [final: ${c.finalSound}]`,
      })),
    [],
  );

  const composed = useMemo(() => {
    const ic = consonants.find(c => c.id === initialConsonant);
    const v = builderVowels.find(v => v.id === selectedVowel);
    const t = toneMarks.find(t => t.id === selectedTone);
    const fc = finalConsonants.find(c => c.id === finalConsonant);

    if (!ic) return '';

    let result = ic.thaiChar;

    if (t) {
      result += t.thaiChar;
    }

    if (v) {
      const vowelChar = v.thaiChar.replace(/อ/g, '');
      result += vowelChar;
    }

    if (fc) {
      result += fc.thaiChar;
    }

    return result;
  }, [initialConsonant, selectedVowel, selectedTone, finalConsonant]);

  const validation = useMemo(() => {
    const checks = [
      {
        label: 'Initial consonant',
        pass: Boolean(initialConsonant),
        required: true,
      },
      { label: 'Vowel', pass: Boolean(selectedVowel), required: true },
      { label: 'Tone mark', pass: Boolean(selectedTone), required: false },
      { label: 'Final consonant', pass: Boolean(finalConsonant), required: false },
    ];

    const requiredComplete = checks.filter(c => c.required).every(c => c.pass);
    const isValid = requiredComplete;

    return { checks, isValid };
  }, [initialConsonant, selectedVowel, selectedTone, finalConsonant]);

  const handleReset = useCallback(() => {
    setInitialConsonant(null);
    setSelectedVowel(null);
    setSelectedTone(null);
    setFinalConsonant(null);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!composed) return;
    const utterance = new SpeechSynthesisUtterance(composed);
    utterance.lang = 'th-TH';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [composed]);

  return (
    <div className="space-y-6">
      {/* Construction Preview */}
      <motion.div layout className="relative p-6 bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
        {/* Glow effect */}
        <div
          className={`absolute inset-0 opacity-10 transition-opacity duration-500 ${validation.isValid ? 'opacity-20' : 'opacity-0'}`}
          style={{
            background: 'radial-gradient(circle at center, var(--primary), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col items-center gap-4">
          {/* Composed character display */}
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Your Syllable</p>
            <motion.div
              key={composed}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-7xl sm:text-8xl font-bold leading-none py-4 min-h-24 flex items-center justify-center ${
                composed ? 'text-foreground' : 'text-muted-foreground/30'
              }`}
            >
              {composed || '—'}
            </motion.div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSpeak}
              disabled={!composed}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Listen
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Validation checklist */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {validation.checks.map(check => (
              <div
                key={check.label}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  check.pass
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : check.required
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                      : 'bg-secondary/50 border-border text-muted-foreground'
                }`}
              >
                {check.pass ? <Check className="w-3 h-3 shrink-0" /> : <X className="w-3 h-3 shrink-0" />}
                <span className="truncate">{check.label}</span>
              </div>
            ))}
          </div>

          {/* Status message */}
          <motion.p
            key={validation.isValid ? 'valid' : 'invalid'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm font-medium ${
              validation.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            }`}
          >
            {validation.isValid
              ? '✨ Valid Thai syllable structure!'
              : 'Select at least an initial consonant and a vowel'}
          </motion.p>
        </div>
      </motion.div>

      {/* Slot Pickers */}
      <div className="space-y-5">
        <SlotPicker
          label="Initial Consonant"
          items={consonantItems}
          selected={initialConsonant}
          onSelect={setInitialConsonant}
          accentColor="#059669"
        />

        <SlotPicker
          label="Vowel"
          items={vowelItems}
          selected={selectedVowel}
          onSelect={setSelectedVowel}
          accentColor="#3b82f6"
        />

        <SlotPicker
          label="Tone Mark"
          items={toneItems}
          selected={selectedTone}
          onSelect={setSelectedTone}
          accentColor="#f59e0b"
          optional
        />

        <SlotPicker
          label="Final Consonant"
          items={finalConsonantItems}
          selected={finalConsonant}
          onSelect={setFinalConsonant}
          accentColor="#8b5cf6"
          optional
        />
      </div>
    </div>
  );
}
