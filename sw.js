const CACHE = "gbrsa-pwa-v6";
const ASSETS = [
  "./",
  "./index.html",
  "./speed/index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
