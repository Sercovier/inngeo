// Service worker — "réseau d'abord" pour toujours avoir la dernière version.
// Le cache ne sert que de filet de secours quand le réseau est coupé.
const CACHE = 'sercovier-v3';
const ESSENTIELS = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  self.skipWaiting(); // s'active sans attendre
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ESSENTIELS).catch(()=>{})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k)) // efface les vieux caches
    )).then(() => self.clients.claim()) // prend le contrôle tout de suite
  );
});

// Permet à la page de forcer l'activation immédiate d'une nouvelle version.
self.addEventListener('message', e => {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Jamais de cache pour Supabase / API : toujours en direct.
  if (req.method !== 'GET' || /supabase|api|auth/i.test(req.url)) return;
  e.respondWith(
    fetch(req).then(res => {
      const copie = res.clone();
      caches.open(CACHE).then(c => c.put(req, copie).catch(()=>{}));
      return res;
    }).catch(() => caches.match(req)) // hors-ligne : copie en cache
  );
});
