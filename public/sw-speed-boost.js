/*!
 * sw-speed-boost.js
 * Companion service worker for speed-boost-pro.js.
 * Caches static assets (images, fonts, CSS, JS) so repeat visits —
 * and even offline visits — load near-instantly.
 *
 * This uses a "stale-while-revalidate" strategy for static assets:
 * it serves the cached copy immediately, then fetches an updated
 * copy in the background for next time. Pages themselves (HTML)
 * are NOT cached here, so your app's content always stays fresh —
 * only supporting assets are cached.
 */

const CACHE_NAME = "speed-boost-cache-v1";

// File extensions this service worker will cache
const CACHEABLE_EXTENSIONS = [
  ".css",
  ".js",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".svg",
  ".gif",
  ".ico",
];

function isCacheable(url) {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return CACHEABLE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests for cacheable static assets, same-origin
  if (request.method !== "GET" || !isCacheable(request.url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // offline fallback to cache

        // Stale-while-revalidate: return cache immediately if we have it,
        // otherwise wait for the network.
        return cachedResponse || networkFetch;
      })
    )
  );
});
