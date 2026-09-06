import { useEffect, useRef, useState } from 'react';
import { PalaceArtwork } from './PalaceArtwork';
import type { TempleController } from './templeScene';

/** The GPU module is loaded separately; studying never depends on WebGL. */
export function TempleArtifact() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<TempleController | null>(null);
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');

  useEffect(() => {
    if (!requested) return undefined;
    let cancelled = false;
    const fallback = () => {
      controller.current?.dispose();
      controller.current = null;
      if (!cancelled) setStatus('fallback');
    };
    void import('./templeScene')
      .then(({ mountTempleScene }) => {
        if (cancelled || !host.current) return;
        controller.current = mountTempleScene(host.current, fallback);
        setStatus('ready');
      })
      .catch(fallback);
    return () => {
      cancelled = true;
      controller.current?.dispose();
      controller.current = null;
    };
  }, [requested]);

  return (
    <figure className="w-40 sm:w-64 shrink-0 m-0">
      <div className="relative h-40 sm:h-52">
        {status !== 'ready' && <PalaceArtwork className="absolute inset-0 w-full h-full" />}
        <div ref={host} className="absolute inset-0" aria-label="Interactive temple model" role="img" />
      </div>
      <figcaption className="flex items-center justify-center gap-2 text-xs text-feature-foreground">
        {status === 'ready' ? (
          <>
            <button
              type="button"
              aria-label="Rotate temple left"
              onClick={() => controller.current?.rotate(-0.3)}
              className="h-9 w-9 rounded-full hover:bg-feature-foreground/15 focus-visible:outline-2"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Reset temple view"
              onClick={() => controller.current?.reset()}
              className="min-h-9 rounded-full px-2 hover:bg-feature-foreground/15 focus-visible:outline-2"
            >
              Reset view
            </button>
            <button
              type="button"
              aria-label="Rotate temple right"
              onClick={() => controller.current?.rotate(0.3)}
              className="h-9 w-9 rounded-full hover:bg-feature-foreground/15 focus-visible:outline-2"
            >
              →
            </button>
          </>
        ) : status === 'idle' ? (
          <button
            onClick={() => {
              setStatus('loading');
              setRequested(true);
            }}
            className="min-h-9 rounded-full px-3 bg-feature-foreground/10 hover:bg-feature-foreground/20 focus-visible:outline-2"
          >
            Explore in 3D
          </button>
        ) : (
          <span className="py-2">{status === 'loading' ? 'Preparing your temple…' : 'Temple illustration'}</span>
        )}
      </figcaption>
    </figure>
  );
}
