const CACHE_NAME = 'acne-ai-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './js/scan_controller.js',
    './js/face_validator.js',
    './js/lighting_validator.js',
    './js/image_quality_validator.js',
    './js/scanner_overlay.js',
    './js/warning_manager.js',
    './public/models/tiny_face_detector_model-weights_manifest.json',
    './public/models/tiny_face_detector_model-shard1',
    './public/models/face_landmark_68_model-weights_manifest.json',
    './public/models/face_landmark_68_model-shard1',
    './public/models/face_expression_model-weights_manifest.json',
    './public/models/face_expression_model-shard1',
    './manifest.json',
    './icons/icon-512.svg'
];

// Install — cache all core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching app shell v2');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Immediately activate new SW
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Take over all pages immediately
});

// Fetch — network-first for HTML/JS/CSS, cache-first for models & static assets
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    const isAppFile = url.pathname.endsWith('.html') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname === '/' ||
        url.pathname.endsWith('/');

    if (isAppFile) {
        // Network-first for app files (always get latest)
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return networkResponse;
            }).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        // Cache-first for models & static assets
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return networkResponse;
                });
            }).catch(() => caches.match('./index.html'))
        );
    }
});
