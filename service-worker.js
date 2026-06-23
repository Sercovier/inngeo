// Service worker — stratégie "réseau d'abord" pour toujours avoir la dernière version.
// Le cache ne sert que de filet de secours si le réseau est coupé.
const CACHE = 'sercovier-v1';
const ESSENTIELS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESSENTIELS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Ne jamais mettre en cache les appels Supabase / API : toujours en direct.
  if (req.method !== 'GET' || /supabase|api|auth/i.test(req.url)) return;
  e.respondWith(
    fetch(req).then(res => {
      // Met à jour le cache avec la version fraîche
      const copie = res.clone();
      caches.open(CACHE).then(c => c.put(req, copie).catch(()=>{}));
      return res;
    }).catch(() => caches.match(req)) // hors-ligne : on sert la copie en cache
  );
});
