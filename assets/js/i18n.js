// i18n: store, x-t directive, $t magic. Styling of .i18n-missing lives in CSS.

const STORAGE_KEY = 'iess-lang';
const LANGS = ['es', 'en'];

export function lookup(messages, key) {
  let cur = messages;
  for (const part of String(key).split('.')) {
    if (cur == null || typeof cur !== 'object' || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (m, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m);
}

export function translate(messages, key, params) {
  const raw = lookup(messages, key);
  if (raw === undefined) return { ok: false, text: '⚠ missing: ' + key };
  return { ok: true, text: interpolate(raw, params) };
}

export function getInitialLang(storage) {
  try {
    const v = storage && storage.getItem(STORAGE_KEY);
    return LANGS.includes(v) ? v : 'es';
  } catch {
    return 'es';
  }
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function registerI18n(Alpine, { messagesBaseUrl }) {
  const cache = {};
  const logged = new Set();

  const store = Alpine.store('i18n', {
    lang: 'es',
    messages: {},
    ready: false,

    t(key, params) {
      const r = translate(this.messages, key, params);
      if (!r.ok) {
        const id = this.lang + ':' + key;
        if (!logged.has(id)) {
          logged.add(id);
          console.error('[i18n] missing key', key, this.lang);
        }
      }
      return r.text;
    },

    async setLang(lang) {
      if (!LANGS.includes(lang)) lang = 'es';
      if (!cache[lang]) {
        const res = await fetch(`${messagesBaseUrl}${lang}.json`);
        if (!res.ok) throw new Error(`Could not load ${lang}.json (HTTP ${res.status})`);
        cache[lang] = await res.json();
      }
      this.messages = cache[lang];
      this.lang = lang;
      this.ready = true;
      document.documentElement.lang = lang;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* ignore */ }
    },

    toggle() {
      return this.setLang(this.lang === 'es' ? 'en' : 'es');
    },

    load() {
      let storage = null;
      try { storage = localStorage; } catch { /* ignore */ }
      return this.setLang(getInitialLang(storage));
    },
  });

  Alpine.directive('t', (el, { modifiers, expression }, { effect, evaluateLater }) => {
    const html = modifiers.includes('html');
    const evaluate = evaluateLater(expression);
    effect(() => {
      evaluate((value) => {
        const s = Alpine.store('i18n');
        if (!s.ready) return;
        const [key, params] = Array.isArray(value) ? value : [value];
        const r = translate(s.messages, key, params);
        if (r.ok) {
          if (html) el.innerHTML = r.text;
          else el.textContent = r.text;
        } else {
          console.error('[i18n] missing key', key, s.lang);
          el.innerHTML = `<span class="i18n-missing">⚠ missing: ${escapeHtml(key)}</span>`;
        }
      });
    });
  });

  Alpine.magic('t', () => (key, params) => Alpine.store('i18n').t(key, params));

  return store;
}
