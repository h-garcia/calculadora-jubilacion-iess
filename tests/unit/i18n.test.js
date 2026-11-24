// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Alpine from 'alpinejs';
import { lookup, interpolate, translate, getInitialLang, registerI18n } from '../../assets/js/i18n.js';

describe('pure helpers', () => {
  const m = { a: { b: 'Hi {n}' }, n: 3 };
  it('lookup', () => {
    expect(lookup(m, 'a.b')).toBe('Hi {n}');
    expect(lookup(m, 'a.c')).toBeUndefined();
    expect(lookup(m, 'a')).toBeUndefined();
    expect(lookup(m, 'n')).toBeUndefined();
    expect(lookup(m, 'x.y.z')).toBeUndefined();
  });
  it('interpolate', () => {
    expect(interpolate('Hi {n} {q}', { n: 'Bob' })).toBe('Hi Bob {q}');
    expect(interpolate('Hi {n}')).toBe('Hi {n}');
    expect(interpolate('{n}', { n: 0 })).toBe('0');
  });
  it('translate', () => {
    expect(translate(m, 'a.b', { n: 'X' })).toEqual({ ok: true, text: 'Hi X' });
    expect(translate(m, 'zz')).toEqual({ ok: false, text: '⚠ missing: zz' });
  });
  it('getInitialLang', () => {
    expect(getInitialLang({ getItem: () => 'en' })).toBe('en');
    expect(getInitialLang({ getItem: () => 'es' })).toBe('es');
    expect(getInitialLang({ getItem: () => 'fr' })).toBe('es');
    expect(getInitialLang({ getItem: () => { throw new Error('no'); } })).toBe('es');
    expect(getInitialLang(null)).toBe('es');
  });
});

const ES = { hello: 'Hola', rich: 'Hola <b>mundo</b>', p: 'Hola {n}' };
const EN = { hello: 'Hello', rich: 'Hello <b>world</b>', p: 'Hello {n}' };
const tick = () => new Promise((r) => setTimeout(r, 0));

describe('store and directives', () => {
  let store;
  beforeEach(async () => {
    const mem = new Map();
    vi.stubGlobal('localStorage', { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), clear: () => mem.clear() });
    document.documentElement.lang = '';
    document.body.innerHTML = `<div x-data>
      <p id="a" x-t="'hello'"></p>
      <p id="b" x-t.html="'rich'"></p>
      <p id="c" x-t="['p', {n: 'Ana'}]"></p>
      <p id="d" x-t="'nope.key'"></p>
      <p id="e" :title="$t('hello')"></p>
      <p id="f" x-t="'<img>'"></p></div>`;
    globalThis.fetch = vi.fn(async (url) => {
      const lang = String(url).endsWith('en.json') ? EN : ES;
      return { ok: true, json: async () => lang };
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    registerI18n(Alpine, { messagesBaseUrl: 'http://localhost/i18n/' });
    store = Alpine.store('i18n');
    await store.load();
    if (!window.__alpineStarted) {
      window.__alpineStarted = true;
      Alpine.start();
    } else {
      Alpine.initTree(document.body);
    }
    await tick();
  });

  it('renders text, html, params, attribute magic', () => {
    expect(document.getElementById('a').textContent).toBe('Hola');
    expect(document.getElementById('b').innerHTML).toBe('Hola <b>mundo</b>');
    expect(document.getElementById('c').textContent).toBe('Hola Ana');
    expect(document.getElementById('e').getAttribute('title')).toBe('Hola');
    expect(document.documentElement.lang).toBe('es');
  });

  it('toggling re-renders, sets html lang, persists, caches', async () => {
    store.toggle();
    await tick(); await tick();
    expect(store.lang).toBe('en');
    expect(document.getElementById('a').textContent).toBe('Hello');
    expect(document.getElementById('b').innerHTML).toBe('Hello <b>world</b>');
    expect(document.getElementById('e').getAttribute('title')).toBe('Hello');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('iess-lang')).toBe('en');
    const calls = fetch.mock.calls.length;
    await store.setLang('es');
    await store.setLang('en');
    expect(fetch.mock.calls.length).toBe(calls);
  });

  it('missing key renders marker and logs', () => {
    const span = document.getElementById('d').querySelector('span.i18n-missing');
    expect(span.textContent).toBe('⚠ missing: nope.key');
    expect(console.error).toHaveBeenCalled();
    expect(store.t('nope.key')).toBe('⚠ missing: nope.key');
  });

  it('escapes key in marker', () => {
    const f = document.getElementById('f');
    expect(f.querySelector('img')).toBeNull();
    expect(f.textContent).toContain('<img>');
  });
});
