// SW version 0.2.0.9
let APP_VERSION = null;
let CACHE_NAME = null;

function getCacheName(version) {
    return `flashy-v${version}`;
}

const APP_SHELL = [
    "./",
    "./index.html",

    "./css/base.css",
    "./css/components.css",
    "./css/header.css",
    "./css/card.css",

    "./js/app.js",
    "./js/state.js",
    "./js/decks.js",
    "./js/scheduler.js",
    "./js/imageLoader.js",
    "./js/ui.js",
    "./js/zoom.js",
    "./js/utilities.js",

    "./data/cards.js",

    "./images/placeholder_image_not_found.png"
];

// INSTALL: cache core app shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            try{
                const res = await fetch("./data/version.json", { cache: "no-store" });
                const data = await res.json();
                APP_VERSION = data.version;
                CACHE_NAME = getCacheName(APP_VERSION);
            }catch{
                APP_VERSION = "unknown";
                CACHE_NAME = "flashy-fallback";
            }


            const cache = await caches.open(CACHE_NAME);
            await Promise.all(
                APP_SHELL.map(async (url) => {
                    try {
                        await cache.add(url);
                    } catch (err) {
                        console.warn("Failed to cache:", url);
                    }
                })
            )
        })()
    );

    self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            if (!CACHE_NAME) {
                const res = await fetch("./data/version.json", { cache: "no-store" });
                const data = await res.json();
                CACHE_NAME = getCacheName(data.version);
            }

            const keys = await caches.keys();

            if (!CACHE_NAME) {
                CACHE_NAME = keys.find(k => k.startsWith("flashy-v"));
            }

            await Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })()
    );

    self.clients.claim();
});

// FETCH: runtime caching
self.addEventListener("fetch", (event) => {
    const request = event.request;

    event.respondWith(
        (async () => {
            if (!CACHE_NAME) {
                const keys = await caches.keys();
                CACHE_NAME = keys.find(k => k.startsWith("flashy-v"));
            }

            const cache = await caches.open(CACHE_NAME);

            if (request.destination === "image") {
                const cached = await cache.match(request);
                if (cached) return cached;

                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000);

                    const response = await fetch(request, { signal: controller.signal });

                    clearTimeout(timeout);
                    cache.put(request, response.clone());

                    return response;
                } catch {
                    return cache.match("./images/placeholder_image_not_found.png");
                }
            }

            try {
                const fresh = await fetch(request);

                if (
                    request.destination === "script" ||
                    request.url.includes("/data/")
                ) {
                    if (fresh.ok) {
                        await cache.put(request, fresh.clone());
                    }
                }

                return fresh;
            } catch {
                return cache.match(request);
            }
        })()
    );
});

self.addEventListener("message", (event) => {
    if (event.data === "SKIP_WAITING") {
        self.skipWaiting();
    }
});