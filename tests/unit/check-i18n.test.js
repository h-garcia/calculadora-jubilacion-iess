import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { flattenKeys, checkTranslations } from '../../scripts/check-i18n-lib.mjs';

const cli = fileURLToPath(new URL('../../scripts/check-i18n.mjs', import.meta.url));
const fx = (n) => fileURLToPath(new URL(`../fixtures/i18n/${n}`, import.meta.url));
const j = (o) => JSON.stringify(o);

describe('flattenKeys', () => {
  it('lists string leaves with dot paths', () => {
    expect(flattenKeys({ a: { b: 'x', c: 'y' }, d: 'z' }).sort()).toEqual(['a.b', 'a.c', 'd']);
  });
  it('honours prefix', () => {
    expect(flattenKeys({ b: 'x' }, 'a')).toEqual(['a.b']);
  });
});

describe('checkTranslations', () => {
  it('ok when identical', () => {
    expect(checkTranslations({ es: j({ a: 'x {n}' }), en: j({ a: 'y {n}' }) })).toEqual({ ok: true, errors: [] });
  });
  it('reports invalid JSON with file name', () => {
    const r = checkTranslations({ es: '{"a":', en: j({ a: 'y' }) });
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/es\.json/);
  });
  it('reports keys missing in either file', () => {
    const r = checkTranslations({ es: j({ a: 'x', b: 'x' }), en: j({ a: 'y', c: 'y' }) });
    const t = r.errors.join('\n');
    expect(t).toContain('en.json is missing key "b" (present in es.json)');
    expect(t).toContain('es.json is missing key "c" (present in en.json)');
  });
  it('reports non-string and empty leaves', () => {
    const r = checkTranslations({ es: j({ a: 1, b: '  ' }), en: j({ a: 'y', b: 'y' }) });
    const t = r.errors.join('\n');
    expect(t).toContain('"a"');
    expect(t).toContain('"b"');
    expect(r.ok).toBe(false);
  });
  it('reports placeholder mismatch', () => {
    const r = checkTranslations({ es: j({ a: 'x {n}' }), en: j({ a: 'y {m}' }) });
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toContain('"a"');
  });
});

describe('CLI', () => {
  const run = (...a) => spawnSync(process.execPath, [cli, ...a], { encoding: 'utf8' });
  it('exits 0 on ok files', () => {
    const r = run(fx('ok-es.json'), fx('ok-en.json'));
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('✓ Translation files OK (2 keys)');
  });
  it('exits 1 on missing key', () => {
    const r = run(fx('ok-es.json'), fx('missing-en.json'));
    expect(r.status).toBe(1);
    expect(r.stdout + r.stderr).toContain('✗ missing-en.json is missing key "c"');
  });
  it('exits 1 on invalid JSON', () => {
    expect(run(fx('ok-es.json'), fx('bad.json')).status).toBe(1);
  });
});
