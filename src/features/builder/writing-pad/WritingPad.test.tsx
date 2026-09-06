import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WritingPad } from './WritingPad';

vi.mock('@/hooks/useTTS', () => ({ useTTS: () => ({ speak: vi.fn() }) }));
vi.mock('dexie-react-hooks', () => ({ useLiveQuery: () => undefined }));
vi.mock('@/lib/db', () => ({ db: {} }));
vi.mock('@/lib/ocr', () => ({ isOCRReady: () => true, recognizeThaiText: vi.fn() }));
vi.mock('@/features/waikru/useWaiKru', () => ({ addOffering: vi.fn() }));
vi.mock('@/features/dailyChallenges/challengeGenerator', () => ({ incrementChallengeProgress: vi.fn() }));

const blankSnapshot = { data: new Uint8ClampedArray([255, 255, 255, 255]), width: 1, height: 1, colorSpace: 'srgb' };
const context = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  lineCap: '',
  lineJoin: '',
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  setLineDash: vi.fn(),
  getImageData: vi.fn(() => blankSnapshot),
  putImageData: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setupCanvas() {
  const { container } = render(<WritingPad />);
  const canvas = container.querySelector('canvas');
  if (!canvas) throw new Error('Writing pad canvas is missing');
  const bounds = vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(new DOMRect(20, 40, 300, 300));
  return { canvas, bounds };
}

function drawStroke(canvas: HTMLCanvasElement) {
  fireEvent.mouseDown(canvas, { clientX: 95, clientY: 115 });
  fireEvent.mouseMove(canvas, { clientX: 170, clientY: 190 });
  fireEvent.mouseUp(canvas);
}

describe('WritingPad responsive drawing', () => {
  it('maps mouse input from CSS size to its fixed backing bitmap', () => {
    const { canvas } = setupCanvas();
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(600);
    expect(canvas.style.width).toBe('100%');
    context.moveTo.mockClear();
    context.lineTo.mockClear();
    drawStroke(canvas);
    expect(context.moveTo).toHaveBeenLastCalledWith(150, 150);
    expect(context.lineTo).toHaveBeenLastCalledWith(300, 300);
    expect(screen.getByRole('button', { name: 'Recognize' })).toBeEnabled();
  });

  it('preserves the bitmap, drawing state, and undo history across window resize', () => {
    const { canvas, bounds } = setupCanvas();
    drawStroke(canvas);
    const widthWrites = vi.spyOn(canvas, 'width', 'set');
    const heightWrites = vi.spyOn(canvas, 'height', 'set');
    context.fillRect.mockClear();
    bounds.mockReturnValue(new DOMRect(20, 40, 200, 200));
    fireEvent(window, new Event('resize'));
    expect(widthWrites).not.toHaveBeenCalled();
    expect(heightWrites).not.toHaveBeenCalled();
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(600);
    expect(screen.getByRole('button', { name: 'Recognize' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(context.putImageData).toHaveBeenCalledWith(blankSnapshot, 0, 0);
    expect(screen.getByRole('button', { name: 'Recognize' })).toBeDisabled();
  });

  it('uses the updated CSS bounds for drawing after resize', () => {
    const { canvas, bounds } = setupCanvas();
    bounds.mockReturnValue(new DOMRect(20, 40, 200, 200));
    fireEvent(window, new Event('resize'));
    fireEvent.mouseDown(canvas, { clientX: 70, clientY: 90 });
    fireEvent.mouseMove(canvas, { clientX: 120, clientY: 140 });
    fireEvent.mouseUp(canvas);
    expect(context.moveTo).toHaveBeenLastCalledWith(150, 150);
    expect(context.lineTo).toHaveBeenLastCalledWith(300, 300);
  });

  it('clears the bitmap and undo state on difficulty change and scales rectangular input', () => {
    const { canvas, bounds } = setupCanvas();
    drawStroke(canvas);
    context.fillRect.mockClear();
    fireEvent.click(screen.getByRole('radio', { name: 'Lvl 2' }));
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(240);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 600, 240);
    expect(screen.getByRole('button', { name: 'Recognize' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    bounds.mockReturnValue(new DOMRect(20, 40, 300, 120));
    fireEvent.mouseDown(canvas, { clientX: 95, clientY: 70 });
    fireEvent.mouseMove(canvas, { clientX: 170, clientY: 100 });
    fireEvent.mouseUp(canvas);
    expect(context.moveTo).toHaveBeenLastCalledWith(150, 60);
    expect(context.lineTo).toHaveBeenLastCalledWith(300, 120);
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Recognize' })).toBeDisabled();
  });
});
