export function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
// STANDALONE = PWA APP
export function isInStandaloneMode() {
    if (isIos()) {
        return window.navigator.standalone === true;
    }

    return window.matchMedia("(display-mode: standalone)").matches;
}

// MULTICLICK detection (for hidden reset)
export function multiClick(element, callback) {
    let count = 0;
    let timer = null;
    let clicksRequired = 5;
    let delay = 600;

    element.addEventListener("click", () => {
        count++;

        clearTimeout(timer);

        if (count >= clicksRequired) {
            count = 0;
            callback();
            return;
        }

        timer = setTimeout(() => {
            count = 0;
        }, delay);
    });
}