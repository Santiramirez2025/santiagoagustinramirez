/* sw.js — Service Worker (PWA). Network-first en páginas, cache-first en assets, nunca /api. */
var V = 'srm-cache-v1';
var ASSETS = [
  '/', '/app/', '/reservar.html',
  '/shared/pricing.js', '/shared/stars.js', '/shared/assistant.js', '/shared/pwa.js',
  '/favicon.svg', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }).catch(function () {}));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return;   // no tocar cross-origin (Meta, MP)
  if (url.pathname.indexOf('/api/') === 0) return;    // nunca cachear la API

  if (req.mode === 'navigate' || req.destination === 'document') {
    // Network-first para HTML: siempre fresco online, cache como fallback offline.
    e.respondWith(
      fetch(req).then(function (r) {
        var cp = r.clone(); caches.open(V).then(function (c) { c.put(req, cp); });
        return r;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match('/'); });
      })
    );
    return;
  }

  // Cache-first para assets same-origin.
  e.respondWith(
    caches.match(req).then(function (m) {
      return m || fetch(req).then(function (r) {
        if (r && r.ok) { var cp = r.clone(); caches.open(V).then(function (c) { c.put(req, cp); }); }
        return r;
      });
    })
  );
});
