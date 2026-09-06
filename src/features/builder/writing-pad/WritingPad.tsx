import { useTTS } from '@/hooks/useTTS';
import { motion } from 'framer-motion';
import { AlertCircle, Eraser, Loader2, ScanSearch, Undo2, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isOCRReady, recognizeThaiText } from '@/lib/ocr';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { addOffering } from '@/features/waikru/useWaiKru';
import { DifficultySelector, type DifficultyLevel } from './DifficultySelector';
import { CharacterFeedback } from './CharacterFeedback';
import { splitThaiString } from '@/lib/thai-utils';
import { incrementChallengeProgress } from '@/features/dailyChallenges/challengeGenerator';

type RecognitionState =
  | { status: 'idle' }
  | { status: 'loading'; message: string; subMessage?: string }
  | { status: 'success'; fullText: string; characters: string[]; confidence: number }
  | { status: 'error'; message: string };

export function WritingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [level, setLevel] = useState<DifficultyLevel>(1);
  const [recognition, setRecognition] = useState<RecognitionState>({ status: 'idle' });
  const strokeHistory = useRef<ImageData[]>([]);
  const userStats = useLiveQuery(() => db.userStats.get(1));
  const { speak } = useTTS('th-TH', userStats?.playbackSpeed ?? 0.8);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, currentLevel: number) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    // Horizontal center line
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Vertical lines based on level columns
    const columns = currentLevel;
    const colWidth = width / columns;

    for (let i = 1; i < columns; i++) {
      // Solid boundaries between characters
      ctx.beginPath();
      ctx.strokeStyle = '#cbd5e1';
      ctx.setLineDash([]);
      ctx.moveTo(i * colWidth, 0);
      ctx.lineTo(i * colWidth, height);
      ctx.stroke();
    }

    // Faint dashed centers for each column
    ctx.strokeStyle = '#f1f5f9';
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < columns; i++) {
      const center = i * colWidth + colWidth / 2;
      ctx.beginPath();
      ctx.moveTo(center, 0);
      ctx.lineTo(center, height);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    // Keep a stable bitmap while CSS resizes the pad, preserving drawing and undo.
    const width = 600;
    const height = level === 1 ? 600 : 240;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, level);
  }, [level, drawGrid]);

  // When level changes, clear and resize
  useEffect(() => {
    strokeHistory.current = [];
    setHasStrokes(false);
    setRecognition({ status: 'idle' });
    resizeCanvas();
  }, [level, resizeCanvas]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    strokeHistory.current = [];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height, level);
    setHasStrokes(false);
    setRecognition({ status: 'idle' });
  }, [level, drawGrid]);

  const getMouseCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const getTouchCoords = (e: TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: ((touch.clientX - rect.left) * canvas.width) / rect.width,
      y: ((touch.clientY - rect.top) * canvas.height) / rect.height,
    };
  };

  const beginStroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    strokeHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (strokeHistory.current.length > 30) {
      strokeHistory.current.shift();
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawingRef.current = true;
    setHasStrokes(true);
  };

  const continueStroke = (x: number, y: number) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = () => {
    isDrawingRef.current = false;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    beginStroke(getMouseCoords(e).x, getMouseCoords(e).y);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    continueStroke(getMouseCoords(e).x, getMouseCoords(e).y);
  };
  const onMouseUp = () => {
    endStroke();
  };
  const onMouseLeave = () => {
    endStroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      beginStroke(getTouchCoords(e).x, getTouchCoords(e).y);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      continueStroke(getTouchCoords(e).x, getTouchCoords(e).y);
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endStroke();
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const undoStroke = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || strokeHistory.current.length === 0) return;

    const previousState = strokeHistory.current.pop();
    if (!previousState) return;
    ctx.putImageData(previousState, 0, 0);

    if (strokeHistory.current.length === 0) {
      setHasStrokes(false);
    }
  }, []);

  const preprocessCanvasForOCR = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const src = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = src.data;

    // Aggressive binarization for higher contrast
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg < 200 ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }

    const ocrCanvas = document.createElement('canvas');
    // Scale up for better line OCR
    const scale = 2;
    const padding = 60;
    ocrCanvas.width = canvas.width * scale + padding * 2;
    ocrCanvas.height = canvas.height * scale + padding * 2;

    const ocrCtx = ocrCanvas.getContext('2d');
    if (!ocrCtx) return null;

    ocrCtx.fillStyle = '#ffffff';
    ocrCtx.fillRect(0, 0, ocrCanvas.width, ocrCanvas.height);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')?.putImageData(src, 0, 0);

    ocrCtx.drawImage(tempCanvas, padding, padding, canvas.width * scale, canvas.height * scale);
    return ocrCanvas.toDataURL('image/png');
  }, []);

  const recognizeText = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isOCRReady()) {
      setRecognition({
        status: 'loading',
        message: 'Loading Thai language data…',
        subMessage: 'First time download is ~10MB. Please wait.',
      });
    } else {
      setRecognition({ status: 'loading', message: 'Recognizing handwriting…' });
    }

    try {
      const processedImage = preprocessCanvasForOCR();
      if (!processedImage) {
        setRecognition({ status: 'error', message: 'Failed to process drawing.' });
        return;
      }

      const { text: rawText, confidence } = await recognizeThaiText(processedImage, level);

      const thaiOnly = rawText
        .replace(/[^\u0E00-\u0E7F]/g, '') // remove spaces and punctuation
        .normalize('NFC')
        .trim();

      if (thaiOnly) {
        const characters = splitThaiString(thaiOnly);
        setRecognition({ status: 'success', fullText: thaiOnly, characters, confidence });

        // Update Stats
        const todayMs = Date.now();
        for (const char of characters) {
          let stat = await db.writingPadStats.where('character').equals(char).first();
          stat ??= { character: char, attempts: 0, successes: 0, avgConfidence: 0, lastAttempt: 0 };
          const isSuccess = confidence > 60;

          if (isSuccess) {
            void addOffering('dokMaKhue', 1);
            void incrementChallengeProgress('write', 1);
          }

          const newAttempts = stat.attempts + 1;
          const newSuccesses = stat.successes + (isSuccess ? 1 : 0);
          const newAvg = (stat.avgConfidence * stat.attempts + confidence) / newAttempts;

          if (stat.id === undefined) {
            await db.writingPadStats.add({
              ...stat,
              attempts: newAttempts,
              successes: newSuccesses,
              avgConfidence: newAvg,
              lastAttempt: todayMs,
            });
          } else {
            await db.writingPadStats.update(stat.id, {
              attempts: newAttempts,
              successes: newSuccesses,
              avgConfidence: newAvg,
              lastAttempt: todayMs,
            });
          }
        }
      } else {
        const msg =
          rawText.length > 0
            ? 'Please enter only Thai characters.'
            : 'Could not recognize Thai text. Try writing larger in the guides.';
        setRecognition({ status: 'error', message: msg });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setRecognition({
        status: 'error',
        message: 'OCR failed. Check your connection for the language package download.',
      });
    }
  }, [preprocessCanvasForOCR, level]);

  return (
    <div className="space-y-6">
      <DifficultySelector level={level} setLevel={setLevel} disabled={recognition.status === 'loading'} />

      <div className="flex flex-col items-center gap-4">
        <div className="relative p-2 bg-card rounded-2xl border border-border shadow-lg w-full max-w-[616px]">
          <canvas
            ref={canvasRef}
            className="rounded-xl cursor-crosshair touch-none bg-white"
            style={{ display: 'block', width: '100%', height: 'auto' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          />
          {!hasStrokes && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-4xl text-slate-300 dark:text-slate-600 font-sarabun select-none opacity-50">
                {level === 1 ? 'ก' : 'เขียนที่นี่'}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={undoStroke}
            disabled={!hasStrokes}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <Undo2 className="w-4 h-4" /> Undo
          </button>
          <button
            onClick={clearCanvas}
            disabled={!hasStrokes}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <Eraser className="w-4 h-4" /> Clear
          </button>
          <button
            onClick={recognizeText}
            disabled={!hasStrokes || recognition.status === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          >
            {recognition.status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ScanSearch className="w-4 h-4" />
            )}
            Recognize
          </button>
        </div>
      </div>

      {recognition.status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-card rounded-2xl border border-border shadow-lg"
        >
          {recognition.status === 'loading' && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">{recognition.message}</p>
                {recognition.subMessage && <p className="text-[10px] opacity-80 mt-1">{recognition.subMessage}</p>}
              </div>
            </div>
          )}

          {recognition.status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  Recognition Result
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    recognition.confidence > 70
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300'
                      : recognition.confidence > 40
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300'
                  }`}
                >
                  {Math.round(recognition.confidence)}% OCR confidence
                </span>
              </div>

              <div className="py-2">
                <p className="text-4xl sm:text-5xl font-bold text-center font-sarabun text-foreground">
                  {recognition.fullText}
                </p>
                <CharacterFeedback characters={recognition.characters} confidenceScore={recognition.confidence} />
                <p className="text-xs text-muted-foreground text-center">
                  OCR confidence estimates what the software read. It does not grade your handwriting or spelling.
                </p>
              </div>

              <button
                onClick={() => {
                  speak(recognition.fullText);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20"
              >
                <Volume2 className="w-4 h-4" /> Listen to Text
              </button>
            </div>
          )}

          {recognition.status === 'error' && (
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Recognition Failed</p>
                <p className="text-xs text-muted-foreground mt-0.5">{recognition.message}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <div className="p-4 bg-secondary/30 rounded-xl border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">✍️ Guide</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Change difficulty to practice words vs individual characters.</li>
          <li>• Use the vertical lines to space out each letter evenly.</li>
          <li>• Write clearly and attach vowels closely to their consonants.</li>
        </ul>
      </div>
    </div>
  );
}
