import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'));
const baseline = JSON.parse(readFileSync('docs/performance-baseline.json', 'utf8'));
const graph = (key, seen = new Set()) => {
  if (seen.has(key)) return seen;
  assert(manifest[key], `Missing manifest entry: ${key}`);
  seen.add(key);
  for (const dependency of manifest[key].imports ?? []) graph(dependency, seen);
  return seen;
};
const files = keys => [...keys].map(key => manifest[key].file);
const startup = files(graph('index.html'));
const forbidden = /LearningCurve|WritingPad|apkg-parser|backup-utils|templeScene|jszip/;
assert(!startup.some(file => forbidden.test(file)), 'Heavy tools leaked into the startup dependency graph');
const rawBytes = startup.reduce((sum, file) => sum + readFileSync(`dist/${file}`).length, 0);
const gzipBytes = startup.reduce((sum, file) => sum + gzipSync(readFileSync(`dist/${file}`)).length, 0);
assert(rawBytes < 700_000, `Startup JavaScript exceeded the 700 KB budget: ${rawBytes}`);

for (const [page, feature] of [['StatsPage', 'LearningCurve'], ['BuilderPage', 'WritingPad'], ['DecksPage', 'apkg-parser'], ['SettingsPage', 'backup-utils']]) {
  const key = Object.keys(manifest).find(key => manifest[key].name === page);
  assert(key, `Missing route chunk: ${page}`);
  assert(!files(graph(key)).some(file => file.includes(feature)), `${feature} loads before the user opens it`);
}

const sw = readFileSync('dist/sw.js', 'utf8');
for (const entry of Object.values(manifest)) {
  if (!entry.file.endsWith('.js')) continue;
  if (entry.name === 'templeScene') assert(!sw.includes(entry.file), 'Optional 3D should not download during app installation');
  else assert(sw.includes(entry.file), `Study code missing from offline precache: ${entry.file}`);
}
const result = { startupFiles: startup, startupBytes: rawBytes, startupGzipBytes: gzipBytes, previousStartupBytes: baseline.entryBytes, reductionPercent: Math.round((1 - rawBytes / baseline.entryBytes) * 100), note: 'Build artifact sizes, not measured device loading times. Study chunks precache after window load; optional 3D caches after use.' };
writeFileSync('docs/performance-results.json', JSON.stringify(result, null, 2) + '\n');
console.info(JSON.stringify(result, null, 2));
