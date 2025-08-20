self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open("food-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/manifest.json"
        // add critical assets (logo, css, etc.)
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
