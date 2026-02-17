import { useTTS } from '@/hooks/useTTS';
import { motion } from 'framer-motion';
import { AlertCircle, Eraser, Loader2, ScanSearch, Undo2, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createWorker, PSM, type Worker } from 'tesseract.js';

type RecognitionState =
  | { status: 'idle' }
  | { status: 'loading'; message: string }
  | { status: 'success'; text: string; confidence: number }
  | { status: 'error'; message: string };

export function WritingPad() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [recognition, setRecognition] = useState<RecognitionState>({
    status: 'idle',
  });
  const workerRef = useRef<Worker | null>(null);
  const strokeHistory = useRef<ImageData[]>([]);
  const { speak } = useTTS();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return undefined;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width - 32, 400);
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawGrid(ctx, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  const getMouseCoords = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getTouchCoords = (e: TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const beginStroke = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    strokeHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (strokeHistory.current.length > 20) {
      strokeHistory.current.shift();
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
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
    const { x, y } = getMouseCoords(e);
    beginStroke(x, y);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const { x, y } = getMouseCoords(e);
    continueStroke(x, y);
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
      const { x, y } = getTouchCoords(e);
      beginStroke(x, y);
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const { x, y } = getTouchCoords(e);
      continueStroke(x, y);
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

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    strokeHistory.current = [];
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
    setHasStrokes(false);
    setRecognition({ status: 'idle' });
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

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const val = avg < 180 ? 0 : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 255;
    }

    const ocrSize = 600;
    const padding = 60;
    const ocrCanvas = document.createElement('canvas');
    ocrCanvas.width = ocrSize;
    ocrCanvas.height = ocrSize;
    const ocrCtx = ocrCanvas.getContext('2d');
    if (!ocrCtx) return null;

    ocrCtx.fillStyle = '#ffffff';
    ocrCtx.fillRect(0, 0, ocrSize, ocrSize);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    tempCtx.putImageData(src, 0, 0);

    const drawSize = ocrSize - padding * 2;
    ocrCtx.drawImage(tempCanvas, padding, padding, drawSize, drawSize);

    return ocrCanvas.toDataURL('image/png');
  }, []);

  const recognizeText = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setRecognition({ status: 'loading', message: 'Initializing OCR engine…' });

    try {
      if (!workerRef.current) {
        setRecognition({
          status: 'loading',
          message: 'Loading Thai language data…',
        });
        const worker = await createWorker('tha');
        workerRef.current = worker;
      }

      setRecognition({
        status: 'loading',
        message: 'Recognizing handwriting…',
      });

      const processedImage = preprocessCanvasForOCR();
      if (!processedImage) {
        setRecognition({ status: 'error', message: 'Failed to process the drawing.' });
        return;
      }

      await workerRef.current.setParameters({
        tessedit_pageseg_mode: PSM.SINGLE_CHAR,
        tessedit_char_whitelist: 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮะาิีึืุูเแโใไัำํ็่้๊๋ฯๆ๏๚๛๐๑๒๓๔๕๖๗๘๙',
      });

      const result = await workerRef.current.recognize(processedImage);

      const rawText = result.data.text.trim();
      const thaiOnly = rawText
        .replace(/[^\u0E00-\u0E7F\s]/g, '')
        .normalize('NFC')
        .trim();
      const confidence = result.data.confidence;

      if (thaiOnly) {
        setRecognition({ status: 'success', text: thaiOnly, confidence });
      } else {
        const errorMessage =
          rawText.length > 0
            ? 'Please enter only Thai characters.'
            : 'Could not recognize Thai text. Try writing larger, clearer strokes.';

        setRecognition({
          status: 'error',
          message: errorMessage,
        });
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setRecognition({
        status: 'error',
        message: 'OCR failed. Please check your internet connection for the first-time language data download.',
      });
    }
  }, [preprocessCanvasForOCR]);

  useEffect(() => {
    return () => {
      void workerRef.current?.terminate();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Canvas Area */}
      <div ref={containerRef} className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 font-semibold">Drawing Area</p>
          <p className="text-sm text-muted-foreground">Write a Thai character or word below</p>
        </div>

        {/* Canvas Container */}
        <div className="relative p-4 bg-card rounded-2xl border border-border shadow-lg">
          <canvas
            ref={canvasRef}
            className="rounded-xl cursor-crosshair touch-none"
            style={{ display: 'block' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          />

          {/* Hint overlay when empty */}
          {!hasStrokes && (
            <div className="absolute inset-4 flex items-center justify-center pointer-events-none rounded-xl">
              <p className="text-4xl text-slate-300 dark:text-slate-600 font-sarabun select-none">เขียนที่นี่</p>
            </div>
          )}
        </div>

        {/* Tool Buttons */}
        <div className="flex gap-2">
          <button
            onClick={undoStroke}
            disabled={!hasStrokes}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={clearCanvas}
            disabled={!hasStrokes}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
          >
            <Eraser className="w-4 h-4" />
            Clear
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

      {/* Recognition Result */}
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
                <p className="text-xs text-muted-foreground mt-0.5">
                  First time may take a moment to download Thai language data
                </p>
              </div>
            </div>
          )}

          {recognition.status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Recognition Result
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    recognition.confidence > 70
                      ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                      : recognition.confidence > 40
                        ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                        : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {Math.round(recognition.confidence)}% confidence
                </span>
              </div>

              <div className="p-4 bg-secondary/30 rounded-xl">
                <p className="text-4xl sm:text-5xl font-bold text-foreground text-center font-sarabun leading-relaxed">
                  {recognition.text}
                </p>
              </div>

              <button
                onClick={() => {
                  speak(recognition.text);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Listen to Recognized Text
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

      {/* Tips */}
      <div className="p-4 bg-secondary/30 rounded-xl border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">✍️ Tips for better recognition</h3>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• Write large, clear characters in the center</li>
          <li>• Draw each stroke deliberately — avoid quick scribbles</li>
          <li>• Use the center crosshair as a guide for positioning</li>
          <li>• The first recognition attempt may take longer as it loads Thai language data</li>
        </ul>
      </div>
    </div>
  );
}
