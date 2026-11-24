// Injects shared HTML partials: <div data-include="path/relative/to/site/root.html"></div>

const MAX_DEPTH = 5;
const REF_ATTRS = ['for', 'aria-controls', 'aria-labelledby', 'aria-describedby'];

function prefixIds(fragment, prefix) {
  const ids = new Set();
  fragment.querySelectorAll('[id]').forEach((el) => ids.add(el.id));
  if (!ids.size) return;
  const map = (v) => v.split(/\s+/).map((t) => (ids.has(t) ? prefix + t : t)).join(' ');
  fragment.querySelectorAll('*').forEach((el) => {
    for (const a of REF_ATTRS) {
      if (el.hasAttribute(a)) el.setAttribute(a, map(el.getAttribute(a)));
    }
    const href = el.getAttribute('href');
    if (href && href.startsWith('#') && ids.has(href.slice(1))) el.setAttribute('href', '#' + prefix + href.slice(1));
  });
  fragment.querySelectorAll('[id]').forEach((el) => { el.id = prefix + el.id; });
}

export async function resolveIncludes(root = document, { fetchImpl = fetch } = {}) {
  const doc = root.ownerDocument || root;
  const siteRoot = doc.documentElement.dataset.root || '';

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const placeholders = [...root.querySelectorAll('[data-include]')];
    if (!placeholders.length) return;

    await Promise.all(placeholders.map(async (el) => {
      const path = el.getAttribute('data-include');
      try {
        const url = new URL(siteRoot + path, doc.baseURI);
        const res = await fetchImpl(url.href);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = (await res.text()).replaceAll('{{root}}', siteRoot);
        const tpl = doc.createElement('template');
        tpl.innerHTML = text;
        const prefix = el.getAttribute('data-id-prefix');
        if (prefix) prefixIds(tpl.content, prefix);
        el.replaceWith(tpl.content);
      } catch (e) {
        console.error('[include] failed', path, e);
        const err = doc.createElement('div');
        err.className = 'include-error';
        err.textContent = `Include failed: ${path}`;
        el.replaceWith(err);
      }
    }));
  }
}
