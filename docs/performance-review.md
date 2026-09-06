# Performance pass — 6 September 2026

The original production entry imported every screen, including charts, handwriting/OCR, Anki parsing and backup tools. Home also automatically loaded the separate Three.js model. Startup now loads the shared app shell and home, while feature screens and expensive tools load when opened.

## Measured production artifacts

| Measure | Before | After |
| --- | ---: | ---: |
| Startup JavaScript, minified bytes | 1,347,443 | 618,090 |
| Startup JavaScript, Node gzip bytes | 405,016 | 195,145 |
| Three.js/model download on home | Automatic | Only after Explore in 3D |

Startup JavaScript is 54% smaller; compressed bytes are approximately 52% smaller. These are build sizes, not measured page-load times, responsiveness scores or claims of a percentage speedup. Baseline and generated results are saved in `performance-baseline.json` and `performance-results.json`.

## Changes

- Feature routes use React lazy imports with a loading state. Navigation remains available. A failed page load shows a reload action instead of a blank screen.
- Profile loads the retention chart only when expanded. Builder loads handwriting/OCR when Writing Pad is selected. Anki parsing and backup code load when the corresponding action starts.
- Home shows the existing vector architecture immediately. Three.js starts only after Explore in 3D; rendering remains event-driven and resources are disposed on exit.
- Service-worker registration waits for window load. Study JavaScript remains precached so route splitting does not remove it from the offline installation. The optional 3D chunk is excluded from installation and uses the existing runtime cache after viewing.
- Original custom logo, favicon and PWA icon artwork remain preserved.

## Verification and limits

All 232 tests across 28 files, TypeScript, source ESLint and production/PWA generation passed. New loading-boundary tests cover pending and failed imports; renderer tests confirm no GPU mount before interaction. The production preview was used to check navigation, chart expansion and the deferred tools.

After building, run `node scripts/check-performance.mjs` (also `pnpm check:performance`). It follows the manifest's static dependency graph, enforces a 700 KB startup JavaScript budget, checks that heavy tools stay outside their parent page's eager graph, and verifies all study JS chunks appear in the generated service-worker precache while the optional 3D chunk does not. It regenerates the results JSON.

The offline check verifies generated cache contents, not a physically disconnected browser. The full offline installation still downloads study chunks in the background; its byte reduction is not 54%. Optional 3D needs a first successful online load before it can be cached. OCR model downloads and system TTS availability retain their existing external requirements. The main and Three.js chunks still trigger Vite's 500 KB warning. Physical low-end phone timings, slow-network measurements and memory profiling remain future measurements.
