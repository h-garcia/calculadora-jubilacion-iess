import { readFileSync } from 'node:fs';

export const PAGES = [
  { name: 'home', path: '', page: 'home' },
  { name: 'calculator', path: 'calculadora/', page: 'calculator' },
  { name: 'design-system', path: 'design-system/', page: 'design-system' },
];

const load = (l) => JSON.parse(readFileSync(new URL(`../../i18n/${l}.json`, import.meta.url), 'utf8'));
export const messages = { es: load('es'), en: load('en') };

export function msg(lang, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), messages[lang]);
}

// Navigate and wait until Alpine started and translations are rendered.
export async function open(page, path, lang = 'es') {
  await page.goto(path);
  await ready(page);
  if (lang !== 'es') {
    await page.click(`#lang-toggle-${lang}`);
    await page.waitForFunction((l) => document.documentElement.lang === l, lang);
  }
}

export async function ready(page) {
  await page.waitForFunction(() =>
    document.body && !document.body.hasAttribute('x-cloak') &&
    window.Alpine && window.Alpine.store('i18n').ready);
}

export function trackConsoleErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}
