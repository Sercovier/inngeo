/* Service worker Sercovier — PWA */
const CACHE='sercovier-v4';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{ if(e.data&&e.data.action==='skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET') return;
  // Jamais de cache pour Supabase / API externes
  if(url.origin!==location.origin){ return; }
  // Navigation : réseau d'abord (app toujours à jour), cache en secours (hors-ligne)
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{
      const cp=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return r;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  // Assets : cache d'abord
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    const cp=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,cp)); return r;
  })));
});
