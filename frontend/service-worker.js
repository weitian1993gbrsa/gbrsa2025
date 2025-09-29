self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { clients.claim(); });
// (Optional) Add caching later if desired


function forceRepaint() {
  document.body.classList.add("hidden");
  void document.body.offsetHeight;
  document.body.classList.remove("hidden");
}
