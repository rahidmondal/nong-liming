# Unified practice progress

Continue in the current app checkout, preserving the existing course and artwork.

1. Add a persistent activity table for tone answers, reading practice, sentence rehearsal and syllable practice. Stable action IDs prevent duplicate records on retries. Record self-reported practice separately from checked tone answers.
2. Build a Profile overview from these activities and the existing course, flashcard, dialogue and handwriting tables. Keep their original units: course completions, reviews, completed dialogues, recognized-character attempts and practice entries. Opening a tool earns nothing. Do not infer fluency or rewrite old history.
3. Include all IndexedDB practice/reward tables in exports, validate them before import, restore atomically, and preserve optional tables missing from older backups. Clear Study History must cover the newly unified history consistently.
4. Verify retry/deduplication, failed saves, aggregation, backup round trips and malformed imports; inspect the Profile and practice flows in the browser.

This phase does not publish the app, create native audio, or claim full historical dates where legacy tables retained only their latest result. Content expansion and route-performance work follow separately.

## Completed

- Profile combines eight activity categories with accurate units and a recent-record list.
- Tone answers save before advancing, with stable retry IDs; reading, sentences and syllables save once per item per local calendar day.
- Backups capture a consistent read transaction, include every practice/reward table, validate optional records and restore atomically. Legacy backups preserve optional tables they do not contain.
- Clear Study History clears the complete history and rewards in one transaction while keeping decks, card schedules and preferences. Its confirmation names the affected data.
- 230 tests pass across 27 files. TypeScript, source lint and production/PWA build pass. A separate local browser origin verified reading save, reload persistence and Profile totals without changing the user's records.
- User correction: the custom app icon, maskable icon and favicon are restored exactly; keep the original Nong LiMing branding.
