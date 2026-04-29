const PLACEHOLDER = "images/placeholder_image_not_found.png";

export function loadImage(src, { timeout = 5000, retries = 1 } = {}) {
    return new Promise((resolve) => {

        // offline → instant fallback
        if (!navigator.onLine) {
            resolve(PLACEHOLDER);
            return;
        }

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