# Engagement and quality review — 6 September 2026

The main product problem was a weak connection between daily study and using Thai. The home page led into deck selection, tools were disconnected, and parts of the interface treated activity as evidence of learning. The revised flow starts with an authored lesson and ends with a result tied to the exercises actually attempted.

## Course delivered

| Pace | Content | Review structure |
| --- | --- | --- |
| 30 study days | 30 core lessons | Lessons can be replayed freely |
| 45 study days | 30 core lessons + 15 recall days | A selected lesson reviewed after each pair |
| 60 study days | 30 core lessons + 30 recall days | Three lessons followed by three recall days |

The course interleaves all 44 consonants and 32 traditional vowel representations with five everyday dialogue topics, numbers, tone rules, reading, and a final checkpoint. Rare and obsolete symbols are identified. Each lesson contains teaching notes, a specific outcome, and choice or construction exercises. Durations are study days, not calendar deadlines or a promise of fluency. The 10-minute label is a planning estimate, not measured learner time.

Opening a lesson does not complete it. Wrong answers receive explanations and a retry. Hints and previous mistakes are retained when calculating independent answers. Progress is saved before advancing; unfinished exercises and feedback survive reloads. Changing course pace retains shared lesson identities. Profile now shows course completion and clearly identifies the separate flashcard statistics.

## Confirmed issues addressed

| Area | Earlier behavior | Change |
| --- | --- | --- |
| Home and learning path | Daily CTA opened decks; legacy map could award progress on click | Direct next lesson, persistent course path; old path route uses the course |
| Tutorial | Four home stops; close marked done; replay did not navigate; lifecycle failed under StrictMode | Fifteen stops across actual routes; waits for targets; retry when unavailable; explicit Finish; immediate replay; deep links preserved |
| Thai reference | Incorrect classes for ซ and ผ; incorrect tone-mark explanations | Corrected classes and rule explanations; accessible reference tabs |
| TTS | Local state could outlive cancelled audio, stale timers, exact-only locale matching | Shared playback ownership, cleanup and locale matching; Thai voice status and test/stop in Settings |
| Tone quiz | Silent graded task when no Thai voice; pending advancement after exit | Availability gate and written-practice link; timer cleanup and duplicate-answer guard |
| Dialogues | Duplicate/stale lines after restart or StrictMode; zero exchanges saved; premature completion | Session guard, real response history, completion after successful save, explicit retry |
| Word builder | Naive concatenation produced กะบ and โคะน; tone order could be wrong; declared arbitrary output valid | Supported open/closed spelling templates; correct combining-sign order; unsupported cases explained; no vocabulary-validation claim |
| Writing pad | Window resize erased drawing without clearing its state | Stable bitmap with scaled pointer coordinates; undo survives resize |
| Thai text splitting | Some vowel signs disappeared from OCR feedback, e.g. น้ำ and เข้า | Lossless grapheme segmentation with codepoint fallback |
| Feedback wording | OCR confidence and challenge copy implied stronger accuracy checks | OCR confidence explained; unsupported correctness/accuracy claims removed |
| Backup/reset | New course could be omitted | Course progress and user settings included, legacy imports supported, validation before mutation, transactional restore and reset |

## Visual changes

Home and lesson intros use lightweight vector illustrations for script, conversations, and tones. Main navigation and practice tools use Thai wat, sala pavilion, lotus, temple bell, and folded-manuscript motifs. The oversized decorative circle and repeated watermark were removed. The requested palette is a bright BTS-inspired purple (`#8A2BE2`), lavender, and neutral backgrounds. The lesson CTA appears before the pace selector. Existing Thai script remains text rather than being baked into images, except decorative artwork labels.

The latest architecture follows the user's supplied photographs: steep overlapping gables, ornate entrances, colonnades and broad terraces. The rejected detached spire and stacked-roof silhouettes were replaced. Home now includes an original Three.js architectural model with pointer rotation, keyboard-accessible rotation/reset buttons, and a static SVG fallback. It loads in a separate chunk, renders on demand without an animation loop, caps pixel density, and disposes GPU resources on navigation or context loss. These are architectural studies, not exact landmark reconstructions.

