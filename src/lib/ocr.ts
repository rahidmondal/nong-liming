import { createWorker, PSM, type Worker } from 'tesseract.js';

let isReady = false;
let workerPromise: Promise<Worker> | null = null;

export function isOCRReady(): boolean {
  return isReady;
}

export async function getOCRWorker(): Promise<Worker> {
  workerPromise ??= createWorker('tha')
    .then(w => {
      isReady = true;
      return w;
    })
    .catch((error: unknown) => {
      workerPromise = null; // allow retrying
      throw error;
    });
  return workerPromise;
}

export async function recognizeThaiText(
  imageData: string,
  level: number,
): Promise<{ text: string; confidence: number }> {
  const worker = await getOCRWorker();

  const psmMode = level === 1 ? PSM.SINGLE_CHAR : PSM.SINGLE_LINE;

  await worker.setParameters({
    tessedit_pageseg_mode: psmMode,
    tessedit_char_whitelist: 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮะาิีึืุูเแโใไัำํ็่้๊๋ฯๆ๏๚๛๐๑๒๓๔๕๖๗๘๙',
  });

  const result = await worker.recognize(imageData);

  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

export async function terminateOCRWorker(): Promise<void> {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
    isReady = false;
  }
}
