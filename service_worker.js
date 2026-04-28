const CACHE_NAME = "flashy-v1";

const APP_SHELL = [
    "./",
    "./index.html",
    "./css/base.css",
    "./css/card.css",
    "./js/app.js",
    "./js/state.js",
    "./js/decks.js",
    "./js/ui.js",
    "./js/scheduler.js",
    "./js/zoom.js",
    "./data/cards.js",
    "./images/placeholder_image_not_found.png"
];

// INSTALL: cache core app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL);
        })
    );
});

// ACTIVATE: clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// FETCH: runtime caching
self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.destination === "image") {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;

                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000);
                    const response = await fetch(request, { signal: controller.signal });
                    clearTimeout(timeout);
                    cache.put(request, response.clone());
                    return response;

                } catch (err) {
                    return cache.match("./images/placeholder_image_not_found.png");
                }
            })
        );
        return;
    }
    
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});