Reviewed [vgpu](https://vgpu.sh/), which provides WebGPU shader tooling. This implementation uses Three.js directly; vgpu is not installed or integrated. A second GPU rendering system was unnecessary for the geometry-based model.

The theme sweep covers Reading, Dictionary, Builder, reference categories and charts, conversations, flashcards, rewards, profile, onboarding, settings and tutorial popovers. Shared chart colors adapt to light/dark mode. Decorative feature icons use the Thai manuscript, sala, temple, bell, lotus, script and kanok family; functional controls retain familiar action symbols. Error/warning indicators and the actual colors in cultural photographs remain intentional. The user's custom Nong LiMing artwork must not be redesigned. Following the user's color-matching feedback, the header uses `logo-purple.svg`, a color-only variant of the original app icon with identical geometry. The original favicon, installed-app icons and source artwork remain preserved.

## Validation

- 232 tests passed across 28 files after the performance pass, including lazy-loading recovery, opt-in 3D, activity deduplication, explicit practice confirmation, tone-save retries, aggregation, full practice backups, and clear-history coverage.
- TypeScript passed. The full source ESLint check passed after illustration interpolation fixes.
- Production build and PWA generation passed. Startup JavaScript fell from 1,347,443 to 618,090 bytes (54% smaller); Node gzip sizes fell from 405,016 to 195,145 bytes. The 577 KB temple chunk now loads only after choosing Explore in 3D. Large-chunk warnings remain; these are artifact measurements, not device speed measurements. See `performance-review.md`.
- Browser walkthrough verified wrong-answer correction, phrase construction, reload/resume, completed independent/support counts, pace persistence, the complete 15-stop cross-route tour, and Thai speech starting from Settings.
- Desktop light/dark layouts were inspected during implementation. Writing resize behavior is covered by component tests; this was not a full physical-device accessibility audit.

## Remaining limits and next priorities

1. Recall days reuse taught questions with changed ordering. Add new transfer questions and delayed retention checks before claiming mastery.
2. TTS depends on installed system voices; no native-speaker recordings, pronunciation scoring, or proven tone-perception assessment is included. Have a fluent Thai educator review the authored curriculum and audio examples.
3. The word builder arranges supported spelling patterns; it does not validate dictionary membership or every Thai spelling exception. OCR confidence is not handwriting accuracy.
4. Profile now combines all practice sources. Tone answers persist individually; reading, sentences and syllables have explicit daily practice entries. Existing dialogue and writing records are included with their original units. Backups cover every IndexedDB table, including practice and rewards; appearance, tutorial and onboarding localStorage preferences remain device-local. Older course, dialogue and handwriting records retain only their latest date per item, so the UI does not invent a complete historical timeline. Flashcard streaks and rewards remain explicitly tied to their existing activities.
5. Onboarding name and motivation are not yet used to personalize the course. Reading and conversation banks remain small. Measure actual return-to-study and unaided performance before attributing an engagement improvement to the redesign.
6. Route and heavy-library splitting is implemented, with a build budget and generated offline-precache checks. Physical low-end phone timings and a network-disconnected browser audit remain unmeasured.

## Research basis

The research report in `ideas/engagement-review-2026-09-06.md` contains the detailed system study and research appendix. Useful primary references include [Nation's four strands](https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf), [W3C Thai script resources](https://www.w3.org/TR/thai-lreq/), [Thai tone training research](https://link.springer.com/article/10.1186/1471-2202-9-53), and [the Siam Society tone-rule reference](https://thesiamsociety.org/wp-content/uploads/1978/03/JSS_066_1k_Baldwin_VisualAidForRememberingThaiToneRules.pdf). The educational structure is an application of these ideas, not a tested claim that this app produces fluency in a fixed number of days.
