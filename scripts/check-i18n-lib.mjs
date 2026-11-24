// Checks that es.json and en.json are valid and match each other.

export function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys.push(...flattenKeys(v, path));
    else keys.push(path);
  }
  return keys;
}

function getPath(obj, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function placeholders(str) {
  return [...new Set([...str.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
}

export function checkTranslations({ es, en }) {
  const errors = [];
  const parsed = {};
  for (const [name, text] of [['es', es], ['en', en]]) {
    try {
      parsed[name] = JSON.parse(text);
    } catch (e) {
      errors.push(`✗ ${name}.json is not valid JSON: ${e.message}`);
    }
  }
  if (!parsed.es || !parsed.en) return { ok: false, errors };

  const keys = { es: flattenKeys(parsed.es), en: flattenKeys(parsed.en) };
  const sets = { es: new Set(keys.es), en: new Set(keys.en) };
  for (const [from, to] of [['es', 'en'], ['en', 'es']]) {
    for (const k of keys[from]) {
      if (!sets[to].has(k)) errors.push(`✗ ${to}.json is missing key "${k}" (present in ${from}.json)`);
    }
  }

  for (const name of ['es', 'en']) {
    for (const k of keys[name]) {
      const v = getPath(parsed[name], k);
      if (typeof v !== 'string') errors.push(`✗ ${name}.json: "${k}" must be text, but it is not`);
      else if (v.trim() === '') errors.push(`✗ ${name}.json: "${k}" is empty`);
    }
  }

  for (const k of keys.es) {
    if (!sets.en.has(k)) continue;
    const a = getPath(parsed.es, k);
    const b = getPath(parsed.en, k);
    if (typeof a !== 'string' || typeof b !== 'string') continue;
    const pa = placeholders(a);
    const pb = placeholders(b);
    if (pa.join() !== pb.join()) {
      errors.push(
        `✗ "${k}" uses different {placeholders}: es.json has [${pa.join(', ')}], en.json has [${pb.join(', ')}]`
      );
    }
  }

  return { ok: errors.length === 0, errors };
}
