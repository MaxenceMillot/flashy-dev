import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { loadImage } from "./imageLoader.js";
import { initHeaderMenu, render, setCardImage, startLoading, stopLoading, showAnswer, setButtonsDisabled, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks } from "./decks.js";
import { initZoom } from "./zoom.js";

let current = null;
let nextCard = null;
let isTransitioning = false;

/*
/ DETECT PWA
*/
function isInstalledPWA() {
    return window.matchMedia("(display-mode: standalone)").matches
        || window.navigator.standalone === true;
}

/*
/ PRE LOAD AREA {
*/
// PRELOAD ALL IMAGES (in cache)
function preloadAllImages() {
    const images = cards.map(c => c.img);
    let i = 0;

    function queue() {
        if (i >= images.length) return;

        const img = new Image();
        img.src = images[i++];

        setTimeout(queue, 15);
    }

    queue();
    console.log("Preloading DONE");
}

setTimeout(() => {
    if (isInstalledPWA()) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 2000);

// SW
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service_worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("SW registration failed:", err));
    });
}
/*
/ END PRELOAD }
*/

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

// =======================
// NEXT CARD FLOW
// =======================
async function next() {
    if (isTransitioning) return;

    isTransitioning = true;
    setButtonsDisabled(true);

    const result = getNext(getSelectedDecks());
    if (!result) return;

    const newCard = nextCard || result.current;
    nextCard = result.nextCard;

    // 1. Fade OUT
    await new Promise(r => fadeOut(r));

    // 2. Render text immediately
    current = newCard;
    render(current);

    // 3. Start skeleton (delayed to avoid flash)
    const skeletonTimer = setTimeout(() => {
        startLoading();
    }, 120);

    // 4. Load image (async, controlled)
    const finalSrc = await loadImage(newCard.img);

    // 5. Apply image
    clearTimeout(skeletonTimer);
    setCardImage(finalSrc);
    stopLoading();

    // 6. Fade IN
    await new Promise(r => fadeIn(r));

    // 7. Unlock UI
    isTransitioning = false;
    setButtonsDisabled(false);

    // 8. Preload next (non-blocking)
    if (nextCard?.img) {
        loadImage(nextCard.img);
    }
}

// EVENTS
// SHOW ANSWER BUTTON
el.btnShow.addEventListener("click", () => {
    if (el.card.classList.contains("loading")) return;
    showAnswer();
});

// el.btnShow.addEventListener("click", showAnswer);

// GRADE BUTTON
el.gradeButtons.addEventListener("click", (e) => {
    if (isTransitioning || !current || el.card.classList.contains("loading")) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

// RESET BUTTON
document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// START
next();