const CACHE_NAME='black-box-v1';const urlsToCache=['/manifest.json','/icon-192.png','/icon-512x512.png','/avatars/f1.jpg.png'];self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)).then(()=>self.skipWaiting()))});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(cacheNames=>Promise.all(cacheNames.map(cacheName=>{if(cacheName!==CACHE_NAME)return caches.delete(cacheName)}))).then(()=>self.clients.claim()))});self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(response=>response||fetch(e.request)))});



// ███╗   ██╗███████╗██╗     ██╗██╗███╗   ██╗
// ████╗  ██║██╔════╝██║     ██║██║████╗  ██║
// ██╔██╗ ██║█████╗  ██║     ██║██║██╔██╗ ██║
// ██║╚██╗██║██╔══╝  ██║     ██║██║██║╚██╗██║
// ██║ ╚████║███████╗███████╗██║██║██║ ╚████║
// ╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚═╝╚═╝  ╚═══╝
//                    K E L V I N



