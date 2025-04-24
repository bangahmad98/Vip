self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("sholat-cache").then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./icon.png",
        "./adzan_biasa.mp3",
        "./adzan_subuh.mp3"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
