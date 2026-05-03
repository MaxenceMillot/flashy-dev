import { initState, cards } from "./state.js";
import { getNext, gradeCard } from "./scheduler.js";
import { loadImage, preloadAllImages, PLACEHOLDER } from "./imageLoader.js";
import { initHeaderMenu, setAnswerText, setCardImage, startLoading, stopLoading, showAnswer, showNormalMode, showSkipMode, setButtonsDisabled, fadeOut, fadeIn, el } from "./ui.js";
import { renderDecks, getSelectedDecks, setDeckChangeCallback } from "./decks.js";
import { initZoom } from "./zoom.js";
import { isInStandaloneMode, isIos } from "./utilities.js";

let current = null;
let nextCard = null;
let isTransitioning = false;
let deferredPrompt = null;
const isInStandalone = isInStandaloneMode();

// Prevent automatic prompt to install PWA app
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();

    // Save it for later
    deferredPrompt = e;
});

// REGISTER SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service_worker.js")
            .then(() => console.log("Service Worker registered"))
            .catch(err => console.error("SW registration failed:", err));
    });
}

// LOAD ICONS FROM LIBRARY
lucide.createIcons();

// HIDE DOWNLOAD BUTTON IN STANDALONE (PWA)
if(isInStandalone){
    el.btnDownload.style.display = "none";
}

// AFTER 5s PRELOAD ALL IMAGES IF PWA
setTimeout(() => {
    if (isInStandalone) {
        console.log("Preloading all images...");
        preloadAllImages();
    }
}, 5000);

// INIT
initState();
initHeaderMenu();
renderDecks(cards, el.deckContainer);
initZoom(el.img);

setTimeout(5000)

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

    // 1. Fadeout animation
    await new Promise(r => fadeOut(r));

    // 2. Start skeleton placeholder (delayed to avoid flash)
    const skeletonTimer = setTimeout(() => {
        startLoading();
    }, 80);

    // 3. Set answer text (hidden)
    current = newCard;
    setAnswerText(current);
    
    // 7. Fadein animation
    setTimeout(() => {
       new Promise(r => fadeIn(r));
    }, 80);
    // await new Promise(r => fadeIn(r));

    // 4. Load image
    const finalSrc = await loadImage(newCard.img);

    // 5. Apply image
    clearTimeout(skeletonTimer);
    setTimeout(() => {
        setCardImage(finalSrc);
        stopLoading();
    }, 80);

    // 6. standard behavior OR skip mode 
    if (finalSrc === PLACEHOLDER) {
        showSkipMode();
    } else {
        showNormalMode();
    }

    // 8. Unlock UI
    isTransitioning = false;
    setButtonsDisabled(false);

    // 9. Preload next (non-blocking)
    if (nextCard?.img) {
        loadImage(nextCard.img);
    }
}

// DECK CHANGE CALLBACK
setDeckChangeCallback(() => {
    // Invalidate next preloaded image
    nextCard = null;

    // recompute next preloaded image
    const result = getNext(getSelectedDecks());
    if (result?.nextCard?.img) {
        nextCard = result.nextCard;

        // preload correct image
        loadImage(nextCard.img);
    }
});

// EVENTS
// SHOW ANSWER BUTTON
el.btnShow.addEventListener("click", () => {
    if (el.card.classList.contains("loading")) return;
    showAnswer();
});

// GRADE BUTTON
el.gradeButtons.addEventListener("click", (e) => {
    if (isTransitioning || !current || el.card.classList.contains("loading")) return;

    const btn = e.target.closest("button");
    if (!btn) return;

    const grade = Number(btn.dataset.grade);

    gradeCard(current, grade);
    next();
});

// SKIP BUTTON
el.btnSkip.addEventListener("click", () => {
    if (isTransitioning) return;

    el.btnSkip.style.display = "none";
    next();
});

// RESET BUTTON
document.getElementById("btnReset").addEventListener("click", () => {
    if (confirm("Reset all progress?")) {
        localStorage.removeItem("cards");
        location.reload();
    }
});

// DOWNLOAD BUTTON
el.btnDownload.addEventListener("click", async () => {
    if (isIos()) {
        alert("Pour installer l'application :\n\n1. Appuyez sur le bouton “Partager”\n2. Puis sur “Ajouter à l'écran d'accueil”");
        return;
    }

    if (!deferredPrompt){
        console.error("could not trigger manual download : deferredPrompt is null")
        alert("Pour installer l'application : utilisez le menu du navigateur ( ⋮ ) puis “Ajouter à l'écran d'accueil”")
        return;
    }

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    deferredPrompt = null;
});


// START
next();