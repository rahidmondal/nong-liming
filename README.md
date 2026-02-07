# Nong LiMing

Nong LiMing is a friendly, focused "Indic-Thai Bridge" PWA that helps you learn Thai faster by leaning on what you
already know: Indic-script phonetics for sound accuracy and English SVO grammar for sentence logic. The app is built for
short, consistent study blocks, turning 15-minute sessions into meaningful progress toward advanced, real-world fluency.

## Tech Stack

- React (Vite): App UI and fast dev build pipeline
- TypeScript (Strict Mode): Safer, more predictable code
- Tailwind CSS v4: Utility-first styling with a flat CSS import
- Vite PWA: Service worker, manifest, and offline readiness
- Dexie: IndexedDB wrapper for local-first learning data
- Lucide React: Icon set for crisp UI icons
- Zustand: Lightweight state management
- Sarabun (Google Fonts): Authentic Thai typography

## Scripts

```bash
pnpm dev       # Dev server
pnpm build     # Production build
pnpm test      # Run tests
pnpm lint      # ESLint
pnpm format    # Prettier
```

## Architecture

```
src/
  /types         # Domain types
  /data          # Static data (consonants, vocabulary)
  /features      # Feature modules (alphabet, vocabulary, grammar)
  /components    # Shared UI components
  /hooks         # Custom hooks
  /store         # Zustand stores
```

## Features

- **Varnamala Grid** — Thai consonants mapped to Hindi/Sanskrit equivalents with class-based styling (mid/high/low)
