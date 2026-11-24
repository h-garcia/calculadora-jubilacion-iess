// Usage: node scripts/check-i18n.mjs [path/es.json path/en.json]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';
import { checkTranslations, flattenKeys } from './check-i18n-lib.mjs';

const root = new URL('../', import.meta.url);
const [esPath, enPath] = process.argv.length >= 4
  ? [process.argv[2], process.argv[3]]
  : [fileURLToPath(new URL('i18n/es.json', root)), fileURLToPath(new URL('i18n/en.json', root))];

let es, en;
try {
  es = readFileSync(esPath, 'utf8');
  en = readFileSync(enPath, 'utf8');
} catch (e) {
  console.error(`✗ Could not read translation file: ${e.message}`);
  process.exit(1);
}

const result = checkTranslations({ es, en });
if (!result.ok) {
  // When custom paths are given, show their real file names in messages.
  const rename = (s) => s.replaceAll('es.json', basename(esPath)).replaceAll('en.json', basename(enPath));
  console.log('Translation problems found:\n');
  for (const err of result.errors) console.log(process.argv.length >= 4 ? rename(err) : err);
  console.log(`\n${result.errors.length} problem(s). Fix them in the i18n/ folder and run again.`);
  process.exit(1);
}
console.log(`✓ Translation files OK (${flattenKeys(JSON.parse(es)).length} keys)`);
