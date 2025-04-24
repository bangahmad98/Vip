self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("sholat-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/adhan.js",
        "/manifest.json",
        "/adzan_subuh.mp3",
        "/adzan_biasa.mp3"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
