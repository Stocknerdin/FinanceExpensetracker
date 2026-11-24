// Personal Finance Tracker — offline helper.
// The page itself: the newest copy from the internet, the saved copy when there is no connection.
// Icons: from the saved copy. Google sign-in, Drive, Gmail, fonts and the text reader always go straight to the internet.
const CACHE = 'pft-v61';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pft-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                       // Google, fonts, OCR: not touched
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
    e.respondWith(fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html').then(m => m || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(m => m || fetch(req)));
});
