export const PLACEHOLDER = "images/placeholder_image_not_found.png";
import { cards } from "./state.js";
import { getAppVersion } from "./versionManager.js"

export function loadImage(src, { timeout = 5000, retries = 1 } = {}) {
    return new Promise((resolve) => {
        let attempts = 0;
        let finished = false;

        const failSafe = setTimeout(() => {
            if (finished) return;
            finished = true;
            console.warn("Timeout → fallback:", src);
            resolve(PLACEHOLDER);
        }, timeout);

        function tryLoad(url) {
            const img = new Image();

            img.onload = () => {
                if (finished) return;
                finished = true;
                clearTimeout(failSafe);
                resolve(url);
            };

            img.onerror = () => {
                if (finished) return;

                if (attempts < retries) {
                    attempts++;
                    console.warn("Retry image:", url);

                    setTimeout(() => {
                        tryLoad(url + "?retry=" + Date.now());
                    }, 300);
                } else {
                    finished = true;
                    clearTimeout(failSafe);
                    console.warn("Final fallback:", url);
                    resolve(PLACEHOLDER);
                }
            };

            img.src = url;
        }

        tryLoad(src);
    });
}

// PRELOAD ALL IMAGES (in cache)
export async function preloadAllImages() {
    if (!("caches" in window)) {
        console.warn("Cache API unsupported, could not preload images for PWA");
        return;
    }

    const appVersion = getAppVersion();
    const cache = await caches.open(`flashy-v${appVersion}`);
    let i = 0;

    async function queue() {
        if (i >= cards.length) {
            console.log("Preloading DONE");
            return;
        }

        const url = cards[i++].img;

        try {
            const alreadyCached = await cache.match(url);

            if (!alreadyCached) {

                const response = await fetch(url, {
                    cache: "force-cache"
                });

                if (response.ok) {
                    await cache.put(url, response.clone());
                }
            }

        } catch (err) {
            console.warn("Preload failed for:", url);
        }

        setTimeout(queue, 80);
    }

    queue();
}