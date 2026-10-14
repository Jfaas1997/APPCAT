/* App de Obra: guarda a app no telemóvel para abrir sem rede. Mudar VERSAO quando a app muda. */
const VERSAO='appobra-v1.9';
const FICHEIROS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-mask.png','./logo.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(FICHEIROS)).then(()=>self.skipWaiting())) });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener('fetch',e=>{ if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{ const c=r.clone(); caches.open(VERSAO).then(x=>x.put(e.request,c)); return r }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))) });
