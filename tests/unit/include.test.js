// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveIncludes } from '../../assets/js/include.js';

const mkFetch = (files) => vi.fn(async (url) => {
  const key = Object.keys(files).find((k) => String(url).endsWith(k));
  if (!key) return { ok: false, status: 404, text: async () => '' };
  return { ok: true, status: 200, text: async () => files[key] };
});

beforeEach(() => {
  document.documentElement.dataset.root = '../';
  document.body.innerHTML = '';
});

describe('resolveIncludes', () => {
  it('replaces placeholder with fragment, no wrapper, and {{root}}', async () => {
    document.body.innerHTML = '<div id="x"><div data-include="a/n.html"></div></div>';
    const f = mkFetch({ 'a/n.html': '<nav><a href="{{root}}x.html">X</a></nav><p>hi</p>' });
    await resolveIncludes(document, { fetchImpl: f });
    expect(document.querySelector('[data-include]')).toBeNull();
    expect(document.getElementById('x').children.length).toBe(2);
    expect(document.querySelector('nav a').getAttribute('href')).toBe('../x.html');
    expect(String(f.mock.calls[0][0])).toBe('http://localhost:3000/a/n.html');
  });

  it('prefixes ids and references', async () => {
    document.body.innerHTML = '<div data-include="f.html" data-id-prefix="ds-"></div>';
    const f = mkFetch({ 'f.html': '<label for="a">L</label><input id="a"><div id="b" aria-controls="a" aria-labelledby="a b" aria-describedby="b"></div><a href="#a">l</a><a href="#zzz">o</a><a href="http://x/#a">e</a>' });
    await resolveIncludes(document, { fetchImpl: f });
    expect(document.getElementById('ds-a')).not.toBeNull();
    expect(document.querySelector('label').getAttribute('for')).toBe('ds-a');
    const b = document.getElementById('ds-b');
    expect(b.getAttribute('aria-controls')).toBe('ds-a');
    expect(b.getAttribute('aria-labelledby')).toBe('ds-a ds-b');
    expect(b.getAttribute('aria-describedby')).toBe('ds-b');
    const as = document.querySelectorAll('a');
    expect(as[0].getAttribute('href')).toBe('#ds-a');
    expect(as[1].getAttribute('href')).toBe('#zzz');
    expect(as[2].getAttribute('href')).toBe('http://x/#a');
  });

  it('resolves nested includes', async () => {
    document.body.innerHTML = '<div data-include="o.html"></div>';
    const f = mkFetch({ 'o.html': '<section><div data-include="i.html"></div></section>', 'i.html': '<b>inner {{root}}</b>' });
    await resolveIncludes(document, { fetchImpl: f });
    expect(document.querySelector('section b').textContent).toBe('inner ../');
  });

  it('stops infinite loops at depth 5', async () => {
    document.body.innerHTML = '<div data-include="l.html"></div>';
    const f = mkFetch({ 'l.html': '<div data-include="l.html"></div>' });
    await resolveIncludes(document, { fetchImpl: f });
    expect(f.mock.calls.length).toBe(5);
  });

  it('shows error on failure', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    document.body.innerHTML = '<div data-include="nope.html"></div>';
    await resolveIncludes(document, { fetchImpl: mkFetch({}) });
    expect(document.querySelector('.include-error').textContent).toBe('Include failed: nope.html');
    expect(err).toHaveBeenCalled();
  });

  it('works with empty root', async () => {
    document.documentElement.dataset.root = '';
    document.body.innerHTML = '<div data-include="p.html"></div>';
    await resolveIncludes(document, { fetchImpl: mkFetch({ 'p.html': '<i>{{root}}ok</i>' }) });
    expect(document.querySelector('i').textContent).toBe('ok');
  });
});
