// InnGéo — service worker
// v9 : le fichier précédent était une image PNG (corrompu au dépôt), donc
// l'enregistrement échouait et un ancien cache pouvait servir une vieille
// version de l'application.
const CACHE = 'inngeo-v9';
const FICHIERS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => { if (e.data && e.data.action === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // jamais les écritures
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;        // jamais Supabase ni les CDN
  // Réseau d'abord : on a toujours la dernière version, le cache sert de secours hors ligne.
  e.respondWith(
    fetch(req).then(rep => {
      const copie = rep.clone();
      caches.open(CACHE).then(c => c.put(req, copie)).catch(() => {});
      return rep;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
