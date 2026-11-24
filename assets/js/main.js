// Entry point for every page: i18n -> components -> partials -> translations -> start.
import Alpine from 'https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/dist/module.esm.js';
import { registerI18n } from './i18n.js';
import { resolveIncludes } from './include.js';
import { tabs, rulesTables, calculator, siteInfo } from './components.js';

window.Alpine = Alpine;

registerI18n(Alpine, { messagesBaseUrl: new URL('../../i18n/', import.meta.url).href });

Alpine.data('tabs', tabs);
Alpine.data('rulesTables', rulesTables);
Alpine.data('calculator', calculator);
Alpine.data('siteInfo', siteInfo);

const META_KEYS = {
  home: 'landing.meta',
  calculator: 'calc.meta',
  'design-system': 'designSystem.meta',
};

// Keep <title> and the meta description in the selected language.
function syncMeta() {
  const base = META_KEYS[document.documentElement.dataset.page];
  if (!base) return;
  Alpine.effect(() => {
    const i18n = Alpine.store('i18n');
    if (!i18n.ready) return;
    document.title = i18n.t(base + '.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', i18n.t(base + '.description'));
  });
}

await resolveIncludes();
try {
  await Alpine.store('i18n').load();
} catch (e) {
  console.error('[i18n] could not load translations', e);
}
Alpine.start();
syncMeta();
