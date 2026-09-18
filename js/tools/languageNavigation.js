// Resolve language links from the address bar, including after Swup navigation.
(() => {
  'use strict';
  const data = document.getElementById('language-page-translations');
  if (!data) return;
  const translations = JSON.parse(data.textContent);
  const roots = { en: '/', 'zh-CN': '/zh/', de: '/de/' };
  const messages = {
    en: 'This page is not available in this language yet',
    'zh-CN': '当前页面暂无此语言版本',
    de: 'Diese Seite ist in dieser Sprache noch nicht verfügbar',
  };
  const normalize = value => {
    try { value = decodeURIComponent(value); } catch (_) { /* Leave invalid escapes unmatched. */ }
    return value.replace(/^\/+/, '').replace(/index\.html$/, '').replace(/\/+$/, '');
  };
  function currentPage() {
    const pathname = window.location.pathname;
    const language = /^\/zh(?:\/|$)/.test(pathname) ? 'zh-CN' : /^\/de(?:\/|$)/.test(pathname) ? 'de' : 'en';
    const page = normalize(language === 'en' ? pathname : pathname.replace(/^\/(zh|de)(?=\/|$)/, ''));
    return { language, page };
  }
  function linkLanguage(link) {
    if (!link.closest('.navbar-container')) return null;
    const declared = link.getAttribute('hreflang');
    if (Object.hasOwn(roots, declared)) return declared;
    // Repair older cached menus too, which only contain absolute home links.
    const href = link.getAttribute('href');
    if (!href || !/^https?:\/\//.test(href)) return null;
    const url = new URL(href);
    if (!['elecannonic.com', 'elecannonic.github.io'].includes(url.hostname) || url.search || url.hash) return null;
    return Object.keys(roots).find(language => normalize(roots[language]) === normalize(url.pathname)) || null;
  }
  function updateLink(link) {
    const target = linkLanguage(link);
    if (!target) return false;
    const current = currentPage();
    const row = translations.find(entry => typeof entry[current.language] === 'string' && normalize(entry[current.language]) === current.page);
    const translated = target === current.language ? current.page : row?.[target];
    link.setAttribute('hreflang', target);
    link.setAttribute('data-no-swup', '');
    if (typeof translated !== 'string') {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('role', 'link');
      link.setAttribute('title', messages[current.language]);
      link.style.opacity = '0.5';
      link.style.cursor = 'not-allowed';
    } else {
      const route = normalize(translated);
      link.setAttribute('href', encodeURI(roots[target] + route + (route && !/\.html$/.test(route) ? '/' : '')));
      link.removeAttribute('aria-disabled');
      link.removeAttribute('role');
      link.removeAttribute('title');
      link.style.removeProperty('opacity');
      link.style.removeProperty('cursor');
    }
    return true;
  }
  function refresh() {
    document.querySelectorAll('.navbar-container a').forEach(updateLink);
  }
  function prepare(event) {
    const link = event.target.closest?.('a');
    if (link) updateLink(link);
  }
  document.addEventListener('pointerover', prepare, true);
  document.addEventListener('focusin', prepare, true);
  document.addEventListener('contextmenu', prepare, true);
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a');
    if (!link || !updateLink(link)) return;
    if (!link.hasAttribute('href')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    // Use a full navigation, so language, metadata and theme configuration agree.
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(link.href);
  }, true);
  window.addEventListener('popstate', refresh);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh);
  else refresh();
  if (typeof swup !== 'undefined') swup.hooks.on('page:view', refresh);
})();
